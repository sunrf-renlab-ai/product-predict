// One synthetic user — drives a Playwright page via Claude tool use,
// emits Event objects as it goes, and produces a self-rated wrap-up.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import type Anthropic from "@anthropic-ai/sdk";

import type { Persona, Event, FeatureUse, ExitReason, Lang } from "./types.js";
import { personaSystemPrompt } from "./personas.js";
import { addUsage, callAgent, callJson, emptyCost, type CostTally } from "./llm.js";

const TARGET_TIMEOUT_MS = 15_000;

// Localized runtime strings for the agent loop. Event text + the per-step
// prompt are recorded into the trajectory and shown in reports, so they must
// match the run language.
function msgs(lang: Lang) {
  const en = lang === "en";
  const elapsed = (sec: number) =>
    en
      ? sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`
      : sec < 60 ? `${sec} 秒` : `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`;
  return {
    enter: (host: string, path: string) => (en ? `Entered ${host}${path}` : `进入 ${host}${path}`),
    cantOpen: (e: string) => (en ? `Page wouldn't load: ${e}` : `打不开页面：${e}`),
    wallCap: (min: number) => (en ? `Hit wall-clock safety cap (${min} min), stopping.` : `达到 wall-clock 安全上限 (${min} 分钟), 强制结束.`),
    llmFail: (e: string) => (en ? `LLM call failed: ${e}` : `LLM 调用失败：${e}`),
    toolFail: (tool: string, e: string) => (en ? `Action failed (${tool}): ${e}` : `操作失败 (${tool}): ${e}`),
    stepCap: (n: number) => (en ? `Hit step safety cap (${n}), stopping.` : `达到 step safety 上限 (${n}), 强制结束.`),
    wrapFail: (e: string) => (en ? `wrap-up failed: ${e}` : `wrap-up 失败：${e}`),
    deadClick: (why: string) => (en ? `I clicked but nothing happened${why ? ` (${why})` : ""}.` : `点了没反应${why ? `（${why}）` : ""}。`),
    deadClickRage: (why: string) => (en ? `Clicked again — still nothing${why ? ` (${why})` : ""}.` : `又点了一下, 还是没反应${why ? `（${why}）` : ""}。`),
    stepPrompt: (url: string, vw: number, vh: number, sec: number, dom: string, intent: string) =>
      en
        ? `Current URL: ${url}\n` +
          `Viewport: ${vw}x${vh}\n` +
          `Time spent so far: ${elapsed(sec)}\n` +
          `What you mainly came to do: ${intent}\n` +
          `Reminder: you are a real user, there's no "step quota" — pursue what you came for, explore naturally, and leave when it's time (you did it / got frustrated / got bored are all valid exits). If you genuinely can't find a way to do what you came for, that itself matters — note it.\n\n` +
          `The screenshot is the current page state. Simplified DOM:\n\n${dom}`
        : `当前 URL: ${url}\n` +
          `视口: ${vw}x${vh}\n` +
          `已经在这上面花了: ${elapsed(sec)}\n` +
          `你主要来想做的事: ${intent}\n` +
          `提醒: 你是真实用户, 没有"步数任务" — 围绕你来的目的走, 自然地逛, 该走就走 (做完了/沮丧了/无聊了 都是合理退出). 如果你真的找不到办法做成你来想做的事, 这本身就很重要 — 记下来.\n\n` +
          `截图为最新页面状态。简化 DOM:\n\n${dom}`,
  };
}

export type AgentResult = {
  persona: Persona;
  events: Event[];
  finished: boolean;
  truncated: boolean;             // legacy: hit safety cap
  exitReason: ExitReason;          // why the session ended
  accomplished: boolean | null;
  summary: string;
  issues: AgentIssue[];
  delights: AgentDelight[];
  features: FeatureUse[];
  durationSec: number;
  cost: CostTally;
};

export type AgentIssue = {
  title: string;
  severity: "high" | "med" | "low";
  category: string;
  quote: string;
  journey: string;
  evidence: number;
};

export type AgentDelight = {
  title: string;
  quote: string;
};

export async function runAgent(opts: {
  persona: Persona;
  browser: Browser;
  targetUrl: string;
  maxSteps: number;                // safety cap (default 30)
  maxMinutes: number;              // wall-clock safety cap per agent
  runDir: string;
  viewport: { w: number; h: number };
  lang?: Lang;                     // narration language (default "en")
}): Promise<AgentResult> {
  const { persona, browser, targetUrl, maxSteps, maxMinutes, runDir, viewport } = opts;
  const lang: Lang = opts.lang ?? "en";
  const M = msgs(lang);
  const safetyMs = maxMinutes * 60_000;
  const cost = emptyCost();
  const events: Event[] = [];
  let accomplished: boolean | null = null;
  let summary = lang === "zh" ? "(无总结)" : "(no summary)";
  let finished = false;
  let truncated = false;

  const context = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
    deviceScaleFactor: 1,
    locale: lang === "zh" ? "zh-CN" : "en-US",
  });
  const page = await context.newPage();
  const t0 = Date.now();

  try {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: TARGET_TIMEOUT_MS });
    events.push({
      t: fmtT(0),
      agent: persona.id,
      kind: "enter",
      text: M.enter(new URL(targetUrl).host, new URL(targetUrl).pathname),
      sentiment: 0,
      url: page.url(),
    });
  } catch (e) {
    events.push({
      t: fmtT(0),
      agent: persona.id,
      kind: "exit",
      text: M.cantOpen((e as Error).message),
      sentiment: -3,
    });
    await context.close().catch(() => {});
    return {
      persona,
      events,
      finished: true,
      truncated: false,
      exitReason: "crashed",
      accomplished: false,
      summary: lang === "zh" ? "目标页面打不开。" : "Target page failed to load.",
      issues: [],
      delights: [],
      features: [],
      durationSec: (Date.now() - t0) / 1000,
      cost,
    };
  }

  const system = personaSystemPrompt(persona, targetUrl, lang);
  // Arrival intent — the ONE main thing this persona came to do. Makes the
  // session goal-directed (not aimless QA touring) and, crucially, lets the
  // wrap-up flag "I came to do X and there was no way to" — the failure mode a
  // pure free-exploration agent silently skips (e.g. a missing primary CTA).
  const intent = await deriveIntent(persona, targetUrl, lang);
  const messages: Anthropic.MessageParam[] = [];

  let exitReason: ExitReason = "timeout";
  // Behavioural friction: a click that leaves URL + interactive-DOM unchanged is
  // a dead click; repeats escalate to rage. Grounds sentiment in observed
  // behaviour, not just the model's self-report.
  let prevSig = "";
  let prevWasClick = false;
  let prevClickReason = "";
  let noopStreak = 0;
  for (let step = 0; step < maxSteps; step++) {
    const elapsedMs = Date.now() - t0;
    if (elapsedMs > safetyMs) {
      events.push({
        t: fmtT(elapsedMs / 1000),
        agent: persona.id,
        kind: "exit",
        text: M.wallCap(maxMinutes),
        sentiment: -1,
      });
      break;
    }

    const t = fmtT(elapsedMs / 1000);
    const shot = await snapshot(page, runDir, persona.id, step);
    const dom = await simplifiedDom(page);

    // Did the PREVIOUS click actually do anything? URL + interactive DOM
    // unchanged ⇒ dead click. Emitted as a behavioural friction event so it
    // grounds sentiment even when the model never narrates it.
    const sig = `${page.url()}\n${dom}`;
    if (prevWasClick && prevSig && sig === prevSig) {
      noopStreak++;
      const rage = noopStreak >= 2;
      events.push({
        t,
        agent: persona.id,
        kind: rage ? "rage" : "confused",
        text: rage ? M.deadClickRage(prevClickReason) : M.deadClick(prevClickReason),
        sentiment: rage ? -2 : -1,
      });
    } else {
      noopStreak = 0;
    }
    prevSig = sig;

    // Tell the persona how long they've been at it — this is what cues a real
    // user to start wrapping up rather than grinding forever.
    const sec = Math.floor(elapsedMs / 1000);
    const userBlocks: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: shot.b64 },
      },
      {
        type: "text",
        text: M.stepPrompt(page.url(), viewport.w, viewport.h, sec, dom, intent),
      },
    ];
    messages.push({ role: "user", content: userBlocks });

    let msg: Anthropic.Message;
    try {
      msg = await callAgent({ system, messages });
    } catch (e) {
      events.push({
        t,
        agent: persona.id,
        kind: "exit",
        text: M.llmFail((e as Error).message),
        sentiment: -2,
      });
      break;
    }
    addUsage(cost, msg);
    messages.push({ role: "assistant", content: msg.content });

    const tool = msg.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!tool) {
      // Model declined to call a tool — record and bail.
      const t2 = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      events.push({ t, agent: persona.id, kind: "note", text: t2 || "(no tool)", sentiment: 0 });
      break;
    }

    // Remember this action so the NEXT step can tell whether a click did nothing.
    prevWasClick = tool.name === "click_at";
    prevClickReason = tool.name === "click_at" ? String((tool.input as Record<string, unknown>).reason ?? "") : "";

    let toolResult: string;
    let ev: Event | null = null;
    try {
      const r = await dispatch(page, tool.name, tool.input as Record<string, unknown>);
      toolResult = r.result;
      ev = r.event;
      if (ev) {
        ev.t = t;
        ev.agent = persona.id;
        if (shot.path) ev.shot = shot.path;
        events.push(ev);
      }
      if (tool.name === "finish") {
        const inp = tool.input as {
          summary: string;
          accomplished: boolean;
          reason?: "accomplished" | "frustrated" | "explored";
        };
        accomplished = inp.accomplished;
        summary = inp.summary;
        finished = true;
        // Pick exit reason from agent's self-classification if given; else infer.
        if (inp.reason) {
          exitReason = inp.reason;
        } else if (inp.accomplished) {
          exitReason = "accomplished";
        } else {
          const recent = events.slice(-8);
          const negs = recent.filter((e) => e.sentiment < -1).length;
          exitReason = negs >= 2 ? "frustrated" : "explored";
        }
        break;
      }
    } catch (e) {
      toolResult = `ERROR: ${(e as Error).message}`;
      events.push({
        t,
        agent: persona.id,
        kind: "confused",
        text: M.toolFail(tool.name, (e as Error).message),
        sentiment: -1,
      });
    }

    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: tool.id,
          content: toolResult,
          is_error: toolResult.startsWith("ERROR:"),
        },
      ],
    });
  }

  if (!finished) {
    // Hit max-steps safety cap without finish() — treat as timeout.
    truncated = true;
    if (exitReason === "timeout") {
      // already nudged by the wall-clock branch; if we got here via maxSteps,
      // log it distinctly so the report can distinguish.
      events.push({
        t: fmtT((Date.now() - t0) / 1000),
        agent: persona.id,
        kind: "exit",
        text: M.stepCap(maxSteps),
        sentiment: -1,
      });
    }
  }

  // Wrap-up pass: ask Claude (in the persona) to synthesise issues / delights
  // and ALSO catalogue which product features they actually touched.
  let issues: AgentIssue[] = [];
  let delights: AgentDelight[] = [];
  let features: FeatureUse[] = [];
  try {
    const wrap = await callJson<{
      summary?: string;
      accomplished?: boolean;
      issues: AgentIssue[];
      delights: AgentDelight[];
      featuresUsed?: FeatureUse[];
    }>({
      system,
      prompt: wrapPrompt(events, summary, accomplished, exitReason, intent, lang),
      maxTokens: 2400,
    });
    issues = wrap.issues || [];
    delights = wrap.delights || [];
    features = (wrap.featuresUsed || []).map((f) => ({
      name: String(f.name || "").trim(),
      completed: !!f.completed,
      attempts: Math.max(1, Math.round(Number(f.attempts) || 1)),
      sentiment: clamp(Number(f.sentiment) || 0, -3, 3),
    })).filter((f) => f.name);
    if (wrap.summary) summary = wrap.summary;
    if (wrap.accomplished !== undefined) accomplished = wrap.accomplished;
  } catch (e) {
    events.push({
      t: fmtT((Date.now() - t0) / 1000),
      agent: persona.id,
      kind: "note",
      text: M.wrapFail((e as Error).message),
      sentiment: 0,
    });
  }

  await context.close().catch(() => {});
  const durationSec = (Date.now() - t0) / 1000;
  return {
    persona,
    events,
    finished,
    truncated,
    exitReason,
    accomplished,
    summary,
    issues,
    delights,
    features,
    durationSec,
    cost,
  };
}

// ── Arrival intent ────────────────────────────────────────────────────────────
// One cheap LLM call before the session: the ONE main thing this persona came to
// do. Best-effort — falls back to the persona's top preference (and to that in
// mock mode, where callJson returns a wrap stub with no `intent` field).
async function deriveIntent(persona: Persona, targetUrl: string, lang: Lang): Promise<string> {
  const fallback =
    persona.preferences && persona.preferences[0]
      ? lang === "zh"
        ? `看看它能不能满足我最在意的: ${persona.preferences[0]}`
        : `see whether it does the thing I care about most: ${persona.preferences[0]}`
      : lang === "zh"
        ? "用它做这类产品最核心的那件事"
        : "do the single core thing this kind of product is for";
  try {
    const prompt =
      lang === "zh"
        ? `你正要打开 ${targetUrl}。用一句话说出你(作为这个人)来这类产品最想做的那一件具体的事 —— 一个具体动作或目标, 不要写"随便看看"。只输出 JSON: {"intent":"..."}`
        : `You're about to open ${targetUrl}. In ONE short sentence, state the SINGLE main thing you (as this persona) come to this kind of product to do — a concrete action or goal, not "just browse". Output only JSON: {"intent":"..."}`;
    const r = await callJson<{ intent?: string }>({
      system: personaSystemPrompt(persona, targetUrl, lang),
      prompt,
      maxTokens: 200,
    });
    const intent = (r.intent || "").trim();
    return intent || fallback;
  } catch {
    return fallback;
  }
}

// ── Tool dispatch ───────────────────────────────────────────────────────────

async function dispatch(
  page: Page,
  name: string,
  input: Record<string, unknown>
): Promise<{ result: string; event: Event | null }> {
  switch (name) {
    case "click_at": {
      const x = num(input.x), y = num(input.y), reason = str(input.reason);
      await page.mouse.click(x, y);
      await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
      return {
        result: `clicked (${x}, ${y}); current URL: ${page.url()}`,
        event: { t: "", agent: "", kind: "click", text: reason, sentiment: 0, url: page.url() },
      };
    }
    case "type_text": {
      const text = str(input.text), reason = str(input.reason);
      await page.keyboard.type(text, { delay: 25 });
      return {
        result: `typed ${JSON.stringify(text)}`,
        event: { t: "", agent: "", kind: "click", text: `${reason} (typed: ${shorten(text, 40)})`, sentiment: 0 },
      };
    }
    case "key_press": {
      const key = str(input.key), reason = str(input.reason);
      await page.keyboard.press(key);
      await page.waitForLoadState("networkidle", { timeout: 1500 }).catch(() => {});
      return {
        result: `pressed ${key}; current URL: ${page.url()}`,
        event: { t: "", agent: "", kind: "shortcut", text: `${reason} [${key}]`, sentiment: 0, url: page.url() },
      };
    }
    case "scroll": {
      const dir = (input.direction === "up" ? -1 : 1) as 1 | -1;
      const amount = num(input.amount ?? 400);
      await page.mouse.wheel(0, dir * amount);
      return {
        result: `scrolled ${dir === 1 ? "down" : "up"} ${amount}px`,
        event: null,
      };
    }
    case "navigate": {
      const url = str(input.url), reason = str(input.reason);
      const cur = new URL(page.url());
      const next = new URL(url, cur);
      if (next.origin !== cur.origin) {
        return { result: `ERROR: cross-origin nav blocked: ${next.origin}`, event: null };
      }
      await page.goto(next.toString(), { waitUntil: "domcontentloaded", timeout: TARGET_TIMEOUT_MS });
      return {
        result: `navigated to ${next}`,
        event: { t: "", agent: "", kind: "click", text: reason, sentiment: 0, url: next.toString() },
      };
    }
    case "note": {
      const kind = String(input.kind) as Event["kind"];
      const text = str(input.text);
      const sentiment = clamp(num(input.sentiment), -3, 3);
      return {
        result: "noted",
        event: { t: "", agent: "", kind, text, sentiment },
      };
    }
    case "finish": {
      return {
        result: "session ended by agent",
        event: { t: "", agent: "", kind: "exit", text: str(input.summary), sentiment: 0 },
      };
    }
    default:
      return { result: `ERROR: unknown tool ${name}`, event: null };
  }
}

// ── Snapshots & DOM ─────────────────────────────────────────────────────────

async function snapshot(
  page: Page,
  runDir: string,
  agentId: string,
  step: number
): Promise<{ b64: string; path: string }> {
  const rel = join("shots", `${agentId}-${String(step).padStart(2, "0")}.jpg`);
  const abs = join(runDir, rel);
  await mkdir(dirname(abs), { recursive: true });
  const buf = await page.screenshot({ type: "jpeg", quality: 70, fullPage: false });
  await writeFile(abs, buf);
  return { b64: buf.toString("base64"), path: rel };
}

// Tight DOM summary — interactive elements with their bounding boxes & text.
// Trimmed to keep tokens reasonable.
async function simplifiedDom(page: Page): Promise<string> {
  const items = await page.evaluate(() => {
    const out: Array<{ tag: string; rect: number[]; text: string; attrs: Record<string, string> }> = [];
    const sel = "a, button, input, textarea, select, [role=button], [role=link], [role=tab]";
    const els = Array.from(document.querySelectorAll(sel));
    for (const el of els.slice(0, 80)) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const txt = (el.textContent || (el as HTMLInputElement).value || "").trim().slice(0, 80);
      const attrs: Record<string, string> = {};
      for (const a of ["aria-label", "placeholder", "name", "type", "href"]) {
        const v = el.getAttribute(a);
        if (v) attrs[a] = v.slice(0, 60);
      }
      out.push({
        tag: el.tagName.toLowerCase(),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        text: txt,
        attrs,
      });
    }
    return out;
  });
  return items
    .map((it) => {
      const a = Object.entries(it.attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${it.tag} ${a} @[${it.rect.join(",")}]>${it.text || ""}</${it.tag}>`;
    })
    .join("\n");
}

// ── Wrap prompt ─────────────────────────────────────────────────────────────

function wrapPrompt(
  events: Event[],
  summary: string,
  accomplished: boolean | null,
  exitReason: ExitReason,
  intent: string,
  lang: Lang = "en"
): string {
  return lang === "zh"
    ? wrapPromptZh(events, summary, accomplished, exitReason, intent)
    : wrapPromptEn(events, summary, accomplished, exitReason, intent);
}

function wrapPromptEn(
  events: Event[],
  summary: string,
  accomplished: boolean | null,
  exitReason: ExitReason,
  intent: string
): string {
  const trajectory = events
    .map((e) => `${e.t} ${e.kind} (s=${e.sentiment}) ${e.text}`)
    .join("\n");
  return [
    `Here is the trajectory of the session you just had:`,
    ``,
    trajectory,
    ``,
    `Your closing line: ${summary}`,
    `Exit reason: ${exitReason}` + (
      accomplished == null ? " (no explicit finish)"
      : accomplished ? " (accomplished what you wanted)"
      : " (did not accomplish)"
    ),
    ``,
    `What you came here to do: ${intent}.`,
    `If you genuinely tried and could NOT do it (no entry point, couldn't find it after looking, clicked and nothing happened), that blocked goal is a real issue — usually HIGH severity — and you MUST report it specifically (e.g. "I came to add a task but there was no visible way to do it"). If you DID accomplish it, no issue is owed for the intent itself.`,
    `Discoverability counts the same: if doing your main thing required digging through several menus / settings / pages because it wasn't anywhere you'd reasonably expect, report that the action is buried / hard to find (e.g. "adding a task is hidden 4 menus deep") — a real user treats "buried too deep to find" the same as "missing". Report this EVEN IF you eventually found it.`,
    ``,
    `Important: you are a POTENTIAL USER of this product. This isn't bug hunting — you're writing`,
    `"as someone like me, this product made me feel X / hit me here / missed me there". Observations`,
    `are about experience / design / fit, not technical bugs.`,
    ``,
    `What counts as an issue — report ONLY what actually tripped YOU up in THIS session, and only if you can point to the exact moment it happened above:`,
    `- I clicked / typed / searched something and the response didn't match what I expected (blank page / no message / nothing moved)`,
    `- Something I wanted to do isn't allowed / has no entry point / has too few options (e.g. "CSV only, no PDF" / "search returns nothing" — these are issues)`,
    `- Something that competing tools already solved is unsolved here (typo tolerance, multilingual, custom templates, …)`,
    `- A label / button / text was unguessable / inconsistent / used the placeholder as a label`,
    `- Visual pacing wore me out / one accent color used 20 times / card sizes wildly inconsistent`,
    `- Navigation got lost / 4 levels deep to find a thing / key feature hidden in a submenu`,
    `- An action completed without feedback / failure had no error message / state wasn't communicated`,
    ``,
    `Only report a missing capability if you ACTUALLY went looking for it during this session and were blocked —`,
    `not every capability the product could theoretically have. "I didn't try X" / "it could also do Y" is NOT an issue.`,
    ``,
    `Output JSON strictly in this shape:`,
    "```json",
    `{
  "summary": "Your 2–3 sentence recap of the session, in your own voice (what I did, how it feels now, would I come back)",
  "accomplished": true/false,
  "issues": [
    {
      "title": "≤30 words; say specifically what's wrong (e.g. 'No results = blank page' / 'Export is CSV/JSON only, no PDF' / 'Tab focus is invisible'). Don't write 'feels off' — that's not a finding.",
      "severity": "high|med|low",
      "category": "information architecture|flow|feature fit|learning curve|visual pacing|copy|accessibility|perceived performance|vs competitors|emotional tone",
      "quote": "What you said in your head / out loud at the moment (user voice, not engineering voice)",
      "journey": "Where in the page / which step this feeling arose",
      "evidence": number (count of supporting events in the trajectory above)
    }
  ],
  "delights": [
    { "title": "≤30 words positive observation", "quote": "Your words" }
  ],
  "featuresUsed": [
    {
      "name": "Feature name (≤4 words, e.g. 'create task' / 'search' / 'invite teammate')",
      "completed": true/false,
      "attempts": number (how many times you tried this in the session),
      "sentiment": -3..3 (how you felt after using it)
    }
  ]
}`,
    "```",
    `Constraints:`,
    `- issues: report ONLY problems you actually hit in THIS session, each tied to a specific moment above where you`,
    `  hesitated, failed, got confused, or were blocked. There is NO target count. If the product worked fine for what`,
    `  you tried, return an EMPTY array — that is a valid, common, and valuable result. Do NOT invent issues to fill a list.`,
    `  If you never really got to use it (blank / broken / empty page, or you left almost immediately), return [] and say`,
    `  so in the summary — do NOT speculate about a product you didn't actually experience.`,
    `- BUT do not under-report either: if you genuinely tried to do something and were blocked — no entry point, couldn't`,
    `  find it after looking, clicked and nothing happened, an error with no explanation, a label you couldn't decode —`,
    `  that IS a real issue and you MUST report it. Missing friction you actually hit is just as wrong as inventing friction`,
    `  you didn't. The test: did it happen to ME, in the trajectory above? If yes, report it; if it's a guess, drop it.`,
    `- every issue MUST have evidence ≥ 1 pointing to real events in the trajectory above. If you can't cite the moment`,
    `  it tripped you up, do NOT report it.`,
    `- title must be specific enough that someone else could find that exact thing (name a button / field / step or say what's missing).`,
    `  Do NOT write "bad UX" / "needs improvement" / "feels clunky" — those are not findings.`,
    `- delights: 0–2.`,
    `- Write in user voice. No "the user" / "should" / "I recommend". Use "I thought / I expected / I didn't want to / would I try again?".`,
    `- Severity (from your-type-of-user perspective, not engineering severity):`,
    `    high = makes me not want to come back / blocks what I wanted to do;`,
    `    med  = makes me hesitate / annoys me on repeated use;`,
    `    low  = mildly rough but doesn't stop me.`,
    `- featuresUsed: real product features you touched (not individual clicks, meaningful capability units).`,
    `  E.g. "view list" / "add task" / "switch view" / "search" / "export" / "sign up" / "view settings".`,
    `  If you used nothing, empty array. Merge repeated attempts into one entry with attempts incremented.`,
    `- Output only JSON, nothing else.`,
  ].join("\n");
}

function wrapPromptZh(
  events: Event[],
  summary: string,
  accomplished: boolean | null,
  exitReason: ExitReason,
  intent: string
): string {
  const trajectory = events
    .map((e) => `${e.t} ${e.kind} (s=${e.sentiment}) ${e.text}`)
    .join("\n");
  return [
    `这是你刚刚的会话轨迹：`,
    ``,
    trajectory,
    ``,
    `你的结束语：${summary}`,
    `结束原因: ${exitReason}` + (
      accomplished == null ? " (没有显式 finish)"
      : accomplished ? " (达成目标)"
      : " (没达成)"
    ),
    ``,
    `你来想做的事: ${intent}.`,
    `如果你真的试了却做不成 (没有入口、找了半天找不到、点了没反应), 这个被挡住的目标就是一个真 issue —— 通常是 high 严重度 —— 必须具体写出来 (例: "我来想加一个任务, 但根本看不到在哪加"). 如果你做成了, 就不必为这个来意单独报 issue.`,
    `"藏得太深"和"没有"一样算: 如果做你这件主要的事, 得翻好几层菜单/设置/页面才找到 (因为它不在任何你合理预期的位置), 就报"这个操作藏得太深/很难找" (例: "加任务藏在 4 层菜单里") —— 真实用户把"深到找不到"和"根本没有"当成一回事. 哪怕你最后找到了也要报.`,
    ``,
    `重要: 你是这个产品的"潜在用户". 这不是 bug 排查 — 写的是 "作为我这类人,`,
    `这个产品让我有什么感受、什么地方戳到我或者错过了我". 观察是体验/设计/契合度上的,`,
    `不是技术 bug.`,
    ``,
    `什么算一个 issue —— 只报这次会话里真的绊到你的、且你能指出具体发生在上面哪一刻的:`,
    `- 我点了/输了/搜了什么之后, 它的反应不符合我期望 (空白页/无提示/原地不动)`,
    `- 我想做的事情, 这里不让做 / 找不到入口 / 选项不够 (比如 "只有 CSV 没有 PDF" / "搜不到结果", 这是 issue)`,
    `- 同类工具早就解决的事情, 这里没解决 (typo 容错、多语言、自定义模板…)`,
    `- 标签/按钮/文案让我猜不到含义 / 风格不一致 / 占位符当 label`,
    `- 视觉节奏让我累 / 一种颜色用了 20 次 / 卡片大小差距过大`,
    `- 导航走错路 / 4 层菜单才到 / 二级菜单藏关键功能`,
    `- 操作完成没有反馈 / 失败没有错误信息 / 状态不告诉我`,
    ``,
    `只有当你这次真的去找某个能力、并且被挡住了, 才把"缺失"记成 issue —— 不是产品"本可以有"的每个功能.`,
    `"我没试 X" / "它要是还能 Y 就好了" 都不算 issue.`,
    ``,
    `JSON 结构严格如下:`,
    "```json",
    `{
  "summary": "你这次会话的 2-3 句总结, 用户口吻 (我做了什么, 现在的感觉, 还会不会再回来)",
  "accomplished": true/false,
  "issues": [
    {
      "title": "≤30 字, 具体说出哪里不对 (例: 搜不到结果就空白 / 导出没有 PDF / Tab 焦点不可见). 不要写 '感觉不顺' 这种空话",
      "severity": "high|med|low",
      "category": "信息架构|流程顺畅|功能契合|学习成本|视觉节奏|表达文案|可访问性|性能感知|与竞品对比|情感氛围",
      "quote": "你当时心里/嘴里的原话 (用户语气, 不是工程语气)",
      "journey": "在什么场景/页面/步骤产生了这个感受",
      "evidence": 数字 (基于上面轨迹里支持这个感受的事件数)
    }
  ],
  "delights": [
    { "title": "≤30 字的正面感受", "quote": "你的原话" }
  ],
  "featuresUsed": [
    {
      "name": "功能名 (≤8 字, 比如 创建任务 / 搜索 / 邀请协作)",
      "completed": true/false,
      "attempts": 数字 (这次会话里你试了几次这个功能),
      "sentiment": -3..3 (你用完这个功能的感受)
    }
  ]
}`,
    "```",
    `约束:`,
    `- issues: 只报你这次会话里真的遇到的问题, 每条都要对应上面轨迹里某个你犹豫/失败/困惑/被挡住的具体时刻.`,
    `  没有目标条数. 如果你试的部分都好用, 就返回空数组 —— 这是合理、常见且有价值的结果, 不要为了凑数硬编.`,
    `  如果你根本没真正用上它 (空白/打不开/空页面, 或你几乎立刻就走了), 返回 [] 并在 summary 里说明 ——`,
    `  不要臆测一个你没真正体验过的产品.`,
    `- 但也别漏报: 如果你真的想做某事却被挡住了 —— 没有入口、找了半天找不到、点了没反应、报错却不说为什么、`,
    `  标签看不懂 —— 这就是真 issue, 必须报. 漏掉你真的撞到的摩擦, 和凭空编造一样错. 判断标准: 这事在上面轨迹里`,
    `  发生在"我"身上了吗? 是就报; 只是猜测就丢掉.`,
    `- 每条 issue 的 evidence 必须 ≥ 1, 指向上面轨迹里真实发生的事件; 指不出"在哪一刻绊到你"就别报.`,
    `- title 必须具体到能让别人立刻找到那个地方 (有"哪个按钮/哪个字段/哪个步骤"或"缺什么").`,
    `  不要写: "用户体验差" / "界面不够友好" / "需要改进". 这种空话不算 issue.`,
    `- delights 0-2 条, 同上.`,
    `- 用 user voice 写, 不要用 "the user" / "建议" / "应该". 用 "我觉得 / 我以为 / 我不太想 / 我会再试一次吗".`,
    `- severity 标准 (从你这类用户的角度, 不是工程严重度):`,
    `    high = 让我下次不太想回来 / 阻断我想做的事;`,
    `    med  = 让我犹豫 / 多用几次会烦;`,
    `    low  = 有点不顺但不至于阻止我.`,
    `- featuresUsed: 列出你真的接触过的"产品功能" (不是单个点击, 而是有意义的功能单元).`,
    `  例: "查看任务列表" / "添加任务" / "切换视图" / "搜索" / "导出" / "登录/注册" / "查看设置".`,
    `  没用到任何功能就给空数组. 每个功能合并多次尝试 → attempts 字段记次数.`,
    `- 只输出 JSON, 不要别的话.`,
  ].join("\n");
}

// ── helpers ─────────────────────────────────────────────────────────────────

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) throw new Error(`expected number, got ${v}`);
  return n;
}
function str(v: unknown): string {
  if (typeof v !== "string") throw new Error(`expected string, got ${v}`);
  return v;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function shorten(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
function fmtT(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds * 100) % 100);
  return `${pad(m)}:${pad(s)}:${pad(cs)}`;
}
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Ensure types are usable downstream in pure type-only mode.
export type _Browser = Browser;
export type _BrowserContext = BrowserContext;
