// Pure-logic tests for the calibration scorer (no LLM judge, no browser).
import { test } from "node:test";
import assert from "node:assert/strict";

import { scoreCalibration, aggregateRounds, type FixtureResult } from "../calibrate.js";
import type { Issue } from "../types.js";

function issue(id: string): Issue {
  return { id, title: "t", severity: "low", agents: 1, category: "c", quote: "q", agentRef: "a", evidence: 1, journey: "j" };
}

function defect(id: string, cls: string, observable: boolean, caught: boolean): FixtureResult {
  return {
    fixture: { file: `${id}.html`, kind: "defect", defect: { id, class: cls, description: "d", expectedSignals: [], firstVisitObservable: observable } },
    runId: "r",
    issues: [issue("i1")],
    verdict: { caught, matchedIssueId: caught ? "i1" : null, confidence: 0.8, reasoning: "" },
  };
}

function clean(n: number): FixtureResult {
  return { fixture: { file: "clean.html", kind: "clean" }, runId: "r", issues: Array.from({ length: n }, (_, i) => issue(`i${i}`)) };
}

test("recall is scored only over first-visit-observable defects", () => {
  const s = scoreCalibration([defect("a", "x", true, true), defect("b", "y", true, false), defect("c", "z", false, false)], null);
  assert.equal(s.observableDefects, 2); // non-observable 'c' excluded from the denominator
  assert.equal(s.observableCaught, 1);
  assert.equal(s.recall, 0.5);
  assert.equal(s.defects.length, 3); // ...but all defects appear in the detail table
});

test("per-class recall buckets correctly", () => {
  const s = scoreCalibration([defect("a", "nav", true, true), defect("b", "nav", true, false), defect("c", "copy", true, true)], null);
  const nav = s.byClass.find((c) => c.class === "nav")!;
  const copy = s.byClass.find((c) => c.class === "copy")!;
  assert.equal(nav.recall, 0.5);
  assert.equal(copy.recall, 1);
});

test("clean-control false-positive stats + ablation passthrough", () => {
  const s = scoreCalibration([clean(2), clean(4), clean(0)], 7);
  assert.equal(s.cleanRuns, 3);
  assert.equal(s.meanIssuesPerCleanRun, 2);
  assert.equal(s.minIssuesPerCleanRun, 0);
  assert.equal(s.maxIssuesPerCleanRun, 4);
  assert.equal(s.ablationIssueCount, 7);
});

test("no observable defects → verdict says it cannot assess recall", () => {
  const s = scoreCalibration([defect("a", "x", false, false)], null);
  assert.equal(s.recall, 0);
  assert.match(s.verdict, /cannot assess|No first-visit/i);
});

test("high recall + noisy floor is flagged as discounted", () => {
  const s = scoreCalibration([defect("a", "x", true, true), defect("b", "y", true, true), clean(5), clean(6)], 4);
  assert.equal(s.recall, 1);
  assert.match(s.verdict, /NOISY|discounted/i);
});

test("aggregateRounds turns per-run verdicts into catch RATE + mean/stdev floor", () => {
  // 3 rounds: defect 'm' caught 2/3; defect 'k' caught 0/3. Clean floors 2,4,6.
  const round = (mCaught: boolean, kCaught: boolean, cleanN: number) =>
    scoreCalibration([defect2("m", "nav", true, mCaught), defect2("k", "feat", true, kCaught), clean(cleanN)], null);
  const multi = aggregateRounds([round(true, false, 2), round(true, false, 4), round(false, false, 6)]);
  assert.equal(multi.rounds, 3);
  const m = multi.perDefect.find((d) => d.id === "m")!;
  const k = multi.perDefect.find((d) => d.id === "k")!;
  assert.equal(m.caught, 2);
  assert.ok(Math.abs(m.rate - 2 / 3) < 1e-9);
  assert.equal(k.caught, 0);
  assert.equal(k.rate, 0);
  assert.ok(Math.abs(multi.cleanFalsePosMean - 4) < 1e-9); // mean of 2,4,6
  assert.ok(multi.cleanFalsePosStdev > 1.6 && multi.cleanFalsePosStdev < 1.7); // ~1.633
  assert.deepEqual(multi.recallPerRound, [0.5, 0.5, 0]); // m caught only in rounds 1,2
});

// defect with a distinct confidence so avgConfidence is exercised
function defect2(id: string, cls: string, observable: boolean, caught: boolean): FixtureResult {
  const d = defect(id, cls, observable, caught);
  d.verdict = { caught, matchedIssueId: caught ? "i1" : null, confidence: caught ? 0.9 : 0.4, reasoning: "" };
  return d;
}
