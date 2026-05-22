import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";

// ── Provider selection ──────────────────────────────────────────────────────
// pp auto-detects which API to talk to based on the key prefix:
//   sk-ant-...  → real Anthropic, default model claude-sonnet-4-5
//   sk-cp-...   → MiniMax Coding Plan (Anthropic-compatible at api.minimax.io),
//                 default model MiniMax-M2.7. Plan is flat-rate so we report
//                 cost as $0 — pricing is per-subscription, not per-token.
// Keys can come from:
//   $ANTHROPIC_API_KEY / $ANTHROPIC_AUTH_TOKEN   (single key)
//   $MINIMAX_API_KEYS                            (comma- or newline-separated)
//   macOS Keychain: service=minimax-coding-plan, value=JSON array of keys
// Multiple MiniMax keys are round-robined per request to stay clear of
// per-key rate limits.

// pp separates LLM work into two roles:
//   - "main"       — analysis: persona generation, beta derivation, agent
//                    wrap-up synthesis, report aggregation. One dedicated key,
//                    stable per process.
//   - "simulation" — per-turn tool-use calls during agent execution. Pool of
//                    N keys, round-robined per request to keep each key under
//                    its rate limit. Persona count must be <= sim key count.
//
// Keychain shape (preferred):
//   { "main": "sk-cp-...", "simulation": ["sk-cp-...", ...] }
// Backward-compat: a bare JSON array means "all sim keys, first is also main".
// Inline env override:
//   PP_MAIN_KEY=sk-cp-...
//   PP_SIM_KEYS=sk-cp-...,sk-cp-...
//   ANTHROPIC_API_KEY=sk-ant-... (real Anthropic, single key for both roles)

type Provider = {
  name: "anthropic" | "minimax";
  baseURL?: string;
  model: string;
  pricePerMTokIn: number;
  pricePerMTokOut: number;
  mainKey: string;
  simKeys: string[];             // includes mainKey if no separate pool
};

let _provider: Provider | null = null;
let _simIdx = 0;
let _clients = new Map<string, Anthropic>();

export const MOCK_MODE = process.env.PP_MOCK_LLM === "1";

function detectProvider(): Provider {
  if (_provider) return _provider;

  const inlineMainKey = process.env.PP_MAIN_KEY;
  const inlineSimKeys = (process.env.PP_SIM_KEYS || "")
    .split(/[,\n\s]+/)
    .filter((k) => k.startsWith("sk-cp-"));

  // Real-Anthropic single-key path.
  const inlineAnt =
    process.env.ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN ||
    process.env.PP_API_KEY;
  if (inlineAnt?.startsWith("sk-ant-") && !inlineMainKey) {
    _provider = {
      name: "anthropic",
      baseURL: process.env.ANTHROPIC_BASE_URL,
      model: process.env.PP_MODEL || "claude-sonnet-4-5-20250929",
      pricePerMTokIn: 3,
      pricePerMTokOut: 15,
      mainKey: inlineAnt,
      simKeys: [inlineAnt],
    };
    return _provider;
  }

  // MiniMax — collect main + sim from env, then keychain.
  let main = inlineMainKey?.startsWith("sk-cp-") ? inlineMainKey : "";
  let sims = inlineSimKeys.slice();
  if (!main || sims.length === 0) {
    const kc = keychainMinimax();
    if (!main && kc.main) main = kc.main;
    if (sims.length === 0) sims = kc.simulation;
  }
  // Fallback: an old flat-array keychain entry, or PP_API_KEY=sk-cp-...
  if (!main && sims.length > 0) main = sims[0];
  if (!main && inlineAnt?.startsWith("sk-cp-")) {
    main = inlineAnt;
    sims = [inlineAnt];
  }

  if (main && main.startsWith("sk-cp-")) {
    if (sims.length === 0) sims = [main];
    _provider = {
      name: "minimax",
      baseURL:
        process.env.MINIMAX_BASE_URL ||
        process.env.ANTHROPIC_BASE_URL ||
        "https://api.minimaxi.com/anthropic",
      model: process.env.PP_MODEL || "MiniMax-M2.7",
      pricePerMTokIn: 0,
      pricePerMTokOut: 0,
      mainKey: main,
      simKeys: sims,
    };
    return _provider;
  }

  throw new Error(
    "No LLM credentials found. Set one of:\n" +
    "  export ANTHROPIC_API_KEY=sk-ant-...                   (real Anthropic)\n" +
    "  export PP_MAIN_KEY=sk-cp-... PP_SIM_KEYS=sk-cp-...    (MiniMax inline)\n" +
    `  security add-generic-password -s minimax-coding-plan -a $(whoami) \\\n` +
    `    -w '{"main":"sk-cp-...","simulation":["sk-cp-...","sk-cp-..."]}'\n` +
    "Or set PP_MOCK_LLM=1 to use the offline stub."
  );
}

type KeychainEntry = { main: string; simulation: string[] };

function keychainMinimax(): KeychainEntry {
  try {
    const out = execSync(
      `security find-generic-password -s minimax-coding-plan -w 2>/dev/null`,
      { encoding: "utf8" }
    ).trim();
    if (!out) return { main: "", simulation: [] };
    if (out.startsWith("{")) {
      const obj = JSON.parse(out);
      const main = typeof obj.main === "string" && obj.main.startsWith("sk-cp-") ? obj.main : "";
      const sims = Array.isArray(obj.simulation)
        ? obj.simulation.filter((s: unknown): s is string => typeof s === "string" && s.startsWith("sk-cp-"))
        : [];
      return { main, simulation: sims };
    }
    if (out.startsWith("[")) {
      // Legacy flat-array entry.
      const arr = JSON.parse(out);
      const sims: string[] = Array.isArray(arr)
        ? arr.filter((s: unknown): s is string => typeof s === "string" && s.startsWith("sk-cp-"))
        : [];
      return { main: sims[0] || "", simulation: sims };
    }
    if (out.startsWith("sk-cp-")) return { main: out, simulation: [out] };
    return { main: "", simulation: [] };
  } catch {
    return { main: "", simulation: [] };
  }
}

export function providerInfo(): {
  name: string;
  model: string;
  baseURL: string;
  mainKeyPrefix: string;
  simKeyCount: number;
} {
  const p = detectProvider();
  return {
    name: p.name,
    model: p.model,
    baseURL: p.baseURL || "https://api.anthropic.com",
    mainKeyPrefix: p.mainKey.slice(0, 14) + "…",
    simKeyCount: p.simKeys.length,
  };
}

export function simKeyCount(): number {
  return detectProvider().simKeys.length;
}

function clientForKey(key: string, baseURL?: string): Anthropic {
  let c = _clients.get(key);
  if (!c) {
    c = new Anthropic({ apiKey: key, baseURL });
    _clients.set(key, c);
  }
  return c;
}

// Main client — analysis work (persona gen, derive, wrap-up, aggregation).
function mainClient(): Anthropic {
  const p = detectProvider();
  return clientForKey(p.mainKey, p.baseURL);
}

// Sim client — round-robin across the simulation pool, one client per key.
function simClient(): Anthropic {
  const p = detectProvider();
  const key = p.simKeys[_simIdx % p.simKeys.length];
  _simIdx++;
  return clientForKey(key, p.baseURL);
}

// Back-compat shim — old code called client() generically. Prefer the role-
// specific accessors above; this routes to sim by default since most callers
// were the agent loop.
export function client(): Anthropic {
  return simClient();
}

// The tool schema Claude must use. Each tool maps to one concrete action against
// the Playwright page (note() is the only one that doesn't drive the browser).
export const AGENT_TOOLS = [
  {
    name: "click_at",
    description: "Click at the given pixel coordinates in the screenshot. Use for buttons, links, anywhere clickable.",
    input_schema: {
      type: "object" as const,
      properties: {
        x: { type: "number", description: "X coordinate in CSS pixels" },
        y: { type: "number", description: "Y coordinate in CSS pixels" },
        reason: { type: "string", description: "One-sentence why, from the user's POV." },
      },
      required: ["x", "y", "reason"],
    },
  },
  {
    name: "type_text",
    description: "Type text into the currently focused input/textarea. Click first to focus.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: { type: "string" },
        reason: { type: "string" },
      },
      required: ["text", "reason"],
    },
  },
  {
    name: "key_press",
    description: "Press a key or shortcut. Examples: Enter, Tab, Escape, ArrowDown, Meta+K, Control+/.",
    input_schema: {
      type: "object" as const,
      properties: {
        key: { type: "string" },
        reason: { type: "string" },
      },
      required: ["key", "reason"],
    },
  },
  {
    name: "scroll",
    description: "Scroll the current page.",
    input_schema: {
      type: "object" as const,
      properties: {
        direction: { type: "string", enum: ["up", "down"] },
        amount: { type: "number", description: "Pixels (default 400)", default: 400 },
      },
      required: ["direction"],
    },
  },
  {
    name: "navigate",
    description: "Navigate to a URL on the SAME origin. Cross-origin nav is blocked.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string" },
        reason: { type: "string" },
      },
      required: ["url", "reason"],
    },
  },
  {
    name: "note",
    description: "Record an internal-monologue thought without touching the page. Use any time you feel something — confused / delighted / annoyed / mid-task observation.",
    input_schema: {
      type: "object" as const,
      properties: {
        kind: {
          type: "string",
          enum: ["confused", "delight", "rage", "search", "observation"],
        },
        text: { type: "string", description: "First-person, what you're thinking." },
        sentiment: {
          type: "number",
          description: "-3 (furious) to +3 (delighted). 0 is neutral.",
          minimum: -3,
          maximum: 3,
        },
      },
      required: ["kind", "text", "sentiment"],
    },
  },
  {
    name: "finish",
    description:
      "Stop the session. Use as soon as a real user would stop — you may have " +
      "accomplished what you came for, or gotten frustrated enough to quit, or " +
      "just satisfied your curiosity. There is NO step quota; do not grind.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "2-3 sentences in user voice. What did you do? Why are you stopping now?",
        },
        accomplished: {
          type: "boolean",
          description: "Did you do what you actually came here to do? (true even if you also got annoyed.)",
        },
        reason: {
          type: "string",
          enum: ["accomplished", "frustrated", "explored"],
          description:
            "Why are you stopping? accomplished=got what I came for; " +
            "frustrated=the experience was bad enough that I gave up; " +
            "explored=poked around enough, nothing left I care to try.",
        },
      },
      required: ["summary", "accomplished", "reason"],
    },
  },
] as const;

export type ToolName = (typeof AGENT_TOOLS)[number]["name"];

export type CostTally = { tokensIn: number; tokensOut: number; usd: number };

export function emptyCost(): CostTally {
  return { tokensIn: 0, tokensOut: 0, usd: 0 };
}

export function addUsage(c: CostTally, msg: Anthropic.Message): void {
  const u = msg.usage;
  if (!u) return;
  c.tokensIn += u.input_tokens || 0;
  c.tokensOut += u.output_tokens || 0;
  const p = detectProvider();
  c.usd =
    (c.tokensIn / 1_000_000) * p.pricePerMTokIn +
    (c.tokensOut / 1_000_000) * p.pricePerMTokOut;
}

// One LLM turn for an agent.  Returns the full message; caller picks the
// tool_use block and dispatches.  Retries on transient errors with exponential
// backoff, max 3 tries.
export async function callAgent(args: {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}): Promise<Anthropic.Message> {
  if (MOCK_MODE) return mockAgentTurn(args.messages);
  const c = simClient();        // round-robin across the sim pool
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await c.messages.create({
        model: detectProvider().model,
        max_tokens: args.maxTokens ?? 1024,
        system: args.system,
        tools: AGENT_TOOLS as unknown as Anthropic.Tool[],
        tool_choice: { type: "any" },          // force a tool every turn
        messages: args.messages,
      });
    } catch (e) {
      lastErr = e;
      const msg = (e as Error).message || "";
      if (/rate|429|overload|529|timeout/i.test(msg)) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

// Non-tool call — used by the "wrap" pass that asks the persona to synthesise
// their session into structured issues / delights.
export async function callJson<T>(args: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<T> {
  if (MOCK_MODE) return mockWrap() as T;
  const c = mainClient();       // analysis work goes on the main key

  const msg = await c.messages.create({
    model: detectProvider().model,
    max_tokens: args.maxTokens ?? 2048,
    system: args.system,
    messages: [{ role: "user", content: args.prompt }],
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const json = extractJson(text);
  return JSON.parse(json) as T;
}

function extractJson(text: string): string {
  // Accept ```json ... ``` or bare JSON. Pick the first balanced { ... } or [ ... ].
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fence ? fence[1] : text).trim();
  // If candidate starts with [ or {, return as-is.
  const first = candidate.indexOf("{");
  const firstArr = candidate.indexOf("[");
  const start =
    first === -1 ? firstArr : firstArr === -1 ? first : Math.min(first, firstArr);
  if (start === -1) throw new Error("No JSON found in LLM output:\n" + text);
  return candidate.slice(start);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Mock mode — deterministic stub so the pipeline can be E2E tested without
//    an API key. The "agent" cycles through a small canned script that touches
//    every tool type. Cost is reported as zero.

let __mockTurnIdx = 0;
let __mockAgentSeq = 0;

function mockAgentTurn(messages: Anthropic.MessageParam[]): Anthropic.Message {
  // Each turn picks a different tool to exercise the dispatch logic.
  const step = countToolResults(messages);
  const seed = (__mockAgentSeq * 7 + step) % 6;
  __mockTurnIdx++;

  const script: Array<{ name: string; input: object }> = [
    { name: "note", input: { kind: "observation", text: "落地页加载完了，开始扫一下信息架构。", sentiment: 0 } },
    { name: "scroll", input: { direction: "down", amount: 400 } },
    { name: "note", input: { kind: "delight", text: "排版挺干净的，标题层级清楚。", sentiment: 2 } },
    { name: "key_press", input: { key: "Meta+K", reason: "试试有没有命令面板" } },
    { name: "note", input: { kind: "confused", text: "Cmd+K 没反应，找不到搜索。", sentiment: -2 } },
    { name: "finish", input: { summary: "看完落地页，没找到我要的搜索入口，但整体观感还不错。", accomplished: false } },
  ];
  const choice = script[seed];

  const msg: Anthropic.Message = {
    id: `mock-${__mockTurnIdx}`,
    type: "message",
    role: "assistant",
    model: "mock",
    stop_reason: "tool_use",
    stop_sequence: null,
    content: [
      { type: "tool_use", id: `tu-${__mockTurnIdx}`, name: choice.name, input: choice.input } as Anthropic.ToolUseBlock,
    ],
    usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, server_tool_use: null, service_tier: null } as Anthropic.Usage,
  };
  return msg;
}

function countToolResults(messages: Anthropic.MessageParam[]): number {
  let n = 0;
  for (const m of messages) {
    if (m.role !== "user" || typeof m.content === "string") continue;
    for (const b of m.content as Array<{ type?: string }>) {
      if (b.type === "tool_result") n++;
    }
  }
  return n;
}

function mockWrap(): {
  summary: string;
  accomplished: boolean;
  issues: Array<{ title: string; severity: "high" | "med" | "low"; category: string; quote: string; journey: string; evidence: number }>;
  delights: Array<{ title: string; quote: string }>;
} {
  __mockAgentSeq++;
  // Vary results per agent so the aggregator sees overlap + uniques.
  const flavors = [
    {
      issues: [
        { title: "命令面板快捷键无响应", severity: "high" as const, category: "Keyboard", quote: "凡是 SaaS 产品都有 Cmd+K，这个没有让我有点意外。", journey: "刚进首页", evidence: 2 },
        { title: "落地页没有明确的下一步 CTA", severity: "med" as const, category: "Onboarding", quote: "看完介绍我不知道该点哪个按钮开始用。", journey: "落地页 8 秒", evidence: 1 },
      ],
      delights: [{ title: "排版清爽", quote: "标题节奏舒服。" }],
    },
    {
      issues: [
        { title: "命令面板快捷键无响应", severity: "med" as const, category: "Keyboard", quote: "我习惯 Cmd+K，这里没反应。", journey: "导航中", evidence: 1 },
        { title: "缺少明确的产品定价信息", severity: "low" as const, category: "Copy", quote: "我得点进去 3 层才能找到价格。", journey: "Pricing 路径", evidence: 1 },
      ],
      delights: [],
    },
    {
      issues: [
        { title: "落地页没有明确的下一步 CTA", severity: "high" as const, category: "Onboarding", quote: "我点进来 10 秒没找到 sign up 按钮。", journey: "首页", evidence: 2 },
      ],
      delights: [{ title: "排版清爽", quote: "颜色和字距让人舒服。" }],
    },
  ];
  const f = flavors[__mockAgentSeq % flavors.length];
  return {
    summary: "mock agent run summary — see issues/delights below.",
    accomplished: __mockAgentSeq % 2 === 0,
    issues: f.issues,
    delights: f.delights,
  };
}
