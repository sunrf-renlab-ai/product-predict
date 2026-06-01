// diffusion.ts — the MACRO layer.
//
// pp's micro layer (real browser + LLM personas) measures, per archetype, HOW a
// reached user FEELS on first visit. This module turns that grounded signal into
// the per-segment coefficients of a transparent, cheap, segmented compartmental
// diffusion model — then simulates a whole population (default 1,000,000) flowing
// through an awareness → trial → activation → heavy-use → churn funnel.
//
// HONESTY CONTRACT (do not erase):
//   • The 1,000,000 "agents" are a population VECTOR, not 1,000,000 LLM runs.
//     They cost arithmetic, not API calls. The expensive layer still runs on
//     6–24 archetype representatives.
//   • What pp MEASURES (grounded): per-segment activation / deepen / churn /
//     share-propensity, derived from observed first-visit behaviour.
//   • What the USER ASSUMES (exogenous, never fabricated): reach (marketing /
//     external awareness) and q (word-of-mouth strength). pp cannot see ad spend,
//     SEO rank, or who the founder knows — so these are inputs/sliders, swept for
//     a BAND, never asserted as a single point forecast.
//   • The product output is a scenario band + the bifurcation point ("below q=X
//     you fizzle, above it you take off"), not "you will get N users".
//
// The coefficient-mapping constants below (CALIB) are the calibration surface:
// the place ALL real-world error lives. They MUST be tuned against ground truth
// (see calibrate.ts), not trusted as magic numbers.

import type { Run, ExitReason } from "./types.js";

// ── Public types ─────────────────────────────────────────────────────────────

export type Segment = {
  id: string; // archetype id (slot suffix stripped)
  label: string; // "Maya Chen · PM"
  color: string; // persona color (for the viz)
  weight: number; // population mass fraction (0..1), normalized across segments
  // Grounded behavioural signals measured by the micro layer:
  meanSentiment: number; // -3..3, mean over this archetype's events
  accomplishedFrac: number; // 0..1 of this archetype's agents that accomplished
  frustratedFrac: number; // 0..1 ended frustrated/timeout/crashed
  delightRate: number; // delight events per event
  rageRate: number; // rage events per event
  agents: number; // how many slot-instances of this archetype ran
  events: number; // total events observed for this archetype
};

// Per-segment diffusion coefficients derived from the grounded signals.
export type SegmentCoeffs = {
  id: string;
  activation: number; // a_s — fraction of triers who stick (Aw→Ac), 0..1
  deepen: number; // d_s — Ac→Hv per step
  churn: number; // c_s — Ac/Hv → Churn per step
  shareProp: number; // relative WOM multiplier (~1 = neutral)
};

// Exogenous + swept knobs. reach (p) and q are USER ASSUMPTIONS.
export type DiffusionParams = {
  population: number; // N, default 1_000_000
  steps: number; // time steps (e.g. weeks)
  reach: number; // p — external awareness rate / step (marketing). EXOGENOUS.
  q: number; // word-of-mouth coefficient. EXOGENOUS / SWEPT.
  trialRate: number; // fraction of aware who actually try
  awareDecay: number; // aware-but-not-activated who give up / step
  heavyChurnFactor: number; // heavy users churn at c_s * this (stickier)
  seedFrac: number; // tiny initial aware seed so WOM can ignite
};

export type CompartmentTotals = {
  unaware: number;
  aware: number;
  active: number; // light users currently active
  heavy: number;
  churned: number;
};

export type Trajectory = {
  steps: number;
  series: CompartmentTotals[]; // length steps+1, index 0 = initial
  perSegmentFinal: { id: string; label: string; color: string; final: CompartmentTotals }[];
};

export type DiffusionSummary = {
  population: number;
  neverReachedPct: number; // still unaware at end
  everReachedPct: number;
  activeLightPct: number; // light users at end
  heavyPct: number; // heavy users at end
  churnedPct: number;
  peakActive: number; // max (active+heavy)
  peakStep: number;
};

export type SweepPoint = { q: number; everReachedPct: number; activeEndPct: number };

// 2D sensitivity surface over the two exogenous assumptions (reach × q).
// grid[ri][qi] = ever-reached % at (reachValues[ri], qValues[qi]). Persisted in
// diffusion.json so the heatmap is backed by real, inspectable, testable data.
export type Sensitivity2D = {
  reachValues: number[];
  qValues: number[];
  grid: number[][]; // [reach][q] -> ever-reached %
};

export type DiffusionResult = {
  runId: string;
  target: string;
  generatedAt: string;
  segments: Segment[];
  coeffs: SegmentCoeffs[];
  params: DiffusionParams;
  trajectory: Trajectory;
  summary: DiffusionSummary;
  sweep: SweepPoint[]; // bifurcation: everReached vs q
  sensitivity2D: Sensitivity2D; // reach × q surface (the heatmap data)
  bifurcationQ: number | null; // q at the steepest takeoff (the tipping point), null if none
  calib: typeof CALIB; // surfaced so the viz can show the calibration surface
};

// ── Calibration surface (TUNE against ground truth — not magic numbers) ───────

export const CALIB = {
  // activation a_s = clamp(base + sent*sentNorm + acc*accomplishedFrac - frust*frustratedFrac)
  act: { base: 0.28, sent: 0.22, acc: 0.25, frust: 0.22, min: 0.02, max: 0.95 },
  // churn c_s = clamp(base + frust*frustratedFrac + neg*max(0,-sentNorm))
  churn: { base: 0.04, frust: 0.14, neg: 0.12, min: 0.008, max: 0.6 },
  // deepen d_s = clamp(base + del*delightRate + acc*accomplishedFrac)
  deepen: { base: 0.03, del: 0.5, acc: 0.06, min: 0.004, max: 0.5 },
  // shareProp = clamp(1 + del*delightRate + sent*sentNorm - rage*rageRate)
  share: { base: 1, del: 2.0, sent: 0.5, rage: 3.0, min: 0.1, max: 3.0 },
} as const;

export const DEFAULT_PARAMS: DiffusionParams = {
  population: 1_000_000,
  steps: 52,
  reach: 0.006, // ~0.6% of remaining unaware reached per step — a modest launch.
  //            Most of the population stays unaware (the realistic default);
  //            crank the slider up to model an aggressive paid push.
  q: 0.35, // word-of-mouth strength (swept)
  trialRate: 0.6,
  awareDecay: 0.25,
  heavyChurnFactor: 0.3,
  seedFrac: 0.002,
};

// ── Segment extraction (from a real run.json — no LLM, pure read) ─────────────

const baseId = (id: string): string => id.replace(/-\d+$/, "");
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const BAD_EXIT: ReadonlySet<ExitReason> = new Set<ExitReason>(["frustrated", "timeout", "crashed"]);

/** Group a run's replicated agent slots back into archetypes and measure each
 *  segment's grounded behavioural signals. */
export function extractSegments(run: Run): Segment[] {
  // Group agents (slots) by archetype.
  type Acc = {
    id: string;
    label: string;
    color: string;
    weight: number;
    agents: number;
    accomplished: number;
    frustrated: number;
  };
  const byArch = new Map<string, Acc>();
  for (const a of run.agents) {
    const aid = baseId(a.id);
    let cur = byArch.get(aid);
    if (!cur) {
      cur = {
        id: aid,
        label: `${a.name}${a.role ? " · " + a.role : ""}`,
        color: a.color || "#888888",
        weight: Math.max(0, a.weight || 0),
        agents: 0,
        accomplished: 0,
        frustrated: 0,
      };
      byArch.set(aid, cur);
    }
    cur.agents++;
    if (a.exitReason === "accomplished") cur.accomplished++;
    if (a.exitReason && BAD_EXIT.has(a.exitReason)) cur.frustrated++;
  }

  // Per-archetype event signals.
  type Ev = { n: number; sentSum: number; delight: number; rage: number };
  const evByArch = new Map<string, Ev>();
  for (const e of run.activity) {
    const aid = baseId(e.agent);
    let cur = evByArch.get(aid);
    if (!cur) {
      cur = { n: 0, sentSum: 0, delight: 0, rage: 0 };
      evByArch.set(aid, cur);
    }
    cur.n++;
    cur.sentSum += e.sentiment || 0;
    if ((e.sentiment || 0) >= 2) cur.delight++;
    if (e.kind === "rage") cur.rage++;
  }

  const segments: Segment[] = [];
  for (const acc of byArch.values()) {
    const ev = evByArch.get(acc.id) || { n: 0, sentSum: 0, delight: 0, rage: 0 };
    const n = Math.max(1, ev.n);
    segments.push({
      id: acc.id,
      label: acc.label,
      color: acc.color,
      weight: acc.weight,
      meanSentiment: ev.n ? ev.sentSum / ev.n : 0,
      accomplishedFrac: acc.agents ? acc.accomplished / acc.agents : 0,
      frustratedFrac: acc.agents ? acc.frustrated / acc.agents : 0,
      delightRate: ev.delight / n,
      rageRate: ev.rage / n,
      agents: acc.agents,
      events: ev.n,
    });
  }

  // Normalize weights to sum to 1 (fall back to equal if all zero).
  const sum = segments.reduce((s, x) => s + x.weight, 0);
  if (sum > 0) for (const s of segments) s.weight = s.weight / sum;
  else for (const s of segments) s.weight = 1 / segments.length;

  return segments;
}

// ── Coefficient mapping (the grounded → model bridge) ─────────────────────────

export function deriveCoeffs(seg: Segment): SegmentCoeffs {
  const sentNorm = clamp(seg.meanSentiment / 3, -1, 1);
  const a = CALIB.act;
  const c = CALIB.churn;
  const d = CALIB.deepen;
  const s = CALIB.share;
  return {
    id: seg.id,
    activation: clamp(a.base + a.sent * sentNorm + a.acc * seg.accomplishedFrac - a.frust * seg.frustratedFrac, a.min, a.max),
    churn: clamp(c.base + c.frust * seg.frustratedFrac + c.neg * Math.max(0, -sentNorm), c.min, c.max),
    deepen: clamp(d.base + d.del * seg.delightRate + d.acc * seg.accomplishedFrac, d.min, d.max),
    shareProp: clamp(s.base + s.del * seg.delightRate + s.sent * sentNorm - s.rage * seg.rageRate, s.min, s.max),
  };
}

// ── The simulation (deterministic difference equations) ───────────────────────

type SegState = { U: number; A: number; Ac: number; Hv: number; Ch: number; M: number };

function initStates(segments: Segment[], params: DiffusionParams): SegState[] {
  return segments.map((seg) => {
    const M = seg.weight * params.population;
    const seed = M * params.seedFrac;
    return { U: M - seed, A: seed, Ac: 0, Hv: 0, Ch: 0, M };
  });
}

function totals(states: SegState[]): CompartmentTotals {
  const t: CompartmentTotals = { unaware: 0, aware: 0, active: 0, heavy: 0, churned: 0 };
  for (const s of states) {
    t.unaware += s.U;
    t.aware += s.A;
    t.active += s.Ac;
    t.heavy += s.Hv;
    t.churned += s.Ch;
  }
  return t;
}

/** Deterministic forward simulation. Returns the full trajectory. */
export function simulate(segments: Segment[], coeffs: SegmentCoeffs[], params: DiffusionParams): Trajectory {
  const coeffById = new Map(coeffs.map((c) => [c.id, c]));
  const states = initStates(segments, params);
  const series: CompartmentTotals[] = [totals(states)];
  const N = params.population || 1;

  for (let step = 0; step < params.steps; step++) {
    const totActive = states.reduce((s, st) => s + st.Ac + st.Hv, 0);
    const activeFrac = totActive / N;

    for (let i = 0; i < states.length; i++) {
      const st = states[i];
      const co = coeffById.get(segments[i].id)!;

      // 1) Awareness inflow = external marketing (exogenous p) + word of mouth (q).
      const extAware = params.reach * st.U;
      const womAware = params.q * co.shareProp * activeFrac * st.U;
      const newAware = Math.min(st.U, extAware + womAware);
      st.U -= newAware;
      st.A += newAware;

      // 2) Trial → activation (a_s grounded in pp's first-visit measurement).
      const newActive = co.activation * params.trialRate * st.A;
      st.A -= newActive;
      st.Ac += newActive;

      // 3) Aware-but-not-activated give up consideration.
      const abandon = params.awareDecay * st.A;
      st.A -= abandon;
      st.Ch += abandon;

      // 4) Deepen: light → heavy.
      const newHeavy = co.deepen * st.Ac;
      st.Ac -= newHeavy;
      st.Hv += newHeavy;

      // 5) Churn (heavy users are stickier).
      const churnAc = co.churn * st.Ac;
      const churnHv = co.churn * params.heavyChurnFactor * st.Hv;
      st.Ac -= churnAc;
      st.Hv -= churnHv;
      st.Ch += churnAc + churnHv;
    }
    series.push(totals(states));
  }

  const perSegmentFinal = segments.map((seg, i) => ({
    id: seg.id,
    label: seg.label,
    color: seg.color,
    final: {
      unaware: states[i].U,
      aware: states[i].A,
      active: states[i].Ac,
      heavy: states[i].Hv,
      churned: states[i].Ch,
    },
  }));

  return { steps: params.steps, series, perSegmentFinal };
}

export function summarize(traj: Trajectory, population: number): DiffusionSummary {
  const last = traj.series[traj.series.length - 1];
  const pct = (n: number) => (population ? (n / population) * 100 : 0);
  let peakActive = 0;
  let peakStep = 0;
  traj.series.forEach((t, i) => {
    const a = t.active + t.heavy;
    if (a > peakActive) {
      peakActive = a;
      peakStep = i;
    }
  });
  return {
    population,
    neverReachedPct: pct(last.unaware),
    everReachedPct: 100 - pct(last.unaware),
    activeLightPct: pct(last.active),
    heavyPct: pct(last.heavy),
    churnedPct: pct(last.churned),
    peakActive,
    peakStep,
  };
}

// ── Sensitivity sweep over q (the bifurcation) ────────────────────────────────

export function sweepQ(
  segments: Segment[],
  coeffs: SegmentCoeffs[],
  params: DiffusionParams,
  qValues: number[]
): SweepPoint[] {
  return qValues.map((q) => {
    const traj = simulate(segments, coeffs, { ...params, q });
    const last = traj.series[traj.series.length - 1];
    const N = params.population || 1;
    return {
      q,
      everReachedPct: 100 - (last.unaware / N) * 100,
      activeEndPct: ((last.active + last.heavy) / N) * 100,
    };
  });
}

/** 2D sensitivity surface: ever-reached % across reach × q. The two axes are
 *  the exogenous assumptions; every other param is held at `params`. */
export function sweep2D(
  segments: Segment[],
  coeffs: SegmentCoeffs[],
  params: DiffusionParams,
  reachValues: number[],
  qValues: number[]
): Sensitivity2D {
  const N = params.population || 1;
  const grid = reachValues.map((reach) =>
    qValues.map((q) => {
      const traj = simulate(segments, coeffs, { ...params, reach, q });
      const last = traj.series[traj.series.length - 1];
      return Math.round((1 - last.unaware / N) * 1000) / 10; // ever-reached %, 0.1 precision
    })
  );
  return { reachValues, qValues, grid };
}

/** Find the q where adoption takes off fastest — the steepest rise in
 *  ever-reached across the sweep (the tipping point to show the user). */
function findBifurcation(sweep: SweepPoint[]): number | null {
  if (sweep.length < 2) return null;
  let bestSlope = 0;
  let bestQ: number | null = null;
  for (let i = 1; i < sweep.length; i++) {
    const dq = sweep[i].q - sweep[i - 1].q || 1e-9;
    const slope = (sweep[i].everReachedPct - sweep[i - 1].everReachedPct) / dq;
    if (slope > bestSlope) {
      bestSlope = slope;
      bestQ = (sweep[i].q + sweep[i - 1].q) / 2;
    }
  }
  // Only call it a bifurcation if the takeoff is meaningfully steep.
  return bestSlope > 30 ? bestQ : null;
}

// ── Top-level convenience ─────────────────────────────────────────────────────

export function runDiffusion(run: Run, overrides: Partial<DiffusionParams> = {}, nowIso: string): DiffusionResult {
  const params: DiffusionParams = { ...DEFAULT_PARAMS, ...overrides };
  const segments = extractSegments(run);
  const coeffs = segments.map(deriveCoeffs);
  const trajectory = simulate(segments, coeffs, params);
  const summary = summarize(trajectory, params.population);
  const qValues = Array.from({ length: 41 }, (_, i) => +(i * 0.025).toFixed(3)); // 0 → 1.0
  const sweep = sweepQ(segments, coeffs, params, qValues);
  const bifurcationQ = findBifurcation(sweep);
  // reach × q sensitivity surface (the heatmap data). reach 0→0.08, q 0→1.
  const reachAxis = Array.from({ length: 11 }, (_, i) => +(i * 0.008).toFixed(3));
  const qAxis = Array.from({ length: 21 }, (_, i) => +(i * 0.05).toFixed(3));
  const sensitivity2D = sweep2D(segments, coeffs, params, reachAxis, qAxis);
  return {
    runId: run.id,
    target: run.target?.url || "",
    generatedAt: nowIso,
    segments,
    coeffs,
    params,
    trajectory,
    summary,
    sweep,
    sensitivity2D,
    bifurcationQ,
    calib: CALIB,
  };
}
