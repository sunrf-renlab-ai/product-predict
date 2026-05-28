// Shared types — kept compatible with the prototype's data.js field names so the
// report viewer can render run.json without translation.

export type Persona = {
  id: string;
  name: string;
  age: number;
  role: string;
  tech: 1 | 2 | 3 | 4 | 5;       // proficiency
  tone: string;
  // Preferences — what this user cares about. 1+ items.
  // Drives natural exploration: a "values shortcuts" user tries Cmd+K early;
  // a "needs comparison data" user looks for exports/charts.
  preferences: string[];
  // Known context — facts the persona "remembers": existing tools they use or
  // tried, team size, prior failures.  Gives the LLM a realistic mental model.
  // e.g. "uses Notion daily", "tried Linear, found it too dev-centric", "team of 8".
  knownContext: string[];
  // Population proportion (0..1).  In a generated set, weights sum to ~1.0 and
  // represent realistic user mix.  Run selection samples by weight.
  weight: number;
  color: string;                  // hex; used for avatar tile + cursor
  glyph: string;                  // single-letter monogram
  traits: string[];
  // Origin — how this persona was created. "preset"=AI-generated for the target,
  // "beta"=derived from beta data, "manual"=user-edited.
  origin?: "preset" | "beta" | "mixed" | "manual";
};

export type Lang = "en" | "zh";

// A "persona set" — a population mix authored or generated for one target.
// Saved as JSON under ~/.pp/personas/<name>.json so the user can edit between runs.
export type PersonaSet = {
  id: string;                     // slug
  name: string;                   // human label
  targetHint: string;             // URL or description used at generation time
  origin: "preset" | "beta" | "mixed";
  createdAt: string;
  personas: Persona[];
  notes?: string;                 // freeform user notes
  lang?: Lang;                    // narration language for agents using this set (default "en")
  // For from-beta / mixed: list of source files that informed the generation.
  sources?: { path: string; kind: "doc" | "audio"; bytes: number; transcriptChars?: number }[];
};

export type EventKind =
  | "enter"
  | "click"
  | "shortcut"
  | "confused"
  | "delight"
  | "note"
  | "search"
  | "rage"
  | "exit";

export type Event = {
  t: string;                      // mm:ss:SS — sim-time stamp
  agent: string;                  // persona.id
  kind: EventKind;
  text: string;
  sentiment: number;              // -3..3
  url?: string;
  shot?: string;                  // path relative to run dir
};

export type Issue = {
  id: string;
  title: string;
  severity: "high" | "med" | "low";
  agents: number;                 // how many agents hit it
  category: string;
  quote: string;                  // one agent's quote
  agentRef: string;               // persona.id of quoted agent
  evidence: number;               // event count
  journey: string;                // where in flow
};

export type Delight = {
  title: string;
  count: number;
  quote: string;
  agent: string;
};

// One feature an agent actually invoked during their session.  Reported by the
// wrap-up LLM pass per agent; aggregated into FeatureFrequency across the run.
export type FeatureUse = {
  name: string;                   // canonical feature name, e.g. "create task"
  completed: boolean;              // did the agent achieve what they wanted?
  attempts: number;                // how many times they tried it
  sentiment: number;               // -3..3, how it felt
};

export type FeatureFrequency = {
  name: string;
  hitCount: number;                // agents who touched this feature
  hitRate: number;                  // 0..1 of total agents
  completionRate: number;          // among hits, fraction that succeeded
  avgSentiment: number;            // average across all attempts
  totalAttempts: number;            // sum of attempts across agents
};

// Why an agent ended their session — populated by the agent loop.
export type ExitReason =
  | "accomplished"                 // user said they got what they came for
  | "frustrated"                   // gave up because of bad experience
  | "explored"                     // satisfied curiosity, nothing more to try
  | "timeout"                       // safety cap (max steps or max minutes)
  | "crashed";                      // technical failure

export type RouteHeat = {
  path: string;
  visits: number;
  dwell: number;                  // seconds
  drop: number;                   // 0..1
};

export type RunMetrics = {
  predictedNps: number;
  achievableNps: number;
  taskSuccess: number;            // 0..1
  timeToValueSec: number | null;
  rageClicks: number;
  delightCount: number;
};

export type RunCost = {
  tokensIn: number;
  tokensOut: number;
  usd: number;
};

export type Run = {
  id: string;                     // run-001
  startedAt: string;
  finishedAt: string;
  target: {
    url: string;
    title: string;
    viewport: { w: number; h: number };
  };
  personaSetId?: string;          // which persona set this run used
  agents: (Persona & {
    crashed?: boolean;
    truncated?: boolean;          // hit safety cap (legacy)
    exitReason?: ExitReason;
    durationSec?: number;
  })[];
  activity: Event[];
  issues: Issue[];
  delights: Delight[];
  features: FeatureFrequency[];   // NEW v0.4: aggregated feature usage
  routesHeat: RouteHeat[];
  sentimentCurve: { t: number; v: number }[];
  metrics: RunMetrics;
  cost: RunCost;
};
