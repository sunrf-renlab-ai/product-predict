// Runner — orchestrates N agents against a target URL and produces run.json.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

import type { Run, Event, Issue, Delight, RouteHeat, PersonaSet, FeatureFrequency } from "./types.js";
import { allocateSlots } from "./personas.js";
import { runAgent, type AgentResult } from "./agent.js";
import { simKeyCount } from "./llm.js";

export type RunOptions = {
  targetUrl: string;
  personaSet: PersonaSet;       // pre-generated (preset / beta / mixed)
  agents?: number;               // total slots to fill; defaults to sim key count
  maxSteps: number;              // safety cap per agent (default 30 from CLI)
  maxMinutes: number;            // wall-clock safety cap per agent (default 10)
  outDir: string;
  headless: boolean;
  viewport?: { w: number; h: number };
  concurrency?: number;
  log?: (line: string) => void;
};

export async function executeRun(opts: RunOptions): Promise<{ run: Run; runDir: string }> {
  const viewport = opts.viewport ?? { w: 1280, h: 800 };
  const concurrency = opts.concurrency ?? 2;
  const log = opts.log ?? (() => {});

  await mkdir(opts.outDir, { recursive: true });
  const runId = await nextRunId(opts.outDir);
  const runDir = join(opts.outDir, runId);
  await mkdir(runDir, { recursive: true });

  // Hard cap: personas (distinct archetypes) must not exceed sim key count.
  // Slots fill the sim pool — fewer personas means weight-based replication.
  let simKeys = 1;
  try {
    simKeys = simKeyCount();
  } catch {
    // Mock or anthropic-single-key — fall back to a generous default so the
    // mock pipeline isn't capped to 1 slot.
    simKeys = process.env.PP_MOCK_LLM === "1" ? 6 : 1;
  }
  if (opts.personaSet.personas.length > simKeys) {
    throw new Error(
      `persona set has ${opts.personaSet.personas.length} archetypes but only ${simKeys} simulation keys are configured. ` +
      `Persona count must not exceed sim key count. Either drop personas or add keys to the keychain entry.`
    );
  }
  const requested = opts.agents ?? simKeys;
  const slotCount = Math.max(1, Math.min(requested, simKeys));
  const personas = allocateSlots(opts.personaSet, slotCount);
  log(`run ${runId}: ${personas.length} agent slots from ${opts.personaSet.personas.length} archetypes · ` +
      `safety cap ${opts.maxSteps} steps / ${opts.maxMinutes} min per agent`);

  const browser = await chromium.launch({ headless: opts.headless });
  const t0 = new Date().toISOString();

  let targetTitle = opts.targetUrl;
  try {
    const probe = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h } });
    const p = await probe.newPage();
    await p.goto(opts.targetUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
    targetTitle = (await p.title()) || opts.targetUrl;
    await probe.close();
  } catch (e) {
    log(`probe failed: ${(e as Error).message}`);
  }

  // Bounded concurrency pool.
  const results: AgentResult[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, personas.length) }, async () => {
    while (cursor < personas.length) {
      const i = cursor++;
      const persona = personas[i];
      log(`  [${persona.id}] ${persona.name} starting`);
      try {
        const r = await runAgent({
          persona,
          browser,
          targetUrl: opts.targetUrl,
          maxSteps: opts.maxSteps,
          maxMinutes: opts.maxMinutes,
          runDir,
          viewport,
        });
        log(`  [${persona.id}] done (${r.exitReason}) · ${r.events.length} events · ${r.durationSec.toFixed(0)}s · $${r.cost.usd.toFixed(3)}`);
        results.push(r);
      } catch (e) {
        log(`  [${persona.id}] CRASH: ${(e as Error).message}`);
        results.push({
          persona,
          events: [],
          finished: false,
          truncated: true,
          exitReason: "crashed",
          accomplished: false,
          summary: `Crashed: ${(e as Error).message}`,
          issues: [],
          delights: [],
          features: [],
          durationSec: 0,
          cost: { tokensIn: 0, tokensOut: 0, usd: 0 },
        });
      }
    }
  });
  await Promise.all(workers);
  await browser.close().catch(() => {});

  const finishedAt = new Date().toISOString();
  const run = aggregate({
    runId,
    targetUrl: opts.targetUrl,
    targetTitle,
    viewport,
    personaSetId: opts.personaSet.id,
    startedAt: t0,
    finishedAt,
    results,
  });

  const runJsonPath = join(runDir, "run.json");
  await writeFile(runJsonPath, JSON.stringify(run, null, 2));
  log(`run ${runId}: wrote ${runJsonPath}`);

  return { run, runDir };
}

// ── Aggregation ─────────────────────────────────────────────────────────────

function aggregate(args: {
  runId: string;
  targetUrl: string;
  targetTitle: string;
  viewport: { w: number; h: number };
  personaSetId: string;
  startedAt: string;
  finishedAt: string;
  results: AgentResult[];
}): Run {
  const { runId, targetUrl, targetTitle, viewport, personaSetId, startedAt, finishedAt, results } = args;

  // Flatten events sorted by t (lexicographic on "mm:ss:cs" is fine).
  const activity: Event[] = results
    .flatMap((r) => r.events)
    .sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));

  // Dedupe issues by lower-cased title across agents.
  const issueMap = new Map<
    string,
    { hits: number; severities: ("high" | "med" | "low")[]; sample: AgentResult["issues"][number]; agentRefs: string[]; evidence: number }
  >();
  for (const r of results) {
    for (const iss of r.issues) {
      const k = normalizeTitle(iss.title);
      const cur = issueMap.get(k);
      if (cur) {
        cur.hits++;
        cur.severities.push(iss.severity);
        cur.evidence += iss.evidence || 1;
        cur.agentRefs.push(r.persona.id);
        // Prefer the most severe sample's quote.
        if (sevRank(iss.severity) > sevRank(cur.sample.severity)) cur.sample = iss;
      } else {
        issueMap.set(k, {
          hits: 1,
          severities: [iss.severity],
          sample: iss,
          agentRefs: [r.persona.id],
          evidence: iss.evidence || 1,
        });
      }
    }
  }

  const issues: Issue[] = Array.from(issueMap.entries())
    .map(([_, v], i) => {
      // Severity bump: hit by ≥ N/2 agents → at least med; hit by all → high.
      let sev = pickWorst(v.severities);
      if (v.hits >= Math.ceil(results.length / 2) && sev === "low") sev = "med";
      if (v.hits === results.length && sev !== "high") sev = "high";
      return {
        id: `i${String(i + 1).padStart(2, "0")}`,
        title: v.sample.title,
        severity: sev,
        agents: v.hits,
        category: v.sample.category || "Other",
        quote: v.sample.quote,
        agentRef: v.agentRefs[0],
        evidence: v.evidence,
        journey: v.sample.journey || "全程",
      };
    })
    .sort((a, b) => sevRank(b.severity) - sevRank(a.severity) || b.agents - a.agents);

  // Delights — dedupe similarly.
  const delightMap = new Map<string, { hits: number; sample: AgentResult["delights"][number]; agent: string }>();
  for (const r of results) {
    for (const d of r.delights) {
      const k = normalizeTitle(d.title);
      const cur = delightMap.get(k);
      if (cur) cur.hits++;
      else delightMap.set(k, { hits: 1, sample: d, agent: r.persona.id });
    }
  }
  const delights: Delight[] = Array.from(delightMap.values())
    .map((d) => ({ title: d.sample.title, count: d.hits, quote: d.sample.quote, agent: d.agent }))
    .sort((a, b) => b.count - a.count);

  // Routes — collect any URL that was visited and bucket dwell.
  const routesHeat = buildRoutesHeat(results, targetUrl);

  // Sentiment curve — sample at percent-of-elapsed buckets.
  const sentimentCurve = buildSentimentCurve(activity);

  // Metrics.
  const totalAgents = results.length;
  const accomplished = results.filter((r) => r.accomplished).length;
  const rageClicks = activity.filter((e) => e.kind === "rage").length;
  const delightCount = activity.filter((e) => e.sentiment >= 2).length;
  const avgSentiment = activity.length
    ? activity.reduce((s, e) => s + e.sentiment, 0) / activity.length
    : 0;
  const predictedNps = Math.round(avgSentiment * 33); // crude: −3..+3 → −99..+99
  const achievableNps = clamp(predictedNps + issues.filter((i) => i.severity === "high").length * 14, -100, 100);
  const taskSuccess = totalAgents ? accomplished / totalAgents : 0;

  // Time-to-value — earliest +2 sentiment event.
  const firstDelight = activity.find((e) => e.sentiment >= 2);
  const timeToValueSec = firstDelight ? tToSec(firstDelight.t) : null;

  // Total cost.
  const cost = results.reduce(
    (acc, r) => ({
      tokensIn: acc.tokensIn + r.cost.tokensIn,
      tokensOut: acc.tokensOut + r.cost.tokensOut,
      usd: acc.usd + r.cost.usd,
    }),
    { tokensIn: 0, tokensOut: 0, usd: 0 }
  );

  return {
    id: runId,
    startedAt,
    finishedAt,
    target: { url: targetUrl, title: targetTitle, viewport },
    personaSetId,
    agents: results.map((r) => ({
      ...r.persona,
      crashed: r.exitReason === "crashed" || (r.events.length === 0 && !r.finished),
      truncated: r.truncated,
      exitReason: r.exitReason,
      durationSec: r.durationSec,
    })),
    activity,
    issues,
    delights,
    features: aggregateFeatures(results),
    routesHeat,
    sentimentCurve,
    metrics: {
      predictedNps,
      achievableNps,
      taskSuccess,
      timeToValueSec,
      rageClicks,
      delightCount,
    },
    cost,
  };
}

// Feature aggregation — cross-agent rollup of per-agent featuresUsed lists.
// We canonicalize feature names case-insensitively but keep the most
// frequently-used original casing for display.
function aggregateFeatures(results: AgentResult[]): FeatureFrequency[] {
  const map = new Map<
    string,
    { name: string; hits: number; completes: number; attempts: number; sentSum: number; sentN: number }
  >();
  for (const r of results) {
    for (const f of r.features) {
      const key = f.name.trim().toLowerCase();
      if (!key) continue;
      const cur = map.get(key) || { name: f.name.trim(), hits: 0, completes: 0, attempts: 0, sentSum: 0, sentN: 0 };
      cur.hits++;
      cur.attempts += f.attempts;
      if (f.completed) cur.completes++;
      cur.sentSum += f.sentiment;
      cur.sentN++;
      map.set(key, cur);
    }
  }
  const total = Math.max(1, results.length);
  return Array.from(map.values())
    .map((v) => ({
      name: v.name,
      hitCount: v.hits,
      hitRate: v.hits / total,
      completionRate: v.hits > 0 ? v.completes / v.hits : 0,
      avgSentiment: v.sentN > 0 ? v.sentSum / v.sentN : 0,
      totalAttempts: v.attempts,
    }))
    .sort((a, b) => b.hitRate - a.hitRate || b.totalAttempts - a.totalAttempts);
}

function buildRoutesHeat(results: AgentResult[], targetUrl: string): RouteHeat[] {
  const base = new URL(targetUrl);
  const map = new Map<string, { visits: number; dwell: number; drops: number }>();
  for (const r of results) {
    const visited: { path: string; tSec: number }[] = [];
    for (const e of r.events) {
      if (!e.url) continue;
      try {
        const u = new URL(e.url);
        if (u.origin !== base.origin) continue;
        const path = u.pathname || "/";
        visited.push({ path, tSec: tToSec(e.t) });
      } catch {
        // skip
      }
    }
    for (let i = 0; i < visited.length; i++) {
      const cur = visited[i];
      const next = visited[i + 1];
      const dwell = next ? next.tSec - cur.tSec : 5;
      const slot = map.get(cur.path) || { visits: 0, dwell: 0, drops: 0 };
      slot.visits++;
      slot.dwell += Math.max(0, Math.min(120, dwell));
      if (!next && !r.accomplished) slot.drops++;
      map.set(cur.path, slot);
    }
  }
  return Array.from(map.entries())
    .map(([path, v]) => ({
      path,
      visits: v.visits,
      dwell: Math.round(v.dwell / Math.max(1, v.visits)),
      drop: v.visits ? v.drops / v.visits : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);
}

function buildSentimentCurve(events: Event[]): { t: number; v: number }[] {
  if (events.length === 0) return [];
  const maxT = Math.max(1, tToSec(events[events.length - 1].t));
  // 20 buckets, rolling average sentiment normalized 0..1.
  const buckets: number[][] = Array.from({ length: 21 }, () => []);
  for (const e of events) {
    const t = tToSec(e.t);
    const idx = Math.min(20, Math.floor((t / maxT) * 20));
    buckets[idx].push(e.sentiment);
  }
  let lastV = 0.5;
  return buckets.map((arr, i) => {
    if (arr.length) {
      const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
      lastV = (avg + 3) / 6;     // −3..+3 → 0..1
    }
    return { t: i * 5, v: clamp(lastV, 0, 1) };
  });
}

// ── helpers ─────────────────────────────────────────────────────────────────

function normalizeTitle(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function sevRank(s: "high" | "med" | "low"): number {
  return s === "high" ? 3 : s === "med" ? 2 : 1;
}
function pickWorst(arr: ("high" | "med" | "low")[]): "high" | "med" | "low" {
  return arr.reduce((acc, s) => (sevRank(s) > sevRank(acc) ? s : acc), "low" as const);
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function tToSec(t: string): number {
  const [m, s, cs] = t.split(":").map(Number);
  return m * 60 + s + (cs || 0) / 100;
}

async function nextRunId(outDir: string): Promise<string> {
  if (!existsSync(outDir)) return "run-001";
  const names = await readdir(outDir);
  let max = 0;
  for (const n of names) {
    const m = n.match(/^run-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `run-${String(max + 1).padStart(3, "0")}`;
}
