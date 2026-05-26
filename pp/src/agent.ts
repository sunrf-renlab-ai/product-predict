// One synthetic user — drives a Playwright page via Claude tool use,
// emits Event objects as it goes, and produces a self-rated wrap-up.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import type Anthropic from "@anthropic-ai/sdk";

import type { Persona, Event, FeatureUse, ExitReason } from "./types.js";
import { personaSystemPrompt } from "./personas.js";
import { addUsage, callAgent, callJson, emptyCost, type CostTally } from "./llm.js";

const TARGET_TIMEOUT_MS = 15_000;

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
}): Promise<AgentResult> {
  const { persona, browser, targetUrl, maxSteps, maxMinutes, runDir, viewport } = opts;
  const safetyMs = maxMinutes * 60_000;
  const cost = emptyCost();
  const events: Event[] = [];
  let accomplished: boolean | null = null;
  let summary = "(no summary)";
  let finished = false;
  let truncated = false;

  const context = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
    deviceScaleFactor: 1,
    locale: "zh-CN",
  });
  const page = await context.newPage();
  const t0 = Date.now();

  try {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: TARGET_TIMEOUT_MS });
    events.push({
      t: fmtT(0),
      agent: persona.id,
      kind: "enter",
      text: `进入 ${new URL(targetUrl).host}${new URL(targetUrl).pathname}`,
      sentiment: 0,
      url: page.url(),
    });
  } catch (e) {
    events.push({
      t: fmtT(0),
      agent: persona.id,
      kind: "exit",
      text: `打不开页面：${(e as Error).message}`,
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
      summary: "目标页面打不开。",
      issues: [],
      delights: [],
      features: [],
      durationSec: (Date.now() - t0) / 1000,
      cost,
    };
  }

  const system = personaSystemPrompt(persona, targetUrl);
  const messages: Anthropic.MessageParam[] = [];

  let exitReason: ExitReason = "timeout";
  for (let step = 0; step < maxSteps; step++) {
    const elapsedMs = Date.now() - t0;
    if (elapsedMs > safetyMs) {
      events.push({
        t: fmtT(elapsedMs / 1000),
        agent: persona.id,
        kind: "exit",
        text: `达到 wall-clock 安全上限 (${maxMinutes} 分钟), 强制结束.`,
        sentiment: -1,
      });
      break;
    }

    const t = fmtT(elapsedMs / 1000);
    const shot = await snapshot(page, runDir, persona.id, step);
    const dom = await simplifiedDom(page);

    // Tell the persona how long they've been at it — this is what cues a real
    // user to start wrapping up rather than grinding forever.
    const sec = Math.floor(elapsedMs / 1000);
    const elapsedHint = sec < 60 ? `${sec} 秒` : `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`;
    const userBlocks: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: shot.b64 },
      },
      {
        type: "text",
        text:
          `当前 URL: ${page.url()}\n` +
          `视口: ${viewport.w}x${viewport.h}\n` +
          `已经在这上面花了: ${elapsedHint}\n` +
          `提醒: 你是真实用户, 没有"步数任务", 该走就走 — 满意/沮丧/无聊都是合理的退出. 不要凑步数.\n\n` +
          `截图为最新页面状态。简化 DOM:\n\n${dom}`,
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
        text: `LLM 调用失败：${(e as Error).message}`,
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
        text: `操作失败 (${tool.name}): ${(e as Error).message}`,
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
        text: `达到 step safety 上限 (${maxSteps}), 强制结束.`,
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
      prompt: wrapPrompt(events, summary, accomplished, exitReason),
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
      text: `wrap-up 失败：${(e as Error).message}`,
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
  exitReason: ExitReason
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
    ``,
    `重要: 你是这个产品的"潜在用户". 这不是 bug 排查 — 写的是 "作为我这类人,`,
    `这个产品让我有什么感受、什么地方戳到我或者错过了我". 观察是体验/设计/契合度上的,`,
    `不是技术 bug.`,
    ``,
    `什么算一个 issue (尽量找全, 别漏):`,
    `- 我点了/输了/搜了什么之后, 它的反应不符合我期望 (空白页/无提示/原地不动)`,
    `- 我想做的事情, 这里不让做 / 找不到入口 / 选项不够 (比如 "只有 CSV 没有 PDF" / "搜不到结果", 这是 issue)`,
    `- 同类工具早就解决的事情, 这里没解决 (typo 容错、多语言、自定义模板…)`,
    `- 标签/按钮/文案让我猜不到含义 / 风格不一致 / 占位符当 label`,
    `- 视觉节奏让我累 / 一种颜色用了 20 次 / 卡片大小差距过大`,
    `- 导航走错路 / 4 层菜单才到 / 二级菜单藏关键功能`,
    `- 操作完成没有反馈 / 失败没有错误信息 / 状态不告诉我`,
    ``,
    `"功能缺失类" 观察非常重要: 如果你期望某个能力 (PDF 导出 / 中文界面 / typo 容错 /`,
    `自定义模板 / 清除按钮 / Tab 焦点) 这里没有, 一定写出来 — 这是 issue, 不是评论.`,
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
    `- issues 0-6 条, 把你这次会话里所有"不顺/缺失/反直觉"的点都尽量写出来. 一次会话里`,
    `  发现 4-6 个问题是正常的, 不要漏. 真的全顺就空数组, 但小 fixture 通常都有问题, 别勉强压缩.`,
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
