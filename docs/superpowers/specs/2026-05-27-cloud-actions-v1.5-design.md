# Product Predict v1.5 — Cloud scale-out via GitHub Actions

**Status:** design locked
**Date:** 2026-05-27
**Author:** sunrf-renlab-ai

## Goal

Let pp users run user-experience simulations with **20–50 concurrent agents** without needing a 32 GB machine, **without** standing up SaaS infrastructure (no Render, no Browserbase, no DB, no card).

## Non-goals

- A web UI for end users to submit runs (CLI stays the primary surface).
- Payment, billing, or per-seat licensing.
- Cross-tenant isolation strong enough for adversarial users (closed beta only — anyone with an invite token is trusted).
- Persistent multi-month run history (Actions artifacts retain ~90 days; that's enough).
- Multi-region. Everything pins to GitHub's default Actions runners (US/EU).

## High-level architecture

```
User CLI
   │
   │  POST /api/dispatch  { targetUrl, agents, hint, inviteToken }
   ▼
Vercel function (product-predict.renlab.ai/api/dispatch)
   │
   │  validate HMAC invite token (no DB)
   │  cap agents at 24 (configurable env)
   │
   │  POST /repos/sunrf-renlab-ai/product-predict/actions/workflows/pp-runner.yml/dispatches
   ▼
GitHub Actions (sunrf-renlab-ai/product-predict, public repo, unlimited minutes)
   │
   │  workflow_dispatch fires; matrix over shards = ceil(agents / 4)
   │  each shard: ubuntu-latest, install pp + Playwright, run 4 agents
   │  shard uploads { run.json, shots/ } as artifact `pp-shard-{runId}-{idx}`
   ▼
CLI polls GET /api/runs/{runId}
   │
   │  on completion → GET /api/runs/{runId}/artifacts/{name}
   ▼
CLI downloads N artifacts, merges into one unified run.json, renders report
```

## Why this stack

| Concern | Resolution |
|---|---|
| Cost | $0/mo. Public-repo Actions is unlimited; Vercel function fits in free tier; no other infra. |
| Scale | Concurrent shards limited by GitHub's 20-job-per-workflow cap, easily yielding 80 agents per run. For 50+ agents, fan out as 12 shards × 4 agents. |
| Security | Repository PAT lives only in Vercel env. End users see only an HMAC invite token. |
| LLM rate limits | pp's 8-key MiniMax pool starts to strain above ~30 concurrent agents. v1.5 caps user-facing default at 24 and adds 429 exponential backoff. |
| Cold start | First shard takes ~30 s to install Playwright + pp. Subsequent shards on same workflow run reuse cache after first iteration. End-to-end for a 30-agent run: ~5–7 min. |

## Components

### A. CLI — `pp/`

- New flag: `pp run --scale-cloud N` (alias `-c`)
- New file: `pp/src/cloud.ts`
  - `dispatchRun({url, agents, hint, inviteToken})` → POST /api/dispatch, returns `runId`
  - `pollRun(runId)` → GET /api/runs/:id every 5 s until status ∈ {success, failure}
  - `downloadArtifacts(runId)` → fetches all shard artifacts in parallel
  - `mergeShards(shardRuns[])` → returns a single `Run` with concatenated `agents[]`, deduped `issues[]`, summed `featureUsage[]`
- New `pp config set invite-token <token>` stores in macOS Keychain entry `pp-invite-token`.
- 429 exponential backoff in `pp/src/llm.ts` for both `mainClient` and `simClient` (2s, 4s, 8s — 3 retries).
- Default agent cap raised to 24 (was effectively unlimited). Above 24 prints a warning recommending shard-cloud.

### B. Workflow — `.github/workflows/pp-runner.yml`

- Trigger: `workflow_dispatch` with inputs `targetUrl`, `agents`, `hint`, `runId`, `shardIdx`, `totalShards`.
- Runner: `ubuntu-latest`.
- Steps:
  1. checkout
  2. setup-node 20
  3. `cd pp && npm ci` (or pnpm)
  4. `npx playwright install chromium`
  5. `node pp/dist/cli.js run "$URL" --agents 4 --hint "$HINT" --runId "$RUN_ID" --shardIdx "$IDX" --output ./shard-output`
  6. `actions/upload-artifact@v4` with name `pp-shard-{runId}-{idx}`, path `./shard-output/**`.
- Concurrency: `${{ inputs.runId }}` so multiple shards of same run can share-run.
- Public repo → unlimited minutes; private would consume 2000/mo free tier.

### C. Vercel function — `web/app/api/dispatch/route.ts`

- POST handler.
- Body: `{ targetUrl, agents, hint, inviteToken }`.
- Validates HMAC of `inviteToken` against `INVITE_HMAC_SECRET` env.
- Generates `runId` = ULID.
- Computes `totalShards = Math.ceil(agents / 4)`.
- For each shard, calls `POST https://api.github.com/repos/sunrf-renlab-ai/product-predict/actions/workflows/pp-runner.yml/dispatches` with `Authorization: Bearer $GITHUB_DISPATCH_TOKEN`.
- Returns `{ runId, totalShards }`.
- Runtime: `edge` (low cold-start).

### D. Vercel function — `web/app/api/runs/[id]/route.ts`

- GET handler.
- Query GitHub Actions API: `GET /repos/sunrf-renlab-ai/product-predict/actions/runs?event=workflow_dispatch&head_sha=...` filtered by env name `runId`.
- Aggregates shard statuses into one of: `pending`, `running`, `succeeded`, `failed`.
- Sub-route `GET /api/runs/[id]/artifacts/[name]` proxies the artifact download (GitHub artifacts download requires auth, the proxy adds it).

### E. HMAC invite token — `pp/src/invite.ts` + `web/lib/invite.ts`

- Format: `pp_<userTag>_<issuedAtMs>_<sigHex>` where `sig = HMAC-SHA256(secret, userTag + issuedAtMs)` truncated to 16 bytes hex.
- Optional expiry: `userTag` may include `:expMs` suffix.
- Generator: `node pp/scripts/gen-invite.mjs <userTag> [expDays]`.
- Verifier in both CLI (for early failure) and Vercel function (for security).

## Internal data flow (one --scale-cloud 12 run)

1. CLI builds POST body, calls `/api/dispatch`.
2. Vercel returns `{ runId: "01J...", totalShards: 3 }`.
3. CLI starts polling `/api/runs/01J...` every 5 s.
4. Vercel meanwhile has fired 3 `workflow_dispatch` calls with `shardIdx = 0..2`.
5. GitHub queues 3 runs, picks them up, each builds and runs 4 agents.
6. Each shard uploads `pp-shard-01J...-0`, `pp-shard-01J...-1`, `pp-shard-01J...-2`.
7. When all 3 are `success`, CLI downloads artifacts in parallel.
8. CLI merges: `agents = [...s0.agents, ...s1.agents, ...s2.agents]` (12 agents total); `issues` deduped by `(category, title)`; `featureUsage` summed.
9. CLI runs the existing report rendering on the merged run.
10. CLI opens HTML report in browser.

## Migration path to real cloud (v3)

When we eventually need always-on hosted compute (e.g., scheduled runs, per-user dashboard, < 30 s cold start), the abstraction we're introducing here is reusable:

- `dispatchRun` already abstracts the executor; swap GitHub Actions provider for Browserbase / self-hosted by changing only `/api/dispatch`.
- Artifact storage moves from Actions artifacts to S3/R2; the `/api/runs/:id/artifacts/:name` route becomes the indirection point.
- Invite token can either stay HMAC or become OAuth-backed; the CLI side already does `Authorization` header style.

The CLI does not need to change.

## Out of scope for v1.5

- Live progress streaming (CLI polls; if we want SSE, that's v1.6).
- Real-time agent screenshots during execution (current pp also doesn't do this).
- Run sharing via public URL (CLI report stays local until user uploads it manually).
- Web dashboard for non-CLI users.
- Multi-key LLM rate distribution beyond what already exists in `pp/src/llm.ts`.
