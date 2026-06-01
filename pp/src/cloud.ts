// pp/src/cloud.ts — CLI side of the cloud scale-out path.
//
// Flow:
//   1. resolveInviteToken()  — Keychain `pp-invite-token` or env PP_INVITE_TOKEN
//   2. dispatchCloudRun()    — POST /api/dispatch, returns { runId, totalShards }
//   3. pollUntilDone()       — GET /api/runs/:id every 5s until done or timeout
//   4. downloadArtifacts()   — N parallel zip downloads from /api/runs/:id/artifacts/:name
//   5. mergeShardRuns()      — combine N shard run.json into one unified Run
//   6. caller writes report  — via existing pp/src/report.ts
//
// Errors short-circuit with messages the CLI prints verbatim.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getSecret } from "./secret-store.js";

import type { Run, Event, Issue, Delight, FeatureFrequency } from "./types.js";

const execFileP = promisify(execFile);

const DEFAULT_API_BASE = process.env.PP_CLOUD_API || "https://product-predict.renlab.ai";
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 25 * 60_000;

export interface DispatchResult {
  runId: string;
  totalShards: number;
  agents: number;
  capped: boolean;
  userTag?: string;
}

export interface ShardStatus {
  idx: number;
  status: string;
  artifactName?: string;
  artifactId?: number;
}

export interface RunStatus {
  runId: string;
  status: "pending" | "running" | "succeeded" | "failed";
  totalShards?: number;
  completedShards: number;
  artifactsReady: boolean;
  shards: ShardStatus[];
}

export interface CloudRunOptions {
  targetUrl: string;
  agents: number;
  hint?: string;
  lang?: "en" | "zh";
  maxSteps?: number;
  inviteToken?: string;      // explicit override; else resolveInviteToken()
  apiBase?: string;
  outputDir: string;         // local dir to write merged run + artifacts
  onProgress?: (status: RunStatus) => void;
}

export async function dispatchCloudRun(opts: {
  apiBase: string;
  inviteToken: string;
  targetUrl: string;
  agents: number;
  hint?: string;
  lang?: "en" | "zh";
  maxSteps?: number;
}): Promise<DispatchResult> {
  const res = await fetch(`${opts.apiBase}/api/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetUrl: opts.targetUrl,
      agents: opts.agents,
      hint: opts.hint || "",
      lang: opts.lang || "en",
      maxSteps: opts.maxSteps || 30,
      inviteToken: opts.inviteToken,
    }),
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`cloud dispatch failed (${res.status}): ${body}`);
  }
  return (await res.json()) as DispatchResult;
}

export async function pollUntilDone(opts: {
  apiBase: string;
  runId: string;
  totalShards: number;
  onProgress?: (status: RunStatus) => void;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<RunStatus> {
  const timeoutMs = opts.timeoutMs ?? POLL_TIMEOUT_MS;
  const intervalMs = opts.intervalMs ?? POLL_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${opts.apiBase}/api/runs/${encodeURIComponent(opts.runId)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      // Transient errors are tolerated; keep polling.
      await sleep(intervalMs);
      continue;
    }
    const status = (await res.json()) as RunStatus;
    opts.onProgress?.(status);
    if (status.status === "succeeded" || status.status === "failed") return status;
    await sleep(intervalMs);
  }
  throw new Error(`cloud run ${opts.runId} did not complete within ${(timeoutMs / 60000).toFixed(0)} min`);
}

export async function downloadArtifacts(opts: {
  apiBase: string;
  runId: string;
  shards: ShardStatus[];
  outputDir: string;
}): Promise<string[]> {
  await mkdir(opts.outputDir, { recursive: true });
  const paths: string[] = [];

  await Promise.all(
    opts.shards.map(async (s) => {
      if (!s.artifactName) return;
      const zipPath = join(opts.outputDir, `${s.artifactName}.zip`);
      const dlRes = await fetch(
        `${opts.apiBase}/api/runs/${encodeURIComponent(opts.runId)}/artifacts/${encodeURIComponent(s.artifactName)}`
      );
      if (!dlRes.ok || !dlRes.body) {
        throw new Error(`shard ${s.idx} download failed: ${dlRes.status}`);
      }
      const buf = Buffer.from(await dlRes.arrayBuffer());
      await writeFile(zipPath, buf);
      const extractDir = join(opts.outputDir, `shard-${s.idx}`);
      await mkdir(extractDir, { recursive: true });
      await extractZip(zipPath, extractDir);
      paths.push(extractDir);
    })
  );

  return paths;
}

// Cross-platform zip extraction (no bundled zip lib): PowerShell Expand-Archive
// on Windows, `unzip` on macOS/Linux.
async function extractZip(zipPath: string, destDir: string): Promise<void> {
  if (process.platform === "win32") {
    const q = (s: string) => "'" + s.replace(/'/g, "''") + "'";
    await execFileP("powershell", [
      "-NoProfile", "-NonInteractive", "-Command",
      `Expand-Archive -Force -LiteralPath ${q(zipPath)} -DestinationPath ${q(destDir)}`,
    ]);
    return;
  }
  await execFileP("unzip", ["-q", "-o", zipPath, "-d", destDir]);
}

export async function mergeShardRuns(shardDirs: string[]): Promise<Run> {
  if (shardDirs.length === 0) throw new Error("no shard artifacts to merge");

  const shardRuns: Run[] = [];
  for (const dir of shardDirs) {
    // Each shard wrote runs/run-001/run.json — find it.
    const path = await findShardRunJson(dir);
    const text = await readFile(path, "utf-8");
    shardRuns.push(JSON.parse(text) as Run);
  }

  const base = shardRuns[0];

  // Merge agents (append; preserve unique ids by prefixing shard idx).
  const agents = shardRuns.flatMap((r, idx) =>
    r.agents.map((a) => ({ ...a, id: `s${idx}-${a.id}` }))
  );

  // Merge activity events.
  const activity: Event[] = shardRuns.flatMap((r, idx) =>
    r.activity.map((e) => ({ ...e, agent: `s${idx}-${e.agent}` }))
  );

  // Merge issues — dedupe by (lowercase title + category). Keep severity = max.
  const issuesByKey = new Map<string, Issue>();
  for (const r of shardRuns) {
    for (const i of r.issues || []) {
      const key = `${(i.category || "").toLowerCase()}::${(i.title || "").toLowerCase()}`;
      const existing = issuesByKey.get(key);
      if (!existing) {
        issuesByKey.set(key, { ...i });
      } else {
        // Merge: sum evidence, take max severity.
        existing.evidence = (existing.evidence || 0) + (i.evidence || 0);
        existing.severity = maxSeverity(existing.severity, i.severity);
      }
    }
  }
  const issues = Array.from(issuesByKey.values()).sort((a, b) => sevRank(b.severity) - sevRank(a.severity));

  // Merge delights — similar dedup by title.
  const delightsByKey = new Map<string, Delight>();
  for (const r of shardRuns) {
    for (const d of r.delights || []) {
      const key = (d.title || "").toLowerCase();
      if (!delightsByKey.has(key)) delightsByKey.set(key, { ...d });
    }
  }
  const delights = Array.from(delightsByKey.values());

  // Merge feature frequencies by name.
  const featuresByName = new Map<string, FeatureFrequency>();
  for (const r of shardRuns) {
    for (const f of r.features || []) {
      const existing = featuresByName.get(f.name);
      if (!existing) {
        featuresByName.set(f.name, { ...f });
      } else {
        const oldHits = existing.hitCount || 0;
        const addHits = f.hitCount || 0;
        const totalHits = oldHits + addHits;
        existing.hitCount = totalHits;
        existing.totalAttempts = (existing.totalAttempts || 0) + (f.totalAttempts || 0);
        // weighted average of avgSentiment by hitCount
        existing.avgSentiment = totalHits > 0
          ? ((existing.avgSentiment || 0) * oldHits + (f.avgSentiment || 0) * addHits) / totalHits
          : 0;
        // completionRate weighted average
        existing.completionRate = totalHits > 0
          ? ((existing.completionRate || 0) * oldHits + (f.completionRate || 0) * addHits) / totalHits
          : 0;
      }
    }
  }
  const totalAgents = shardRuns.reduce((s, r) => s + r.agents.length, 0);
  const features = Array.from(featuresByName.values()).map((f) => ({
    ...f,
    hitRate: totalAgents > 0 ? f.hitCount / totalAgents : 0,
  }));

  // Aggregate cost.
  const tokensIn = shardRuns.reduce((s, r) => s + (r.cost?.tokensIn || 0), 0);
  const tokensOut = shardRuns.reduce((s, r) => s + (r.cost?.tokensOut || 0), 0);
  const usd = shardRuns.reduce((s, r) => s + (r.cost?.usd || 0), 0);

  // Aggregate metrics: average where appropriate.
  const n = shardRuns.length;
  const predictedNps = avg(shardRuns.map((r) => r.metrics?.predictedNps ?? 0));
  const achievableNps = avg(shardRuns.map((r) => r.metrics?.achievableNps ?? 0));
  const taskSuccess = avg(shardRuns.map((r) => r.metrics?.taskSuccess ?? 0));
  const rageClicks = shardRuns.reduce((s, r) => s + (r.metrics?.rageClicks || 0), 0);
  const delightCount = delights.length;
  const t2v = shardRuns
    .map((r) => r.metrics?.timeToValueSec)
    .filter((v): v is number => v != null && Number.isFinite(v));
  const timeToValueSec = t2v.length ? avg(t2v) : null;

  const startedAt = shardRuns.map((r) => r.startedAt).sort()[0] || base.startedAt;
  const finishedAt = shardRuns.map((r) => r.finishedAt).sort().reverse()[0] || base.finishedAt;

  return {
    id: base.id,
    startedAt,
    finishedAt,
    target: base.target,
    personaSetId: base.personaSetId,
    agents,
    activity,
    issues,
    delights,
    features,
    routesHeat: base.routesHeat, // route heat from shard 0 is good enough for v1.5
    sentimentCurve: shardRuns.flatMap((r) => r.sentimentCurve || []).sort((a, b) => a.t - b.t),
    metrics: { predictedNps, achievableNps, taskSuccess, timeToValueSec, rageClicks, delightCount },
    cost: { tokensIn, tokensOut, usd },
  };
}

export async function resolveInviteToken(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  if (process.env.PP_INVITE_TOKEN) return process.env.PP_INVITE_TOKEN;
  // Cross-platform secret store: macOS Keychain, else ~/.pp/credentials.json.
  const tok = await getSecret("pp-invite-token");
  if (tok) return tok;
  throw new Error(
    "no invite token. set the PP_INVITE_TOKEN env var (or store it under \"pp-invite-token\" in your pp credentials)."
  );
}

// Orchestrator: dispatch → poll → download → merge → return Run.
export async function executeCloudRun(opts: CloudRunOptions): Promise<{ run: Run; shardDirs: string[] }> {
  const apiBase = opts.apiBase || DEFAULT_API_BASE;
  const inviteToken = await resolveInviteToken(opts.inviteToken);

  const dispatch = await dispatchCloudRun({
    apiBase,
    inviteToken,
    targetUrl: opts.targetUrl,
    agents: opts.agents,
    hint: opts.hint,
    lang: opts.lang,
    maxSteps: opts.maxSteps,
  });

  const final = await pollUntilDone({
    apiBase,
    runId: dispatch.runId,
    totalShards: dispatch.totalShards,
    onProgress: opts.onProgress,
  });

  if (final.status !== "succeeded") {
    throw new Error(`cloud run ${dispatch.runId} ended ${final.status} (${final.completedShards}/${final.totalShards ?? "?"} shards)`);
  }

  const shardDirs = await downloadArtifacts({
    apiBase,
    runId: dispatch.runId,
    shards: final.shards,
    outputDir: opts.outputDir,
  });

  const run = await mergeShardRuns(shardDirs);
  await writeFile(join(opts.outputDir, "run.json"), JSON.stringify(run, null, 2));
  return { run, shardDirs };
}

// ── helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ""; }
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function sevRank(s?: string): number {
  return s === "high" ? 3 : s === "med" ? 2 : 1;
}

function maxSeverity(a?: string, b?: string): "high" | "med" | "low" {
  const rA = sevRank(a), rB = sevRank(b);
  const r = Math.max(rA, rB);
  return r === 3 ? "high" : r === 2 ? "med" : "low";
}

async function findShardRunJson(dir: string): Promise<string> {
  // Search dir for runs/run-NNN/run.json (the structure pp writes by default).
  const { readdir } = await import("node:fs/promises");
  async function walk(d: string): Promise<string | null> {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isFile() && e.name === "run.json") return p;
      if (e.isDirectory()) {
        const r = await walk(p);
        if (r) return r;
      }
    }
    return null;
  }
  const found = await walk(dir);
  if (!found) throw new Error(`run.json not found in ${dir}`);
  return found;
}
