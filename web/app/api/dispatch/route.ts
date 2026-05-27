// POST /api/dispatch — pp CLI calls this to fan out a cloud run.
//
// Request body:
//   { targetUrl, agents, hint?, lang?, maxSteps?, inviteToken }
//
// Behavior:
//   1. Verify HMAC invite token (secret from PP_INVITE_SECRET env).
//   2. Cap agents (default ceiling 24; set PP_AGENT_CAP env to override).
//   3. Generate a ULID runId.
//   4. Compute totalShards = ceil(agents / 4).
//   5. For each shard, POST to GitHub Actions workflow_dispatch.
//   6. Return { runId, totalShards } to client.
//
// Env required:
//   PP_INVITE_SECRET           secret used to sign / verify invite tokens
//   GITHUB_DISPATCH_TOKEN      fine-grained PAT scoped to Actions:write on this repo
//   GITHUB_DISPATCH_REPO       owner/repo, default "sunrf-renlab-ai/product-predict"
//   GITHUB_WORKFLOW_FILE       workflow filename, default "pp-runner.yml"
//   PP_AGENT_CAP               optional, default 24
//
// Runtime: nodejs (we use node:crypto in pp/src/invite via shared lib; here we
// use the edge-compatible web/lib/invite). We pin nodejs to keep symmetry with
// the existing /api/sim route and to use fetch keep-alive.

import { NextRequest, NextResponse } from "next/server";
import { verifyInvite } from "@/lib/invite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "sunrf-renlab-ai/product-predict";
const DEFAULT_WORKFLOW = "pp-runner.yml";
const AGENTS_PER_SHARD = 4;

interface DispatchBody {
  targetUrl?: unknown;
  agents?: unknown;
  hint?: unknown;
  lang?: unknown;
  maxSteps?: unknown;
  inviteToken?: unknown;
}

export async function POST(req: NextRequest) {
  const secret = process.env.PP_INVITE_SECRET;
  const ghToken = process.env.GITHUB_DISPATCH_TOKEN;
  if (!secret || !ghToken) {
    return errResp(500, "server_misconfigured", "PP_INVITE_SECRET or GITHUB_DISPATCH_TOKEN not set");
  }

  let body: DispatchBody;
  try {
    body = (await req.json()) as DispatchBody;
  } catch {
    return errResp(400, "bad_json", "Body must be JSON.");
  }

  const targetUrl = typeof body.targetUrl === "string" ? body.targetUrl.trim() : "";
  const agentsRaw = typeof body.agents === "number" ? body.agents : NaN;
  const hint = typeof body.hint === "string" ? body.hint.slice(0, 500) : "";
  const lang = body.lang === "zh" ? "zh" : "en";
  const maxSteps = typeof body.maxSteps === "number" && body.maxSteps > 0 ? Math.min(60, Math.floor(body.maxSteps)) : 30;
  const inviteToken = typeof body.inviteToken === "string" ? body.inviteToken : "";

  if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
    return errResp(400, "bad_target", "targetUrl must be an http(s) URL.");
  }
  if (!Number.isFinite(agentsRaw) || agentsRaw < 1) {
    return errResp(400, "bad_agents", "agents must be a positive integer.");
  }

  const verify = await verifyInvite({ token: inviteToken, secret });
  if (!verify.ok) {
    return errResp(401, "invalid_invite", verify.reason || "token verification failed");
  }

  const cap = parseInt(process.env.PP_AGENT_CAP || "24", 10);
  const agents = Math.min(Math.floor(agentsRaw), cap);
  const totalShards = Math.ceil(agents / AGENTS_PER_SHARD);
  const runId = generateUlid();

  const repo = process.env.GITHUB_DISPATCH_REPO || DEFAULT_REPO;
  const workflow = process.env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW;

  // Domain block-list — block obvious abuse targets even from invitees.
  if (isBlockedDomain(targetUrl)) {
    return errResp(403, "blocked_target", "Target domain is on the block-list.");
  }

  const dispatchUrl = `https://api.github.com/repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`;

  // Fire all shard dispatches in parallel.
  const dispatchTasks = Array.from({ length: totalShards }, (_, idx) =>
    fetch(dispatchUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ghToken}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "pp-dispatch/1",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          runId,
          shardIdx: String(idx),
          totalShards: String(totalShards),
          targetUrl,
          hint,
          agentsPerShard: String(Math.min(AGENTS_PER_SHARD, agents - idx * AGENTS_PER_SHARD)),
          maxSteps: String(maxSteps),
          lang,
        },
      }),
    }).then(async (r) => ({ idx, status: r.status, body: r.ok ? null : await r.text() }))
  );

  const results = await Promise.all(dispatchTasks);
  const failed = results.filter((r) => r.status < 200 || r.status >= 300);
  if (failed.length > 0) {
    return errResp(502, "dispatch_failed", `${failed.length}/${totalShards} shard dispatches failed: ${failed[0].body?.slice(0, 200)}`);
  }

  return NextResponse.json({
    runId,
    totalShards,
    agents,
    userTag: verify.userTag,
    capped: agents !== Math.floor(agentsRaw),
  });
}

function isBlockedDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const BLOCKED = [
      "google.com", "www.google.com", "youtube.com", "facebook.com",
      "twitter.com", "x.com", "instagram.com", "tiktok.com",
      "chase.com", "wellsfargo.com", "bankofamerica.com",
      "irs.gov", "whitehouse.gov", "login.gov",
    ];
    return BLOCKED.some((b) => host === b || host.endsWith("." + b));
  } catch {
    return true;
  }
}

function generateUlid(): string {
  // Crockford-base32 ULID-ish; not strictly Crockford but monotonic+random.
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${t}-${r}`;
}

function errResp(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}
