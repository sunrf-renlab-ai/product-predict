# Product Predict · `pp`

> **User experience simulation.** Not a multi-agent test runner —
> a population of synthetic users who use your product like real users.

Give `pp` a URL. AI generates a population of personas tailored to that product
(or derives them from your beta data), each with their own preferences,
known context, and competitor experience. They open the product in Chromium,
poke around the way *their kind of user* would, and quit when a real user would
quit — satisfied, frustrated, or just bored. You get back **how that population
felt about your product** — design / fit / rhythm observations as much as bugs.

The "issues" raised are mostly experience and design issues — things you can
only see when someone unlike you uses your product. Bugs are a minority.

## Install

```sh
git clone …                         # this repo
cd pp
npm install
npx playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-…    # required for real runs
```

`pp` is a tsx-based CLI; no build step needed in v0.

## Use

```sh
# Generate a persona population for your product, save for reuse:
./bin/pp personas generate "team todo app for small remote teams" --save my-todo

# Or derive personas from real beta data (docs + audio transcripts):
./bin/pp personas from-beta interview-1.md user-feedback.pdf call-recording.m4a \
    --save my-beta

# Mixed (AI preset + beta merged):
./bin/pp personas mixed "team todo app" interview-1.md --save my-mix

# Run a session against your target:
./bin/pp run http://localhost:5173 --personas my-todo
```

After a few minutes you get `runs/run-NNN/`:

| file          | for                                                                |
| ------------- | ------------------------------------------------------------------ |
| `report.html` | a human — open it in a browser                                     |
| `report.md`   | your coding agent — `cat report.md \| pbcopy`, then paste into chat |
| `run.json`    | machine-readable run state (schema: `pp.experience.v1`)            |
| `shots/*.jpg` | per-step screenshots                                               |

Other commands:

```sh
./bin/pp personas list / show / edit / delete
./bin/pp list                     # past runs
./bin/pp serve --port 8907        # browse runs/ as a static dashboard
./bin/pp run --help               # all options
```

### Analysis & projection

Post-hoc commands that run on an existing run (no new browser sessions):

```sh
# Project a run's measured first-visit behaviour into a population diffusion
# forecast + a 1,000,000-agent propagation viewer (funnel, awareness/active
# over time, reach×q sensitivity heatmap, bifurcation). Pure math, no LLM.
./bin/pp diffuse [runId]          # defaults to the latest run
./bin/pp diffuse run-008 --reach 0.01 --q 0.4   # reach + q are YOUR assumptions
./bin/pp diffuse run-009 --variant run-008      # A/B: same assumptions, the delta is the signal

# Ground-truth: run pp on fixtures with KNOWN planted defects and score
# issue-recall + the clean-control false-positive floor + blank-page invention.
./bin/pp calibrate                # one round
./bin/pp calibrate --rounds 5     # de-noise: per-defect catch RATE + mean±stdev
```

`diffuse` writes `diffusion.html`/`diffusion.json` (and every `pp run` report links to it). The forecast is a **scenario band**, not a point prediction — reach and word-of-mouth are user assumptions. `calibrate` writes `scorecard.md`/`scorecard.json`.

### Important flags

```
--personas <name>     # saved persona set (or omit + --hint to generate fresh)
-a, --agents <n>      # slot count; defaults to sim key count
--max-steps <n>       # safety cap per agent (default 30; real users quit on their own)
--max-minutes <n>     # wall-clock safety cap per agent (default 10)
--concurrency <n>     # parallel agents (default 2)
--head                # show the browser (default: headless)
--viewport <wxh>      # 1280x800 by default
--no-open             # don't pop the report when done
```

**There is no step quota.** Each agent decides when to leave — when they got
what they came for (`accomplished`), when they got fed up (`frustrated`), or
when they ran out of curiosity (`explored`). `--max-steps` is just a safety net.

### Cost

With MiniMax Coding Plan (flat-rate subscription): $0 per run.
With real Anthropic API: ~$0.50–$2 per run depending on persona count and how
long they linger.

## Test without an API key

```sh
PP_MOCK_LLM=1 ./bin/pp run http://localhost:5173 --agents 3 --steps 6
```

This swaps the LLM for a deterministic stub that cycles through every tool. It
verifies the full pipeline (Playwright + agent loop + report generation) but
the issues / delights it reports are canned. Use it for plumbing changes, not
real predictions.

## How it works

```
pp personas generate <hint>     # AI generates the population
   └─ N personas with preferences[], knownContext[], weight (sums to 1)
   └─ saved to ~/.pp/personas/<name>.json (editable)

pp run URL --personas <name>
 └─ allocate slots: N personas → sim-key count slots (replicated by weight
                                  if personas < keys)
 └─ for each slot, in a new browser context:
     └─ for each step (until agent calls finish() or hits safety cap):
         ├─ snapshot (jpg + simplified DOM)
         ├─ POST to MiniMax/Anthropic with persona system prompt
         ├─ model picks one tool: click_at | type_text | key_press | scroll
         │                      | navigate | note | finish
         ├─ pp executes that action against the page
         └─ append event { t, kind, text, sentiment, screenshot }
     └─ "wrap" pass: model (still in persona) emits structured
        issues / delights / featuresUsed list
 └─ aggregator: dedupe observations, accumulate feature frequency
 └─ emit run.json + report.html (real-screenshot replay + feature chart) + report.md
```

### Persona model (v0.3+)

```ts
type Persona = {
  preferences: string[];    // what this user cares about
  knownContext: string[];   // what's already in their head (tools, team, competitors)
  weight: number;            // population proportion (sums to ~1.0 across set)
  tone, traits, tech, age, role, glyph, color
}
```

No `goal` field. Personas explore freely, driven by preferences. Multiple
agents can share a persona (replicated by weight) to test the same archetype
across slightly different sessions.

### Key role separation (MiniMax)

For MiniMax users with multiple keys, `pp` separates them:
- **main key** → analysis: persona generation, beta derivation, wrap-up synthesis
- **simulation pool** → per-turn agent tool calls (round-robined)

Persona count is hard-capped at simulation pool size; fewer personas means
weight-based replication.

## What's deliberately not here yet

These are obvious next-step features that are out of scope for v0.1:

- **Git cloning + sandbox provisioning.** Today `pp` runs against a URL you
  point at — local dev server, preview deploy, anything. Spinning up the
  build itself is your job. v1 will accept a repo URL.
- **Cross-run comparison.** `--compare run-NNN` is referenced in the report
  but not wired up. Currently you eyeball two reports.
- **MCP server.** The `pp mcp` command is documented in the prototype but not
  shipped — adding it is straightforward (one stdio MCP server exposing
  `pp.run` as a tool).
- **Real-time WebSocket dashboard.** v0 emits the report when the run
  completes. The prototype's Simulation view *could* stream events live; for
  now it plays back the saved screenshots.
- **PDF export / Linear sync.** The buttons in the report viewer are
  decorative — they came from the prototype.

## Project layout

```
pp/
  bin/pp               # tsx wrapper
  src/
    cli.ts             # `pp run`, `pp list`, `pp serve`
    runner.ts          # orchestrates a run (browser, concurrency, aggregation)
    agent.ts           # single agent — Playwright + Claude tool-use loop
    personas.ts        # 12 archetypes + system-prompt builder
    llm.ts             # Anthropic SDK wrapper + mock mode
    report.ts          # writes report.html / report.md from a Run
    types.ts           # Run / Event / Issue / Delight shapes
    templates/
      report.html      # the viewer (built from /build/)
  build/
    build-template.sh  # rebuild templates/report.html from JSX sources
    data-shim.js       # exposes window.__PP_RUN__ as the prototype's globals
    app-viewer.jsx     # app shell, drops Tweaks panel, defaults to Report
    report-viewer.jsx  # Report + AI views driven by run.json (not mock data)
    sim-viewer.jsx     # Replay view — plays back real screenshots
    regen-report.ts    # rebuild report.html from an existing run.json
  runs/
    run-NNN/
      run.json
      report.html
      report.md
      shots/
  test/
    target-site/       # tiny static todo app used for E2E testing
```

## SPEC

See [`SPEC.md`](./SPEC.md) for the design constraints and what was cut from v1.
