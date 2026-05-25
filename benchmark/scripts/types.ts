// Shared types for the pp-bench framework.

export type IssueCategory =
  | "信息架构"
  | "流程顺畅"
  | "功能契合"
  | "学习成本"
  | "视觉节奏"
  | "表达文案"
  | "可访问性"
  | "性能感知"
  | "与竞品对比"
  | "情感氛围";

export type Severity = "high" | "med" | "low";

export type GroundTruthIssue = {
  id: string;                     // local to fixture, e.g. "gt-01"
  title: string;                  // ≤30 char, the observation
  severity: Severity;
  category: IssueCategory;
  description: string;            // longer prose: where in the page, who would notice
  shouldFindWith?: string[];      // hint: which persona traits would surface this
};

export type Fixture = {
  id: string;                     // dir slug, e.g. "01-broken-todo"
  name: string;                   // human label, e.g. "Broken Todo App"
  hint: string;                   // hint passed to `pp run --hint`
  port: number;                   // local server port assignment
  groundTruth: GroundTruthIssue[];
  description?: string;           // optional brief for the scorecard
};

// Output of bench-run.ts per fixture
export type FixtureRunResult = {
  fixtureId: string;
  runId: string;                  // pp's run-NNN identifier
  runDir: string;                 // path under runs/bench-NNN/per-fixture/<id>/
  durationSec: number;
  agentCount: number;
  ppIssues: Array<{
    id: string;
    title: string;
    severity: Severity;
    category: string;
    quote: string;
    agentRef: string;
    evidence: number;
    journey: string;
  }>;
  error?: string;
};

// Output of bench-score.ts per (GT issue, pp finding) pair
export type MatchVerdict = {
  gtId: string;
  findingId: string | null;       // null if unmatched
  matched: boolean;
  confidence: number;             // 0..1
  reasoning: string;
  severityAgrees?: boolean;
  categoryAgrees?: boolean;
};

export type FixtureScore = {
  fixtureId: string;
  gtTotal: number;
  ppTotal: number;
  matched: number;                // GT issues that pp found
  recall: number;                 // matched / gtTotal
  precision: number;              // matched / ppTotal (or 1 if ppTotal=0)
  f1: number;
  severityAcc: number;            // among matched, fraction with right severity
  categoryAcc: number;            // among matched, fraction with right category
  verdicts: MatchVerdict[];
  falsePositives: Array<{ findingId: string; finding: { title: string; category: string; severity: Severity } }>;
  missed: Array<{ gtId: string; gt: GroundTruthIssue }>;
};

// Top-level summary written to runs/bench-NNN/summary.json
export type BenchSummary = {
  runId: string;                  // "bench-001"
  startedAt: string;
  finishedAt: string;
  pp: {
    version: string;
    provider: string;             // proxy / minimax / anthropic
    model: string;
    maxSteps: number;
    maxMinutes: number;
    agentsPerFixture: number | "auto";
  };
  fixtureCount: number;
  aggregate: {
    gtTotal: number;
    ppTotal: number;
    matched: number;
    recall: number;
    precision: number;
    f1: number;
    severityAcc: number;
    categoryAcc: number;
  };
  perFixture: FixtureScore[];
};
