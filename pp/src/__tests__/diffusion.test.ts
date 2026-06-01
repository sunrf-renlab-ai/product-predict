// Pure-logic tests for the diffusion macro layer (no LLM, no browser).
import { test } from "node:test";
import assert from "node:assert/strict";

import { extractSegments, deriveCoeffs, simulate, summarize, sweepQ, DEFAULT_PARAMS, CALIB } from "../diffusion.js";
import type { Run } from "../types.js";

function mkRun(): Run {
  return {
    id: "run-001",
    agents: [
      { id: "a01", name: "A", age: 30, role: "pm", weight: 0.6, tech: 3, tone: "t", preferences: [], knownContext: [], color: "#111", glyph: "A", traits: [], exitReason: "accomplished" },
      { id: "a01-1", name: "A", age: 30, role: "pm", weight: 0.6, tech: 3, tone: "t", preferences: [], knownContext: [], color: "#111", glyph: "A", traits: [], exitReason: "accomplished" },
      { id: "a02", name: "B", age: 40, role: "eng", weight: 0.4, tech: 5, tone: "t", preferences: [], knownContext: [], color: "#222", glyph: "B", traits: [], exitReason: "frustrated" },
    ],
    activity: [
      { t: "00:00:00", agent: "a01", kind: "note", text: "", sentiment: 2 },
      { t: "00:00:01", agent: "a01-1", kind: "delight", text: "", sentiment: 1 },
      { t: "00:00:02", agent: "a02", kind: "rage", text: "", sentiment: -2 },
    ],
    target: { url: "http://x", title: "x", viewport: { w: 1, h: 1 } },
  } as unknown as Run;
}

test("extractSegments is deterministic, merges replicated slots, normalizes weights", () => {
  const a = extractSegments(mkRun());
  const b = extractSegments(mkRun());
  assert.deepEqual(a, b);
  assert.equal(a.length, 2); // a01 + a01-1 collapse into one archetype
  const sum = a.reduce((s, x) => s + x.weight, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, "weights normalize to 1");
});

test("deriveCoeffs stays within CALIB bounds for all segments", () => {
  for (const s of extractSegments(mkRun())) {
    const c = deriveCoeffs(s);
    assert.ok(c.activation >= CALIB.act.min && c.activation <= CALIB.act.max);
    assert.ok(c.churn >= CALIB.churn.min && c.churn <= CALIB.churn.max);
    assert.ok(c.deepen >= CALIB.deepen.min && c.deepen <= CALIB.deepen.max);
    assert.ok(c.shareProp >= CALIB.share.min && c.shareProp <= CALIB.share.max);
  }
});

test("simulate conserves population and ever-reached never decreases", () => {
  const segs = extractSegments(mkRun());
  const coeffs = segs.map(deriveCoeffs);
  const params = { ...DEFAULT_PARAMS, steps: 30 };
  const traj = simulate(segs, coeffs, params);
  const N = params.population;
  let prevReached = -1;
  for (const t of traj.series) {
    const total = t.unaware + t.aware + t.active + t.heavy + t.churned;
    assert.ok(Math.abs(total - N) < 1e-2, "population conserved");
    const reached = N - t.unaware;
    assert.ok(reached >= prevReached - 1e-6, "ever-reached monotonic non-decreasing");
    prevReached = reached;
  }
});

test("summarize percentages are consistent with the final state", () => {
  const segs = extractSegments(mkRun());
  const traj = simulate(segs, segs.map(deriveCoeffs), { ...DEFAULT_PARAMS, steps: 30 });
  const sum = summarize(traj, DEFAULT_PARAMS.population);
  assert.ok(Math.abs(sum.neverReachedPct + sum.everReachedPct - 100) < 1e-6);
  assert.ok(sum.everReachedPct >= 0 && sum.everReachedPct <= 100);
});

test("more word-of-mouth never reduces ever-reached (monotone in q)", () => {
  const segs = extractSegments(mkRun());
  const coeffs = segs.map(deriveCoeffs);
  const sw = sweepQ(segs, coeffs, { ...DEFAULT_PARAMS, steps: 30 }, [0, 0.5, 1]);
  assert.ok(sw[0].everReachedPct <= sw[1].everReachedPct + 1e-6);
  assert.ok(sw[1].everReachedPct <= sw[2].everReachedPct + 1e-6);
});
