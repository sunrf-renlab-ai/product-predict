// persona-gen.ts — generate a fresh PersonaSet tailored to a target hint.
// Replaces the static 12-persona list in personas.ts for "preset" runs.
// The LLM returns an array of persona stubs; we validate/repair and wrap it.

import { callJson } from "./llm.js";
import type { Persona, PersonaSet } from "./types.js";

// Default palette — used to fill in any persona the model didn't color.
const PALETTE = [
  "#e6c976", "#7fb069", "#c98686", "#a89cc8", "#76b5c5", "#d8a05e",
  "#b8c474", "#8a9bb4", "#c87fa9", "#e89978", "#9bb88a", "#a8a8c8",
];

function buildPrompt(targetHint: string, n: number, language: "zh" | "en", strict: boolean): { system: string; prompt: string } {
  const langNote = language === "zh"
    ? `用户主语言：中文。姓名混搭：约 ⅔ 像 \"Maya Chen\" / \"Kenji Okada\" 这种国际化拼音，⅓ 是 \"李心怡\" / \"王磊\" 这种本地中文名。tone、preferences、knownContext、traits 都用中文。`
    : `User language: English. Names should be plausible international tech users. All free-text fields in English.`;

  const system = [
    `You design realistic user populations for product-experience simulations.`,
    `Given a product target, output a JSON array of N personas reflecting the *actual user mix* that would land on this product — skewed correctly (a Postgres GUI skews technical; a meal-kit landing page skews broad).`,
    `Include at least one skeptic (tone like 怀疑/挑剔/保守) and one enthusiast (好奇/外向).`,
    `${langNote}`,
    strict ? `CRITICAL: respond with ONLY a raw JSON array. No prose, no markdown fences, no commentary. Start with [ and end with ].` : ``,
  ].filter(Boolean).join("\n");

  const example = language === "zh"
    ? `{"name":"Maya Chen","age":28,"role":"产品经理","tech":4,"tone":"挑剔","preferences":["重视协作","看重模板生态"],"knownContext":["每天用 Notion","试过 Linear，觉得太开发向","团队 8 人"],"weight":0.13,"color":"#e6c976","glyph":"M","traits":["效率控","重视协作"]}`
    : `{"name":"Maya Chen","age":28,"role":"PM","tech":4,"tone":"picky","preferences":["values collaboration","template-driven"],"knownContext":["uses Notion daily","tried Linear, too dev-heavy","team of 8"],"weight":0.13,"color":"#e6c976","glyph":"M","traits":["efficient","collaborative"]}`;

  const prompt = [
    `Target: ${targetHint}`,
    `N = ${n}`,
    ``,
    `Rules per persona:`,
    `- name: realistic, no titles`,
    `- age: 18–65, varied`,
    `- role: short job label`,
    `- tech: integer 1–5 (proficiency)`,
    `- tone: one short adjective (挑剔 / 好奇 / 急躁 / 怀疑 / 温和 …)`,
    `- preferences: 1–3 short phrases — what this user cares about`,
    `- knownContext: 1–3 short phrases — at least ONE line MUST mention a competitor or existing tool they currently use (e.g. "每天用 Notion", "试过 Linear")`,
    `- weight: 0..1, your N weights should sum to ~1.0 reflecting realistic population mix`,
    `- color: hex like "#e6c976"`,
    `- glyph: single capital letter, unique across the set if possible`,
    `- traits: 2–3 very short tags (in Chinese for zh, English for en)`,
    `- DO NOT include a "goal" field. Goals are decided per-run, not per-persona.`,
    ``,
    `Example single persona shape (do not copy verbatim):`,
    example,
    ``,
    `Return: a JSON array of exactly ${n} persona objects. No wrapper object. No markdown.`,
  ].join("\n");

  return { system, prompt };
}

type RawPersona = Partial<Persona> & { name?: string };

function validateAndRepair(raw: unknown, n: number): Persona[] {
  if (!Array.isArray(raw)) throw new Error("LLM did not return a JSON array");
  if (raw.length === 0) throw new Error("LLM returned empty persona array");

  // Truncate or pad to n. (Padding is rare; we just keep what we have.)
  const items = raw.slice(0, n) as RawPersona[];

  const usedGlyphs = new Set<string>();
  const personas: Persona[] = items.map((r, i) => {
    const id = `a${String(i + 1).padStart(2, "0")}`;
    const name = String(r.name || `User ${i + 1}`).trim();

    // Glyph: prefer model's, fall back to first letter of name, dedupe by bumping.
    let glyph = String(r.glyph || name.charAt(0) || "X").toUpperCase().charAt(0);
    if (!/[A-Z]/.test(glyph)) glyph = String.fromCharCode(65 + (i % 26));
    while (usedGlyphs.has(glyph)) {
      glyph = String.fromCharCode(65 + ((glyph.charCodeAt(0) - 65 + 1) % 26));
    }
    usedGlyphs.add(glyph);

    const tech = clampTech(r.tech);
    const prefs = arrayish(r.preferences, 1);
    const ctx = arrayish(r.knownContext, 1);
    const traits = arrayish(r.traits, 2).slice(0, 3);
    const color = typeof r.color === "string" && /^#[0-9a-fA-F]{6}$/.test(r.color)
      ? r.color
      : PALETTE[i % PALETTE.length];

    return {
      id,
      name,
      age: Number.isFinite(r.age) ? Math.max(18, Math.min(75, Number(r.age))) : 30,
      role: String(r.role || "user").trim(),
      tech,
      tone: String(r.tone || "中性").trim(),
      preferences: prefs,
      knownContext: ctx,
      weight: typeof r.weight === "number" && r.weight > 0 ? r.weight : 1 / items.length,
      color,
      glyph,
      traits,
      origin: "preset",
    };
  });

  // Normalize weights to sum to 1.0.
  const sum = personas.reduce((s, p) => s + p.weight, 0) || 1;
  for (const p of personas) p.weight = Math.round((p.weight / sum) * 1000) / 1000;

  return personas;
}

function clampTech(v: unknown): 1 | 2 | 3 | 4 | 5 {
  const n = Math.round(Number(v));
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return n as 1 | 2 | 3 | 4 | 5;
}

function arrayish(v: unknown, min: number): string[] {
  const arr = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
  if (arr.length >= min) return arr.slice(0, 3);
  // Pad lightly so downstream code never sees an empty list.
  while (arr.length < min) arr.push("(unspecified)");
  return arr;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
    || `set-${Math.random().toString(36).slice(2, 8)}`;
}

export async function generatePresetPersonas(args: {
  targetHint: string;
  n?: number;
  language?: "zh" | "en";
}): Promise<PersonaSet> {
  const n = args.n ?? 8;
  const language = args.language ?? "zh";

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { system, prompt } = buildPrompt(args.targetHint, n, language, attempt === 1);
    try {
      const raw = await callJson<unknown>({ system, prompt, maxTokens: 4096 });
      const personas = validateAndRepair(raw, n);
      const label = `preset · ${args.targetHint.slice(0, 30)}`;
      return {
        id: slugify(label) || `preset-${Date.now().toString(36)}`,
        name: label,
        targetHint: args.targetHint,
        origin: "preset",
        createdAt: new Date().toISOString(),
        personas,
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`generatePresetPersonas failed after 2 attempts: ${(lastErr as Error)?.message || lastErr}`);
}
