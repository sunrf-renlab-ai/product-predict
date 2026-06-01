// Calibration harness — the "planted-defect" ground-truth method for pp.
//
// We render a small task-manager app with KNOWN, controlled UX defects (one per
// fixture), run pp against each fixture with a pinned persona set, and measure
// whether pp's reported issues genuinely catch each planted defect (recall).
// Clean copies of the working app measure how many issues pp invents on a sound
// product (false-positive proxy), and an optional about:blank ablation measures
// how many issues pp emits with no real page at all (invention rate).
//
// This makes pp falsifiable on ONE narrow axis: issue-recall of controlled,
// first-visit-observable defects. It deliberately does NOT validate sentiment
// magnitude, NPS level, slow-burn / repeat-use issues, or real-population mix —
// the scorecard text says so out loud, because a high recall is meaningless if
// pp also "finds" defects on clean pages or on a blank page.

import { readFile } from "node:fs/promises";
import { join, resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

import type { Issue, PersonaSet } from "./types.js";
import { executeRun } from "./runner.js";
import { callJson, MOCK_MODE } from "./llm.js";

// ── Types ─────────────────────────────────────────────────────────────────

// One planted defect's ground-truth spec (mirrors manifest.json `defect`).
export type DefectSpec = {
  id: string;
  class: string;
  description: string;
  // Phrases a correct pp issue would plausibly contain. Used to steer the LLM
  // judge and as a keyword fallback (e.g. MOCK_MODE / no keys).
  expectedSignals: string[];
  // Is the defect noticeable on the very first visit? Recall is scored over
  // these only — pp cannot be expected to catch a slow-burn issue in one pass.
  firstVisitObservable: boolean;
};

// One fixture entry from the manifest.
export type Fixture = {
  file: string;
  kind: "defect" | "clean";
  defect?: DefectSpec;
};

export type FixtureManifest = {
  version: string;
  baseAppName: string;
  fixtures: Fixture[];
};

// The verdict from the LLM (or fallback) judge for one defect fixture.
export type JudgeVerdict = {
  caught: boolean;
  matchedIssueId: string | null;
  confidence: number; // 0..1
  reasoning: string;
};

// Result of running pp against one fixture.
export type FixtureResult = {
  fixture: Fixture;
  runId: string;
  issues: Issue[];
  // Present only for defect fixtures.
  verdict?: JudgeVerdict;
};

// Per-defect-class recall breakdown.
export type ClassRecall = {
  class: string;
  total: number;
  caught: number;
  recall: number; // 0..1
};

// The final, reportable scorecard.
export type Scorecard = {
  // Recall over first-visit-observable defects.
  observableDefects: number;
  observableCaught: number;
  recall: number; // 0..1
  byClass: ClassRecall[];
  // Per-defect detail for the table.
  defects: {
    id: string;
    class: string;
    firstVisitObservable: boolean;
    caught: boolean;
    confidence: number;
    matchedIssueId: string | null;
  }[];
  // False-positive proxy: issues pp emits per clean (working) run.
  cleanRuns: number;
  cleanIssueCounts: number[];
  meanIssuesPerCleanRun: number;
  minIssuesPerCleanRun: number;
  maxIssuesPerCleanRun: number;
  // Ablation: issues pp emits against about:blank (no real page). null = not run.
  ablationIssueCount: number | null;
  // One-line human verdict.
  verdict: string;
};

// ── Manifest loading ────────────────────────────────────────────────────────

export async function loadManifest(dir: string): Promise<FixtureManifest> {
  const path = join(dir, "manifest.json");
  const raw = await readFile(path, "utf8");
  const m = JSON.parse(raw) as FixtureManifest;
  if (!Array.isArray(m.fixtures)) {
    throw new Error(`calibrate: ${path} has no fixtures[] array`);
  }
  return m;
}

// ── Judge ─────────────────────────────────────────────────────────────────

// Decide whether ANY pp-reported issue genuinely describes the planted defect.
// Uses callJson as an LLM semantic judge; in MOCK_MODE (or if the judge fails)
// falls back to a keyword match against expectedSignals so the pipeline stays
// testable without API keys.
export async function judgeDefectCaught(
  defect: DefectSpec,
  issues: Issue[]
): Promise<JudgeVerdict> {
  if (issues.length === 0) {
    return { caught: false, matchedIssueId: null, confidence: 1, reasoning: "pp reported no issues at all." };
  }

  if (MOCK_MODE) return keywordJudge(defect, issues);

  const issueList = issues
    .map((i) => `- id=${i.id} | title: ${i.title}\n  quote: "${i.quote}"\n  category: ${i.category} | journey: ${i.journey}`)
    .join("\n");

  const system =
    "You are a strict evaluator for a UX-prediction tool's recall. You are given ONE " +
    "planted, ground-truth UX defect and a list of issues the tool reported for the " +
    "same page. Decide whether ANY single reported issue genuinely describes THAT " +
    "specific defect — the same root cause, not a vague or generic complaint that " +
    "merely overlaps in topic. A generic gripe (\"the UI feels cluttered\", \"I was " +
    "confused\") does NOT count unless it clearly pins the planted defect. Be " +
    "conservative: when unsure, mark caught=false. Output ONLY one JSON object: " +
    '{ "caught": boolean, "matchedIssueId": string|null, "confidence": number (0..1), "reasoning": string }.';

  const prompt =
    `PLANTED DEFECT\n` +
    `  class: ${defect.class}\n` +
    `  description: ${defect.description}\n` +
    `  signals a correct catch would contain (semantic, not literal): ${defect.expectedSignals.join("; ")}\n\n` +
    `REPORTED ISSUES (${issues.length}):\n${issueList}\n\n` +
    `Does any single reported issue genuinely describe the planted defect? ` +
    `Set matchedIssueId to the matching issue's id (or null). confidence is your ` +
    `certainty in the caught verdict.`;

  try {
    const v = await callJson<Partial<JudgeVerdict>>({ system, prompt, maxTokens: 600 });
    const matchedIssueId =
      typeof v.matchedIssueId === "string" && issues.some((i) => i.id === v.matchedIssueId)
        ? v.matchedIssueId
        : null;
    const caught = v.caught === true && (matchedIssueId !== null || issues.length > 0);
    return {
      caught,
      matchedIssueId: caught ? matchedIssueId : null,
      confidence: clamp01(typeof v.confidence === "number" ? v.confidence : caught ? 0.7 : 0.5),
      reasoning: typeof v.reasoning === "string" && v.reasoning.trim() ? v.reasoning.trim() : "(no reasoning returned)",
    };
  } catch (e) {
    // LLM judge unavailable / malformed — fall back to keywords so calibration
    // still produces a (clearly weaker) verdict rather than crashing.
    const fb = keywordJudge(defect, issues);
    return { ...fb, reasoning: `LLM judge failed (${(e as Error).message}); keyword fallback: ${fb.reasoning}` };
  }
}

// Keyword fallback: a reported issue "catches" the defect if its title+quote
// contains any expectedSignal phrase (case-insensitive, loose word match).
function keywordJudge(defect: DefectSpec, issues: Issue[]): JudgeVerdict {
  const signals = defect.expectedSignals.map((s) => s.toLowerCase());
  for (const iss of issues) {
    const hay = `${iss.title} ${iss.quote} ${iss.category} ${iss.journey}`.toLowerCase();
    const hit = signals.find((sig) => hay.includes(sig));
    if (hit) {
      return {
        caught: true,
        matchedIssueId: iss.id,
        confidence: 0.6,
        reasoning: `Keyword match: reported issue "${iss.title}" contains signal "${hit}".`,
      };
    }
  }
  return {
    caught: false,
    matchedIssueId: null,
    confidence: 0.6,
    reasoning: `No reported issue contained any expected signal for class "${defect.class}".`,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// ── Orchestration ────────────────────────────────────────────────────────

export async function runCalibration(opts: {
  fixturesDir: string;
  personaSet: PersonaSet;
  outDir: string;
  agents?: number;
  maxSteps?: number;
  includeAblation?: boolean;
  headless?: boolean;
  log?: (s: string) => void;
}): Promise<{ results: FixtureResult[]; scorecard: Scorecard }> {
  const log = opts.log ?? (() => {});
  const dir = isAbsolute(opts.fixturesDir) ? opts.fixturesDir : resolve(opts.fixturesDir);
  const manifest = await loadManifest(dir);
  const maxSteps = opts.maxSteps ?? 24;
  const headless = opts.headless ?? true;

  log(`calibrate: ${manifest.baseAppName} · ${manifest.fixtures.length} fixtures · persona set "${opts.personaSet.id}"`);

  const results: FixtureResult[] = [];
  for (const fixture of manifest.fixtures) {
    const url = pathToFileURL(join(dir, fixture.file)).href;
    log(`calibrate: running ${fixture.kind} fixture ${fixture.file}`);
    const { run } = await executeRun({
      targetUrl: url,
      personaSet: opts.personaSet,
      agents: opts.agents,
      maxSteps,
      maxMinutes: 6,
      outDir: opts.outDir,
      headless,
      log: (s) => log(`    ${s}`),
    });

    const fr: FixtureResult = { fixture, runId: run.id, issues: run.issues };
    if (fixture.kind === "defect" && fixture.defect) {
      fr.verdict = await judgeDefectCaught(fixture.defect, run.issues);
      log(`    verdict: ${fr.verdict.caught ? "CAUGHT" : "missed"} (${fr.verdict.matchedIssueId ?? "-"}) — ${fr.verdict.reasoning}`);
    } else {
      log(`    clean fixture emitted ${run.issues.length} issue(s)`);
    }
    results.push(fr);
  }

  // Ablation — run pp against a blank page with no real content. Any issue it
  // emits here is, by construction, invented.
  let ablationIssueCount: number | null = null;
  if (opts.includeAblation) {
    log(`calibrate: ablation run against about:blank`);
    const { run } = await executeRun({
      targetUrl: "about:blank",
      personaSet: opts.personaSet,
      agents: opts.agents,
      maxSteps,
      maxMinutes: 6,
      outDir: opts.outDir,
      headless,
      log: (s) => log(`    ${s}`),
    });
    ablationIssueCount = run.issues.length;
    log(`    ablation emitted ${ablationIssueCount} issue(s) on a blank page`);
  }

  const scorecard = scoreCalibration(results, ablationIssueCount);
  return { results, scorecard };
}

// ── Scoring (pure) ───────────────────────────────────────────────────────

export function scoreCalibration(results: FixtureResult[], ablationIssueCount?: number | null): Scorecard {
  const defectResults = results.filter((r) => r.fixture.kind === "defect" && r.fixture.defect);
  const cleanResults = results.filter((r) => r.fixture.kind === "clean");

  // Recall is scored over first-visit-observable defects only.
  const observable = defectResults.filter((r) => r.fixture.defect!.firstVisitObservable);
  const observableCaught = observable.filter((r) => r.verdict?.caught === true).length;
  const recall = observable.length > 0 ? observableCaught / observable.length : 0;

  // Per-class recall (over observable defects).
  const classMap = new Map<string, { total: number; caught: number }>();
  for (const r of observable) {
    const cls = r.fixture.defect!.class;
    const cur = classMap.get(cls) ?? { total: 0, caught: 0 };
    cur.total++;
    if (r.verdict?.caught === true) cur.caught++;
    classMap.set(cls, cur);
  }
  const byClass: ClassRecall[] = Array.from(classMap.entries())
    .map(([cls, v]) => ({ class: cls, total: v.total, caught: v.caught, recall: v.total ? v.caught / v.total : 0 }))
    .sort((a, b) => a.recall - b.recall || a.class.localeCompare(b.class));

  // Per-defect detail (all defects, observable or not).
  const defects = defectResults.map((r) => ({
    id: r.fixture.defect!.id,
    class: r.fixture.defect!.class,
    firstVisitObservable: r.fixture.defect!.firstVisitObservable,
    caught: r.verdict?.caught === true,
    confidence: r.verdict?.confidence ?? 0,
    matchedIssueId: r.verdict?.matchedIssueId ?? null,
  }));

  // Clean-control false-positive proxy.
  const cleanIssueCounts = cleanResults.map((r) => r.issues.length);
  const cleanRuns = cleanIssueCounts.length;
  const meanIssuesPerCleanRun = cleanRuns
    ? cleanIssueCounts.reduce((s, n) => s + n, 0) / cleanRuns
    : 0;
  const minIssuesPerCleanRun = cleanRuns ? Math.min(...cleanIssueCounts) : 0;
  const maxIssuesPerCleanRun = cleanRuns ? Math.max(...cleanIssueCounts) : 0;

  const ablation = ablationIssueCount ?? null;

  // One-line verdict, hedged by the noise floor.
  const recallPct = Math.round(recall * 100);
  const noisy = meanIssuesPerCleanRun >= 2 || (ablation != null && ablation >= 2);
  let verdict: string;
  if (observable.length === 0) {
    verdict = "No first-visit-observable defects scored — cannot assess recall.";
  } else if (recall >= 0.8 && !noisy) {
    verdict = `Strong: caught ${observableCaught}/${observable.length} planted defects (${recallPct}%) with a low false-positive floor (${meanIssuesPerCleanRun.toFixed(1)} issues/clean run).`;
  } else if (recall >= 0.8 && noisy) {
    verdict = `High recall (${recallPct}%) but NOISY: ${meanIssuesPerCleanRun.toFixed(1)} issues/clean run${ablation != null ? ` and ${ablation} on a blank page` : ""} — recall is discounted by the false-positive/invention floor.`;
  } else if (recall >= 0.5) {
    verdict = `Mixed: caught ${observableCaught}/${observable.length} planted defects (${recallPct}%). Inspect missed classes below.`;
  } else {
    verdict = `Weak: caught only ${observableCaught}/${observable.length} planted defects (${recallPct}%).`;
  }

  return {
    observableDefects: observable.length,
    observableCaught,
    recall,
    byClass,
    defects,
    cleanRuns,
    cleanIssueCounts,
    meanIssuesPerCleanRun,
    minIssuesPerCleanRun,
    maxIssuesPerCleanRun,
    ablationIssueCount: ablation,
    verdict,
  };
}

// ── Rendering ────────────────────────────────────────────────────────────

export function renderScorecardMarkdown(s: Scorecard): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const lines: string[] = [];

  lines.push("# pp calibration scorecard");
  lines.push("");
  lines.push(`**Verdict:** ${s.verdict}`);
  lines.push("");

  lines.push("## What this validates (and what it does NOT)");
  lines.push("");
  lines.push(
    "This harness measures ONE thing: **issue-recall of controlled, first-visit-" +
      "observable UX defects** that were deliberately planted into an otherwise-working " +
      "app. It answers \"when a known defect is on the page, does pp actually report it?\""
  );
  lines.push("");
  lines.push("It does **NOT** validate:");
  lines.push("- the accuracy of sentiment magnitude or scores,");
  lines.push("- predicted NPS level or any absolute metric,");
  lines.push("- slow-burn, repeat-use, or longitudinal issues (only first-visit defects are scored),");
  lines.push("- whether the persona mix reflects a real user population.");
  lines.push("");
  lines.push(
    "A high recall is **meaningless on its own**: read it together with the clean-" +
      "control false-positive rate and the blank-page invention rate below. If pp also " +
      '"finds" defects on a working app or on an empty page, recall is just noise.'
  );
  lines.push("");

  lines.push("## Recall (first-visit-observable defects)");
  lines.push("");
  lines.push(`**${s.observableCaught} / ${s.observableDefects} caught = ${pct(s.recall)}**`);
  lines.push("");
  if (s.byClass.length) {
    lines.push("| defect class | caught | total | recall |");
    lines.push("| --- | --- | --- | --- |");
    for (const c of s.byClass) {
      lines.push(`| ${c.class} | ${c.caught} | ${c.total} | ${pct(c.recall)} |`);
    }
    lines.push("");
  }

  lines.push("### Per-defect detail");
  lines.push("");
  lines.push("| defect | class | first-visit | caught | confidence | matched issue |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const d of s.defects) {
    lines.push(
      `| ${d.id} | ${d.class} | ${d.firstVisitObservable ? "yes" : "no"} | ${d.caught ? "✓" : "✗"} | ${d.confidence.toFixed(2)} | ${d.matchedIssueId ?? "—"} |`
    );
  }
  lines.push("");

  lines.push("## False-positive floor (clean controls)");
  lines.push("");
  lines.push(
    `Across **${s.cleanRuns}** runs of the working app, pp reported a mean of ` +
      `**${s.meanIssuesPerCleanRun.toFixed(2)} issues/run** (min ${s.minIssuesPerCleanRun}, max ${s.maxIssuesPerCleanRun}).`
  );
  lines.push("");
  lines.push(
    s.meanIssuesPerCleanRun >= 2
      ? "> ⚠️ This is a non-trivial false-positive floor. Discount the recall above accordingly — some \"catches\" may be pp reliably finding issues everywhere."
      : "> The working app produced few issues, so the recall above is mostly signal rather than noise."
  );
  lines.push("");
  if (s.cleanIssueCounts.length) {
    lines.push(`Per-run clean issue counts: ${s.cleanIssueCounts.join(", ")}.`);
    lines.push("");
  }

  lines.push("## Invention rate (blank-page ablation)");
  lines.push("");
  if (s.ablationIssueCount == null) {
    lines.push("Ablation not run (pass `includeAblation: true` to measure issues pp emits on `about:blank`).");
  } else {
    lines.push("On `about:blank` (no real page at all), pp reported **" + s.ablationIssueCount + "** issue(s).");
    lines.push("");
    lines.push(
      s.ablationIssueCount >= 1
        ? "> ⚠️ pp invents issues with no page to look at. Any recall claim must be read against this invention floor."
        : "> pp emitted no issues on a blank page — a good sign it is reacting to the page rather than confabulating."
    );
  }
  lines.push("");

  return lines.join("\n");
}

// ── Multi-round (de-noised) calibration ──────────────────────────────────────
// A single calibrate run is a coin-flip per defect (the LLM judge + the agent
// session are stochastic — one run flips ±1-2 defects). Running N rounds turns
// each defect's caught={true|false} into a real CATCH RATE (e.g. 4/5 = 80%) and
// the false-positive floor into mean ± stdev across rounds.

export type MultiRoundScorecard = {
  rounds: number;
  perDefect: {
    id: string;
    class: string;
    firstVisitObservable: boolean;
    caught: number; // how many rounds caught it
    rounds: number;
    rate: number; // caught / rounds
    avgConfidence: number;
  }[];
  meanRecall: number; // mean over rounds, observable defects
  recallPerRound: number[];
  cleanFalsePosMean: number; // mean issues/clean-run across all rounds
  cleanFalsePosStdev: number; // stdev of the per-round clean means
  cleanFalsePosPerRound: number[];
  ablationMean: number | null;
  verdict: string;
};

export function aggregateRounds(cards: Scorecard[]): MultiRoundScorecard {
  const rounds = cards.length;
  const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
  const stdev = (xs: number[]) => {
    if (xs.length < 2) return 0;
    const m = mean(xs);
    return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
  };

  // Per-defect catch rate across rounds (defect set is identical every round).
  const byId = new Map<string, { id: string; class: string; firstVisitObservable: boolean; caught: number; conf: number[] }>();
  for (const c of cards) {
    for (const d of c.defects) {
      const cur = byId.get(d.id) ?? { id: d.id, class: d.class, firstVisitObservable: d.firstVisitObservable, caught: 0, conf: [] };
      if (d.caught) cur.caught++;
      cur.conf.push(d.confidence);
      byId.set(d.id, cur);
    }
  }
  const perDefect = Array.from(byId.values())
    .map((d) => ({
      id: d.id,
      class: d.class,
      firstVisitObservable: d.firstVisitObservable,
      caught: d.caught,
      rounds,
      rate: rounds ? d.caught / rounds : 0,
      avgConfidence: mean(d.conf),
    }))
    .sort((a, b) => a.rate - b.rate || a.class.localeCompare(b.class));

  const recallPerRound = cards.map((c) => c.recall);
  const cleanFalsePosPerRound = cards.map((c) => c.meanIssuesPerCleanRun);
  const ablations = cards.map((c) => c.ablationIssueCount).filter((x): x is number => x != null);

  const meanRecall = mean(recallPerRound);
  const cleanMean = mean(cleanFalsePosPerRound);
  const robust = perDefect.filter((d) => d.firstVisitObservable && d.rate >= 0.8).length;
  const observable = perDefect.filter((d) => d.firstVisitObservable).length;
  const verdict =
    `Over ${rounds} rounds: mean recall ${Math.round(meanRecall * 100)}% · ` +
    `${robust}/${observable} defects caught robustly (≥80% of rounds) · ` +
    `false-positive floor ${cleanMean.toFixed(1)} ± ${stdev(cleanFalsePosPerRound).toFixed(1)} issues/clean run` +
    (ablations.length ? ` · blank-page invention ${mean(ablations).toFixed(1)}` : "") + ".";

  return {
    rounds,
    perDefect,
    meanRecall,
    recallPerRound,
    cleanFalsePosMean: cleanMean,
    cleanFalsePosStdev: stdev(cleanFalsePosPerRound),
    cleanFalsePosPerRound,
    ablationMean: ablations.length ? mean(ablations) : null,
    verdict,
  };
}

export async function runMultiRoundCalibration(
  opts: Parameters<typeof runCalibration>[0],
  rounds: number
): Promise<{ scorecards: Scorecard[]; multi: MultiRoundScorecard }> {
  const log = opts.log ?? (() => {});
  const n = Math.max(1, rounds);
  const scorecards: Scorecard[] = [];
  for (let r = 0; r < n; r++) {
    log(`=== calibration round ${r + 1}/${n} ===`);
    const { scorecard } = await runCalibration({ ...opts, outDir: join(opts.outDir, `round-${r + 1}`) });
    scorecards.push(scorecard);
  }
  return { scorecards, multi: aggregateRounds(scorecards) };
}

export function renderMultiRoundMarkdown(m: MultiRoundScorecard): string {
  const lines: string[] = [];
  lines.push(`# pp calibration scorecard · ${m.rounds} rounds (de-noised)`);
  lines.push("");
  lines.push(`**Verdict:** ${m.verdict}`);
  lines.push("");
  lines.push("## Per-defect catch rate");
  lines.push("");
  lines.push("| defect | class | first-visit? | catch rate | avg conf |");
  lines.push("|---|---|---|---|---|");
  for (const d of m.perDefect) {
    const mark = d.rate >= 0.8 ? "●" : d.rate === 0 ? "○" : "◐";
    lines.push(`| ${mark} ${d.id} | ${d.class} | ${d.firstVisitObservable ? "yes" : "no"} | ${d.caught}/${d.rounds} (${Math.round(d.rate * 100)}%) | ${d.avgConfidence.toFixed(2)} |`);
  }
  lines.push("");
  lines.push(`Mean recall: ${Math.round(m.meanRecall * 100)}% (per round: ${m.recallPerRound.map((r) => Math.round(r * 100) + "%").join(", ")}).`);
  lines.push("");
  lines.push("## False-positive floor (clean controls)");
  lines.push("");
  lines.push(`${m.cleanFalsePosMean.toFixed(1)} ± ${m.cleanFalsePosStdev.toFixed(1)} issues/clean run (per round: ${m.cleanFalsePosPerRound.map((x) => x.toFixed(1)).join(", ")}).`);
  if (m.ablationMean != null) {
    lines.push("");
    lines.push(`Blank-page invention: ${m.ablationMean.toFixed(1)} issues/run on \`about:blank\`.`);
  }
  lines.push("");
  return lines.join("\n");
}
