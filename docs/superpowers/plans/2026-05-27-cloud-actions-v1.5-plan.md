# Plan: pp cloud v1.5 (GitHub Actions scale-out)

**Spec**: [`../specs/2026-05-27-cloud-actions-v1.5-design.md`](../specs/2026-05-27-cloud-actions-v1.5-design.md)
**Date**: 2026-05-27
**Status**: Phase A landed in this PR. Phase B is gated on user-supplied PAT + GitHub secrets.

## Phase A — code drop (this PR)

Land everything that can be written and type-checked locally without touching live GitHub APIs.

- [x] **Spec doc** at `docs/superpowers/specs/2026-05-27-cloud-actions-v1.5-design.md`.
- [x] **429 + exponential backoff** in `pp/src/llm.ts` for both `callAgent` (sim-pool) and `callJson` (main key). 2 s → 4 s → 8 s with `isRateLimitError()` recognizer covering 429 / 529 / 503 / timeouts.
- [x] **English persona-system prompt** in `pp/src/personas.ts`. Defaults to English; `personaSystemPrompt(p, url, "zh")` keeps the original Chinese variant. Threaded via new `Lang` type in `pp/src/types.ts` and `PersonaSet.lang`. CLI `--language` default flipped from `"zh"` to `"en"`.
- [x] **English wrap-up prompt** in `pp/src/agent.ts` (`wrapPromptEn` + `wrapPromptZh` dispatch). Persona-gen / persona-derive default to `"en"` and now stamp `PersonaSet.lang` on output.
- [x] **HMAC invite tokens**: `pp/src/invite.ts` (Node), `web/lib/invite.ts` (Edge), `pp/scripts/gen-invite.mjs` (generator). Tokens like `pp_alice.expMs_issuedMs_sig32hex`. Cross-verified Node ↔ Edge produce identical results.
- [x] **GitHub Actions workflow** `.github/workflows/pp-runner.yml`. `workflow_dispatch` only; inputs `runId / shardIdx / totalShards / targetUrl / hint / agentsPerShard / maxSteps / lang`. Public repo → unlimited minutes. Caches Playwright. Uploads `pp-shard-{runId}-{idx}` artifact.
- [x] **Vercel function** `web/app/api/dispatch/route.ts` — verifies HMAC token, caps `agents` at `PP_AGENT_CAP` (default 24), domain block-list, fires N parallel `workflow_dispatch` calls.
- [x] **Vercel function** `web/app/api/runs/[id]/route.ts` — polls GitHub artifacts API to aggregate shard status. Sub-route `web/app/api/runs/[id]/artifacts/[name]/route.ts` proxies the zip download so the PAT never reaches the CLI.
- [x] **`pp/src/cloud.ts`** — `dispatchCloudRun` / `pollUntilDone` / `downloadArtifacts` / `mergeShardRuns` / `resolveInviteToken` (Keychain `pp-invite-token` → env → throw). Top-level `executeCloudRun` orchestrates.
- [x] **CLI flag** `pp run --scale-cloud N`. When > 0, bypasses local browser entirely and dispatches via cloud. `PP_RUN_OUTPUT_DIR` env override (used by the Actions workflow). Warning when local agent count > 24.

## Phase B — secrets + first end-to-end run (gated on user PAT)

User has already created the GitHub PAT (`pp-cloud-dispatch`) and the secret is on its way to Vercel. Remaining steps:

1. **Vercel env vars** (Production scope; I'll set these via `vercel env add`):
   - `GITHUB_DISPATCH_TOKEN` ← PAT from Keychain `pp-github-dispatch`
   - `PP_INVITE_SECRET` ← I'll generate a 32-byte random and stash in Keychain `pp-invite-secret`
   - `GITHUB_DISPATCH_REPO` ← `sunrf-renlab-ai/product-predict` (default)
   - `GITHUB_WORKFLOW_FILE` ← `pp-runner.yml` (default)
   - `PP_AGENT_CAP` ← `24` (default)

2. **GitHub repo secrets** (so workflow shards have MiniMax keys):
   - `PP_MINIMAX_MAIN_KEY` ← from Keychain `minimax-coding-plan`.main
   - `PP_MINIMAX_SIM_KEYS` ← comma-separated from Keychain `minimax-coding-plan`.simulation

3. **Generate 5 invite tokens for closed beta** using `pp/scripts/gen-invite.mjs`.

4. **Smoke test**: locally run `pp run https://product-predict.renlab.ai --scale-cloud 8 --no-open` against our own site. Verify shards dispatch, artifacts return, merger produces a sane unified report.

5. **Commit + push** secrets-config (none — secrets are out-of-repo) and any post-smoke fixes.

## Phase C — UX polish (post-MVP, not in this plan)

- `pp config set invite-token <token>` ergonomics (writes to Keychain).
- Real-time per-shard log streaming (SSE) instead of poll.
- Bench-004 with `--scale-cloud 30` to validate cloud parity with local.
- README updates documenting the cloud path for beta testers.

## Open issues / known limitations

- Status endpoint inference is artifact-based, so until at least one shard finishes we under-count `totalShards`. Acceptable; CLI's `dispatchCloudRun` already knows the true `totalShards` and uses it for its own progress display.
- `display_title` matching in `runs/[id]/route.ts` is loose. If multiple unrelated runs are in flight simultaneously we may briefly conflate them in the "running" count. Doesn't affect succeeded/failed verdicts.
- The GitHub Actions concurrency cap is 20 jobs per workflow file by default; if we ever go beyond 80 agents in one run (= 20 shards × 4 agents) we'll need to bump that or shard differently.
- `mergeShardRuns` keeps `routesHeat` from shard 0 only. Good enough; can revisit if heat maps become important.

## Diff size summary (this PR)

- ~8 new files (`spec.md`, `plan.md`, `pp/src/cloud.ts`, `pp/src/invite.ts`, `pp/scripts/gen-invite.mjs`, `web/lib/invite.ts`, `.github/workflows/pp-runner.yml`, 3 new route handlers)
- ~7 edited files (`pp/src/llm.ts`, `pp/src/agent.ts`, `pp/src/personas.ts`, `pp/src/persona-gen.ts`, `pp/src/persona-derive.ts`, `pp/src/runner.ts`, `pp/src/cli.ts`, `pp/src/types.ts`)
- TypeScript clean. Web `next build` clean.
