// Pure-logic tests for NPS session classification (no LLM, no browser).
import { test } from "node:test";
import assert from "node:assert/strict";

import { classifySession } from "../runner.js";
import type { AgentResult } from "../agent.js";
import type { Event, ExitReason } from "../types.js";

function ev(sentiment: number): Event {
  return { t: "00:00:00", agent: "a", kind: "note", text: "", sentiment };
}

function session(opts: { exitReason: ExitReason; accomplished: boolean; sentiments: number[] }): AgentResult {
  return {
    events: opts.sentiments.map(ev),
    exitReason: opts.exitReason,
    accomplished: opts.accomplished,
    finished: true,
    truncated: false,
    issues: [],
    delights: [],
    features: [],
    durationSec: 1,
    summary: "",
  } as unknown as AgentResult;
}

test("frustrated exit is always a detractor", () => {
  assert.equal(classifySession(session({ exitReason: "frustrated", accomplished: true, sentiments: [2, 2] })), "detractor");
});

test("crashed exit is a detractor", () => {
  assert.equal(classifySession(session({ exitReason: "crashed", accomplished: false, sentiments: [] })), "detractor");
});

test("negative felt sentiment is a detractor even on a soft exit", () => {
  assert.equal(classifySession(session({ exitReason: "explored", accomplished: false, sentiments: [-1, -2, 0] })), "detractor");
});

test("accomplished + happy is a promoter", () => {
  assert.equal(classifySession(session({ exitReason: "accomplished", accomplished: true, sentiments: [2, 1, 1] })), "promoter");
});

test("accomplished but mixed (felt mean < 1) is a passive, not a promoter", () => {
  // felt = [2, -1] -> mean 0.5: got it done but it wasn't all smooth
  assert.equal(classifySession(session({ exitReason: "accomplished", accomplished: true, sentiments: [2, -1, 0] })), "passive");
});

test("neutral-only events are passive, not detractor (mean 0 > -0.5)", () => {
  assert.equal(classifySession(session({ exitReason: "explored", accomplished: false, sentiments: [0, 0, 0] })), "passive");
});

test("neutral events are ignored when averaging felt sentiment", () => {
  // one +2 plus many neutral clicks -> felt mean is +2 (neutrals excluded) -> promoter
  assert.equal(classifySession(session({ exitReason: "accomplished", accomplished: true, sentiments: [2, 0, 0, 0, 0] })), "promoter");
});
