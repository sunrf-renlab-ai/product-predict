// persona-derive.ts — turn parsed beta data (docs + audio transcripts) into a
// PersonaSet via LLM clustering. Mirrors persona-gen.ts (buildPrompt →
// validateAndRepair → exported entrypoint). Exports derivePersonasFromBeta
// (origin "beta") and deriveMixedPersonas (parallel preset+beta then LLM merge).

import { callJson } from "./llm.js";
import { generatePresetPersonas } from "./persona-gen.js";
import type { Persona, PersonaSet } from "./types.js";
import type { ParsedDocument } from "./parsers/document.js";
import type { ParsedAudio } from "./parsers/audio.js";

export type ParsedSource = ParsedDocument | ParsedAudio;

const PALETTE = [
  "#e6c976", "#7fb069", "#c98686", "#a89cc8", "#76b5c5", "#d8a05e",
  "#b8c474", "#8a9bb4", "#c87fa9", "#e89978", "#9bb88a", "#a8a8c8",
];

// Cap total concatenated source text at ~50k chars to stay under model context
// budgets. If combined text exceeds the cap, each source is truncated
// *proportionally* to its share of the original total (90/10 split stays
// 90/10) so the LLM still sees realistic cluster sizes.
const MAX_TOTAL_CHARS = 50_000;

function concatSources(sources: ParsedSource[]): string {
  if (sources.length === 0) return "(no beta sources provided)";
  const totals = sources.map((s) => s.text.length);
  const sum = totals.reduce((a, b) => a + b, 0);
  const scale = sum > MAX_TOTAL_CHARS ? MAX_TOTAL_CHARS / sum : 1;

  const parts: string[] = [];
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const limit = Math.max(200, Math.floor(totals[i] * scale));
    const slice = s.text.length > limit
      ? s.text.slice(0, limit) + `\n…[truncated ${s.text.length - limit} chars]`
      : s.text;
    parts.push(`=== FROM ${s.path} (${s.kind}) ===\n${slice}`);
  }
  return parts.join("\n\n");
}

function buildDerivePrompt(
  body: string,
  n: number,
  language: "zh" | "en",
  targetHint: string,
  strict: boolean,
): { system: string; prompt: string } {
  const langNote = language === "zh"
    ? `用户主语言：中文。tone、preferences、knownContext、traits 都用中文。姓名可以混搭中英。`
    : `User language: English. All free-text fields in English.`;

  const system = [
    `You analyze raw beta-user data (interview transcripts, feedback docs, recordings) and infer the user-population mix.`,
    `Identify distinct user clusters and generate N personas, one per cluster.`,
    `CRITICAL: weights must reflect the RELATIVE FREQUENCY of each cluster in the data, NOT equal weights. If 5 of 8 interviewees are PMs, the PM persona gets ~0.6.`,
    `preferences and knownContext should quote/echo real signals from the source text. Extract competitor/tool mentions (e.g. "用过 Notion", "tried Linear") verbatim where possible.`,
    langNote,
    strict ? `CRITICAL: respond with ONLY a raw JSON array. No prose, no markdown fences.` : ``,
  ].filter(Boolean).join("\n");

  const example = language === "zh"
    ? `{"name":"李心怡","age":29,"role":"独立设计师","tech":3,"tone":"温和","preferences":["重视视觉一致","希望流程简单"],"knownContext":["每天用 Figma","试过 Notion 当资料库"],"weight":0.25,"color":"#e6c976","glyph":"L","traits":["视觉控","内省"]}`
    : `{"name":"Sam Patel","age":34,"role":"founder","tech":4,"tone":"skeptical","preferences":["values speed","data-driven"],"knownContext":["uses Linear","tried Jira, too heavy"],"weight":0.25,"color":"#e6c976","glyph":"S","traits":["pragmatic","skeptic"]}`;

  const prompt = [
    targetHint ? `Target/product context: ${targetHint}` : `Target: (inferred from beta data)`,
    `N = ${n}`,
    ``,
    `Beta source material (provenance markers show distinct voices):`,
    body,
    ``,
    `Rules per persona:`,
    `- name, age (18–65), role (short label), tech (1–5 int), tone (short adjective)`,
    `- preferences: 1–3 short phrases sourced from beta signals`,
    `- knownContext: 1–3 short phrases — at least ONE MUST mention a competitor / existing tool the user references in the data`,
    `- weight: 0..1, N weights sum to ~1.0 reflecting cluster size`,
    `- color: hex like "#e6c976"; glyph: single capital, unique if possible; traits: 2–3 short tags`,
    `- DO NOT include a "goal" field.`,
    ``,
    `Example shape (do not copy verbatim): ${example}`,
    ``,
    `Return: a JSON array of exactly ${n} persona objects. No wrapper, no markdown.`,
  ].join("\n");

  return { system, prompt };
}

function buildMergePrompt(
  preset: Persona[],
  beta: Persona[],
  n: number,
  language: "zh" | "en",
  targetHint: string,
  strict: boolean,
): { system: string; prompt: string } {
  const langNote = language === "zh"
    ? `语言：中文。`
    : `Language: English.`;

  const system = [
    `You merge two persona arrays into one final set of N personas.`,
    `Inputs: (A) preset personas from product knowledge, (B) beta-derived personas reflecting real user clusters.`,
    `Rules: dedupe by name/role similarity (same archetype → keep ONE); PREFER preferences/knownContext from the beta-derived persona (real evidence); final weights closer to beta's observed distribution but informed by preset coverage; re-normalize weights to sum to 1.0; preserve total of N personas.`,
    langNote,
    strict ? `CRITICAL: respond with ONLY a raw JSON array. No prose, no markdown fences.` : ``,
  ].filter(Boolean).join("\n");

  const prompt = [
    targetHint ? `Target: ${targetHint}` : ``,
    `N = ${n}`,
    ``,
    `(A) PRESET personas:`,
    JSON.stringify(preset, null, 2),
    ``,
    `(B) BETA-derived personas (treat these as the source of truth for real-world distribution):`,
    JSON.stringify(beta, null, 2),
    ``,
    `Return: a JSON array of exactly ${n} merged persona objects with the same schema (id, name, age, role, tech, tone, preferences, knownContext, weight, color, glyph, traits). No wrapper, no markdown.`,
  ].filter(Boolean).join("\n");

  return { system, prompt };
}

type RawPersona = Partial<Persona> & { name?: string };

function validateAndRepair(raw: unknown, n: number, origin: "beta" | "mixed"): Persona[] {
  if (!Array.isArray(raw)) throw new Error("LLM did not return a JSON array");
  if (raw.length === 0) throw new Error("LLM returned empty persona array");

  const items = raw.slice(0, n) as RawPersona[];
  const usedGlyphs = new Set<string>();

  const personas: Persona[] = items.map((r, i) => {
    const id = `a${String(i + 1).padStart(2, "0")}`;
    const name = String(r.name || `User ${i + 1}`).trim();

    let glyph = String(r.glyph || name.charAt(0) || "X").toUpperCase().charAt(0);
    if (!/[A-Z]/.test(glyph)) glyph = String.fromCharCode(65 + (i % 26));
    while (usedGlyphs.has(glyph)) {
      glyph = String.fromCharCode(65 + ((glyph.charCodeAt(0) - 65 + 1) % 26));
    }
    usedGlyphs.add(glyph);

    const color = typeof r.color === "string" && /^#[0-9a-fA-F]{6}$/.test(r.color)
      ? r.color
      : PALETTE[i % PALETTE.length];

    return {
      id,
      name,
      age: Number.isFinite(r.age) ? Math.max(18, Math.min(75, Number(r.age))) : 30,
      role: String(r.role || "user").trim(),
      tech: clampTech(r.tech),
      tone: String(r.tone || "中性").trim(),
      preferences: arrayish(r.preferences, 1),
      knownContext: arrayish(r.knownContext, 1),
      weight: typeof r.weight === "number" && r.weight > 0 ? r.weight : 1 / items.length,
      color,
      glyph,
      traits: arrayish(r.traits, 2).slice(0, 3),
      origin,
    };
  });

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
  while (arr.length < min) arr.push("(unspecified)");
  return arr;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
    || `set-${Math.random().toString(36).slice(2, 8)}`;
}

function summarizeSources(sources: ParsedSource[]): NonNullable<PersonaSet["sources"]> {
  return sources.map((s) => ({
    path: s.path,
    kind: s.kind,
    bytes: s.bytes,
    transcriptChars: s.text.length,
  }));
}

export async function derivePersonasFromBeta(args: {
  sources: ParsedSource[];
  n?: number;
  language?: "zh" | "en";
  targetHint?: string;
}): Promise<PersonaSet> {
  const n = args.n ?? 8;
  const language = args.language ?? "zh";
  const targetHint = args.targetHint || "";
  const body = concatSources(args.sources);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { system, prompt } = buildDerivePrompt(body, n, language, targetHint, attempt === 1);
    try {
      const raw = await callJson<unknown>({ system, prompt, maxTokens: 4096 });
      const personas = validateAndRepair(raw, n, "beta");
      const label = `beta · ${targetHint.slice(0, 20) || `${args.sources.length} sources`}`;
      return {
        id: slugify(label) || `beta-${Date.now().toString(36)}`,
        name: label,
        targetHint,
        origin: "beta",
        createdAt: new Date().toISOString(),
        personas,
        sources: summarizeSources(args.sources),
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`derivePersonasFromBeta failed after 2 attempts: ${(lastErr as Error)?.message || lastErr}`);
}

export async function deriveMixedPersonas(args: {
  targetHint: string;
  sources: ParsedSource[];
  n?: number;
  language?: "zh" | "en";
}): Promise<PersonaSet> {
  const n = args.n ?? 8;
  const language = args.language ?? "zh";

  // Run preset + beta derivation in parallel — they're independent LLM calls.
  const [presetSet, betaSet] = await Promise.all([
    generatePresetPersonas({ targetHint: args.targetHint, n, language }),
    derivePersonasFromBeta({ sources: args.sources, n, language, targetHint: args.targetHint }),
  ]);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { system, prompt } = buildMergePrompt(
      presetSet.personas,
      betaSet.personas,
      n,
      language,
      args.targetHint,
      attempt === 1,
    );
    try {
      const raw = await callJson<unknown>({ system, prompt, maxTokens: 4096 });
      const personas = validateAndRepair(raw, n, "mixed");
      const label = `mixed · ${args.targetHint.slice(0, 20)}`;
      return {
        id: slugify(label) || `mixed-${Date.now().toString(36)}`,
        name: label,
        targetHint: args.targetHint,
        origin: "mixed",
        createdAt: new Date().toISOString(),
        personas,
        sources: summarizeSources(args.sources),
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`deriveMixedPersonas merge failed after 2 attempts: ${(lastErr as Error)?.message || lastErr}`);
}
