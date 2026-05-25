# pp-bench — Product Predict Benchmark

> Like SWE-bench for coding agents — but for **user experience prediction**.
> Measures how well `pp` identifies UX / design / fit issues in web products.

## What's in here

- **`fixtures/`** — 20 hand-crafted small web apps, each deliberately designed
  with a known set of UX / design / fit issues
  ([`ground-truth.json`](fixtures/01-broken-todo/ground-truth.json) per fixture).
- **`scripts/`** — runner, scorer, and reporter
- **`runs/bench-NNN/`** — outputs of each benchmark run (per-fixture run.json,
  matched results, scorecard.html)

## Metrics

For each benchmark run we compute:

| Metric | Definition |
|---|---|
| **Recall** | of all ground-truth issues, what fraction did pp find? |
| **Precision** | of all pp findings, what fraction were real (matched to GT)? |
| **F1** | harmonic mean — single quality number per fixture |
| **Severity accuracy** | when pp matched a GT issue, did it get the severity right? |
| **Category accuracy** | did pp's category tag agree with GT's? |

Computed per-fixture AND aggregated across all 20.

## Matching is LLM-judge

A finding and a ground-truth issue rarely word things identically. The scorer
asks the main key (via the cloud proxy) for each (GT, finding) pair whether
they describe the same underlying issue, with reasoning. Threshold for match
is configurable (default: judge confidence ≥ 0.7).

## How to run

```sh
cd benchmark
bun scripts/bench-run.ts          # runs pp against all 20 fixtures
bun scripts/bench-score.ts        # LLM-judge matches + computes metrics
bun scripts/bench-report.ts       # writes scorecard.html
open runs/bench-NNN/scorecard.html
```

Wall-clock for a full 20-fixture run: ~40-60 min (pp run dominates).
Scoring + reporting: ~5 min combined.

## Comparing runs

Each `bench-NNN/summary.json` records:
- pp version, provider (proxy / minimax / anthropic), model
- persona-set spec (auto-generated per fixture by default)
- per-fixture P/R/F1 + aggregate

Diff two summaries to see whether a pp change moved the numbers — same
fixtures means the deltas are real, not noise from a different product.
