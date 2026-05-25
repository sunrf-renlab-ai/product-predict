// bench-score.ts — match pp findings to ground-truth issues via LLM judge,
// compute precision/recall/F1 per fixture and aggregated.
//
// For each fixture:
//   for each GT issue:
//     ask the main key (via cloud proxy) which pp finding (if any) describes
//     the same underlying observation, with reasoning + confidence 0..1
//   matched = GT issues with a finding above THRESHOLD
//   recall = matched / |GT|
//   precision = |findings used as matches| / |findings|
//   F1 = harmonic mean
//   severityAcc = of matched, fraction with same severity tier
//   categoryAcc = of matched, fraction with same category string
//
// Output:
//   runs/bench-NNN/per-fixture/<id>/matched.json  (verdicts)
//   runs/bench-NNN/summary.json
//
// Usage:
//   npx tsx scripts/bench-score.ts bench-001
//   npx tsx scripts/bench-score.ts bench-001 --threshold 0.6

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { callJson } from "../../pp/src/llm.js";

import type {
  Fixture,
  FixtureRunResult,
  FixtureScore,
  MatchVerdict,
  BenchSummary,
} from "./types.js";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const BENCH_ROOT = resolve(HERE, "..");
const FIXTURES_DIR = resolve(BENCH_ROOT, "fixtures");
const RUNS_DIR = resolve(BENCH_ROOT, "runs");

const argv = process.argv.slice(2);
const BENCH_ID = argv.find((a) => /^bench-\d+$/.test(a));
if (!BENCH_ID) {
  console.error("usage: tsx bench-score.ts <bench-NNN> [--threshold N]");
  process.exit(1);
}
const TH_ARG = argv.indexOf("--threshold");
const THRESHOLD = TH_ARG >= 0 ? parseFloat(argv[TH_ARG + 1]) : 0.7;

const benchDir = join(RUNS_DIR, BENCH_ID);
if (!existsSync(join(benchDir, "index.json"))) {
  console.error(`✗ ${benchDir}/index.json not found — did bench-run.ts succeed?`);
  process.exit(1);
}

// ── LLM judge ──────────────────────────────────────────────────────────────

type JudgeOutput = {
  best_finding_id: string | null;
  matched: boolean;
  confidence: number;     // 0..1
  reasoning: string;
  severity_agrees: boolean;
  category_agrees: boolean;
};

async function judgeOne(args: {
  fixtureName: string;
  gt: { id: string; title: string; severity: string; category: string; description: string };
  findings: Array<{ id: string; title: string; severity: string; category: string; quote: string }>;
}): Promise<JudgeOutput> {
  if (args.findings.length === 0) {
    return {
      best_finding_id: null,
      matched: false,
      confidence: 0,
      reasoning: "no findings to consider",
      severity_agrees: false,
      category_agrees: false,
    };
  }

  const system =
    "You are a UX evaluation judge. Output ONLY a JSON object, no prose. " +
    "Decide whether any of the provided pp findings describes the same underlying " +
    "observation as the ground-truth (GT) issue.";

  // Strip quotes from GT/findings text — they break JSON when reflected.
  const clean = (s: string) => s.replace(/["'`\\]/g, "").slice(0, 120);

  const findingsList = args.findings
    .map(
      (f, i) =>
        `  ${i}: id=${f.id} sev=${f.severity} cat=${f.category} title=${clean(f.title)} | quote=${clean(f.quote)}`
    )
    .join("\n");

  const prompt = `Product: ${clean(args.fixtureName)}

GT issue:
  id=${args.gt.id} sev=${args.gt.severity} cat=${args.gt.category}
  title=${clean(args.gt.title)}
  desc=${clean(args.gt.description)}

pp findings:
${findingsList}

Decide: do any findings describe the same underlying UX issue as the GT?
Return EXACTLY this JSON shape, no markdown, no extra text:

{"best_finding_id": "<finding id or null>", "matched": <true|false>, "confidence": <0..1>, "reasoning": "<short reason no quotes max 60 chars>", "severity_agrees": <true|false>, "category_agrees": <true|false>}

Rules:
- Match means same underlying issue, even if worded differently.
- Conf 0.85+ for clear matches; 0.6-0.8 for adjacent issues; <0.5 = no match.
- matched=true iff confidence >= 0.5.
- Pick ONE best finding (lowest match if multiple).
- reasoning MUST be plain ASCII / Chinese with no double-quotes, single-quotes, backslashes, or newlines.
- Output JSON only, nothing else.`;

  try {
    const r = await callJson<JudgeOutput>({ system, prompt, maxTokens: 800 });
    // Normalize fields
    return {
      best_finding_id: r.best_finding_id ?? null,
      matched: !!r.matched && (r.confidence ?? 0) >= 0.5,
      confidence: clamp(r.confidence ?? 0, 0, 1),
      reasoning: String(r.reasoning || "").slice(0, 280),
      severity_agrees: !!r.severity_agrees,
      category_agrees: !!r.category_agrees,
    };
  } catch (e) {
    return {
      best_finding_id: null,
      matched: false,
      confidence: 0,
      reasoning: `judge failed: ${(e as Error).message}`.slice(0, 280),
      severity_agrees: false,
      category_agrees: false,
    };
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ── score one fixture ──────────────────────────────────────────────────────

async function scoreFixture(
  fixture: Fixture,
  runResult: FixtureRunResult
): Promise<FixtureScore> {
  const verdicts: MatchVerdict[] = [];
  // Track which findings have been "claimed" as a match — for precision.
  const claimed = new Set<string>();

  for (const gt of fixture.groundTruth) {
    const judgeResult = await judgeOne({
      fixtureName: fixture.name,
      gt: {
        id: gt.id,
        title: gt.title,
        severity: gt.severity,
        category: gt.category,
        description: gt.description,
      },
      findings: runResult.ppIssues,
    });

    const matched = judgeResult.matched && judgeResult.confidence >= THRESHOLD;
    if (matched && judgeResult.best_finding_id) {
      claimed.add(judgeResult.best_finding_id);
    }

    verdicts.push({
      gtId: gt.id,
      findingId: matched ? judgeResult.best_finding_id : null,
      matched,
      confidence: judgeResult.confidence,
      reasoning: judgeResult.reasoning,
      severityAgrees: matched ? judgeResult.severity_agrees : undefined,
      categoryAgrees: matched ? judgeResult.category_agrees : undefined,
    });
  }

  const matched = verdicts.filter((v) => v.matched).length;
  const gtTotal = fixture.groundTruth.length;
  const ppTotal = runResult.ppIssues.length;
  const recall = gtTotal > 0 ? matched / gtTotal : 0;
  const precision = ppTotal > 0 ? claimed.size / ppTotal : 1;
  const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  const sevAgreed = verdicts.filter((v) => v.matched && v.severityAgrees).length;
  const catAgreed = verdicts.filter((v) => v.matched && v.categoryAgrees).length;
  const severityAcc = matched > 0 ? sevAgreed / matched : 0;
  const categoryAcc = matched > 0 ? catAgreed / matched : 0;

  // False positives: findings not in `claimed`.
  const falsePositives = runResult.ppIssues
    .filter((f) => !claimed.has(f.id))
    .map((f) => ({
      findingId: f.id,
      finding: { title: f.title, category: f.category, severity: f.severity },
    }));

  // Missed: GT issues without a verdict.matched.
  const missed = fixture.groundTruth
    .filter((gt) => !verdicts.find((v) => v.gtId === gt.id && v.matched))
    .map((gt) => ({ gtId: gt.id, gt }));

  return {
    fixtureId: fixture.id,
    gtTotal,
    ppTotal,
    matched,
    recall,
    precision,
    f1,
    severityAcc,
    categoryAcc,
    verdicts,
    falsePositives,
    missed,
  };
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  const indexPath = join(benchDir, "index.json");
  const idx = JSON.parse(await readFile(indexPath, "utf8")) as {
    runStartedAt: string;
    agents: number;
    maxSteps: number;
    maxMinutes: number;
    fixtureCount: number;
    results: FixtureRunResult[];
  };

  console.log(`scoring ${BENCH_ID} · ${idx.results.length} fixtures · threshold=${THRESHOLD}`);

  const perFixture: FixtureScore[] = [];
  for (const r of idx.results) {
    if (r.error) {
      console.log(`  [skip] ${r.fixtureId} — ${r.error}`);
      continue;
    }
    const fxPath = join(FIXTURES_DIR, r.fixtureId, "ground-truth.json");
    const fx = JSON.parse(await readFile(fxPath, "utf8")) as Fixture;
    process.stdout.write(`  ${r.fixtureId} (gt=${fx.groundTruth.length} pp=${r.ppIssues.length}) … `);
    const score = await scoreFixture(fx, r);
    process.stdout.write(
      `recall=${(score.recall * 100).toFixed(0)}% precision=${(score.precision * 100).toFixed(0)}% F1=${score.f1.toFixed(2)}\n`
    );

    // Write per-fixture matched.json
    const perDir = join(benchDir, "per-fixture", r.fixtureId);
    await mkdir(perDir, { recursive: true });
    await writeFile(join(perDir, "matched.json"), JSON.stringify(score, null, 2));
    perFixture.push(score);
  }

  // Aggregate
  const gtTotal = perFixture.reduce((s, x) => s + x.gtTotal, 0);
  const ppTotal = perFixture.reduce((s, x) => s + x.ppTotal, 0);
  const matched = perFixture.reduce((s, x) => s + x.matched, 0);
  const sevAgreed = perFixture.reduce(
    (s, x) => s + x.verdicts.filter((v) => v.matched && v.severityAgrees).length,
    0
  );
  const catAgreed = perFixture.reduce(
    (s, x) => s + x.verdicts.filter((v) => v.matched && v.categoryAgrees).length,
    0
  );
  const recall = gtTotal > 0 ? matched / gtTotal : 0;
  const claimedAcross = perFixture.reduce(
    (s, x) => s + (x.ppTotal - x.falsePositives.length),
    0
  );
  const precision = ppTotal > 0 ? claimedAcross / ppTotal : 1;
  const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  const severityAcc = matched > 0 ? sevAgreed / matched : 0;
  const categoryAcc = matched > 0 ? catAgreed / matched : 0;

  const summary: BenchSummary = {
    runId: BENCH_ID!,
    startedAt: idx.runStartedAt,
    finishedAt: new Date().toISOString(),
    pp: {
      version: "0.5.0",
      provider: "proxy",
      model: "MiniMax-M2.7",
      maxSteps: idx.maxSteps,
      maxMinutes: idx.maxMinutes,
      agentsPerFixture: idx.agents,
    },
    fixtureCount: perFixture.length,
    aggregate: {
      gtTotal,
      ppTotal,
      matched,
      recall,
      precision,
      f1,
      severityAcc,
      categoryAcc,
    },
    perFixture,
  };

  const summaryPath = join(benchDir, "summary.json");
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));

  console.log("");
  console.log(`✓ aggregate · recall=${(recall * 100).toFixed(1)}% precision=${(precision * 100).toFixed(1)}% F1=${f1.toFixed(2)}`);
  console.log(`  severity acc=${(severityAcc * 100).toFixed(0)}% · category acc=${(categoryAcc * 100).toFixed(0)}%`);
  console.log(`  ${matched}/${gtTotal} ground-truth issues found · ${ppTotal - claimedAcross} false positives`);
  console.log(`  summary: ${summaryPath}`);
  console.log(`  next: npx tsx scripts/bench-report.ts ${BENCH_ID}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
