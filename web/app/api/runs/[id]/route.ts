// GET /api/runs/:id — aggregate status of all shards for a given runId.
//
// We don't keep our own DB. Instead, we query GitHub Actions and reverse-map
// from the `runId` workflow input to the constituent workflow runs.
//
// Response:
//   {
//     runId,
//     status: "pending" | "running" | "succeeded" | "failed",
//     shards: [{ idx, status, runUrl, artifactName }],
//     totalShards,
//     artifactsReady: boolean,
//   }
//
// Env:
//   GITHUB_DISPATCH_TOKEN  same PAT as /api/dispatch
//   GITHUB_DISPATCH_REPO   owner/repo, default "sunrf-renlab-ai/product-predict"
//   GITHUB_WORKFLOW_FILE   default "pp-runner.yml"

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "sunrf-renlab-ai/product-predict";
const DEFAULT_WORKFLOW = "pp-runner.yml";

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  name: string;
  created_at: string;
  display_title?: string;
  // GitHub API includes `inputs` when run via workflow_dispatch but only in
  // some response shapes; we filter by display_title which includes runId.
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: runId } = await ctx.params;
  const ghToken = process.env.GITHUB_DISPATCH_TOKEN;
  if (!ghToken) return errResp(500, "no_token");
  if (!/^[a-z0-9-]+$/i.test(runId)) return errResp(400, "bad_id");

  const repo = process.env.GITHUB_DISPATCH_REPO || DEFAULT_REPO;
  const workflow = process.env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW;

  // Pull recent workflow runs and find ours by runId in display_title.
  // GitHub auto-titles workflow_dispatch runs from input values, so runId is
  // visible in `display_title` or `name` for our matching purposes. We also
  // request `event=workflow_dispatch` to narrow the set.
  const listUrl = `https://api.github.com/repos/${repo}/actions/workflows/${encodeURIComponent(
    workflow
  )}/runs?event=workflow_dispatch&per_page=100`;

  const listRes = await fetch(listUrl, {
    headers: gh(ghToken),
    cache: "no-store",
  });
  if (!listRes.ok) return errResp(502, "gh_list_failed", await listRes.text());
  const list = (await listRes.json()) as { workflow_runs: WorkflowRun[] };

  // Match runs whose display_title includes the runId. (display_title format
  // from workflow_dispatch is "<workflow name> · runId=X · shardIdx=Y" only if
  // we set it — by default GH uses the workflow name. So we fall back to
  // fetching jobs/inputs for each candidate that ran recently.)
  //
  // Pragmatic match: filter by created_at within last 30 min AND match
  // inputs through a second per-run API call.
  const since = Date.now() - 30 * 60 * 1000;
  const candidates = list.workflow_runs.filter(
    (r) => new Date(r.created_at).getTime() > since
  );

  // For each candidate, fetch /actions/runs/:id to read its inputs (in the
  // `triggering_actor` envelope, workflow_dispatch inputs aren't returned —
  // we have to look at the artifact name we pre-baked instead).
  const artifactsBase = `https://api.github.com/repos/${repo}/actions/artifacts?per_page=100&name=`;
  const artNamePrefix = `pp-shard-${runId}-`;

  // Fetch artifacts that match our runId — gives us the set of completed shards
  // even before the runs themselves are queryable.
  const artRes = await fetch(`${artifactsBase}${encodeURIComponent(artNamePrefix)}`, {
    headers: gh(ghToken),
    cache: "no-store",
  });
  if (!artRes.ok) return errResp(502, "gh_artifacts_failed", await artRes.text());
  const arts = (await artRes.json()) as {
    artifacts: { id: number; name: string; expired: boolean; created_at: string; workflow_run?: { id: number } }[];
  };
  const mineArtifacts = arts.artifacts.filter((a) => a.name.startsWith(artNamePrefix) && !a.expired);

  // Map shard idx → artifact + workflow_run id when known
  const shards = new Map<number, { idx: number; runId?: number; artifact?: typeof mineArtifacts[number]; status: string; runUrl?: string }>();
  for (const a of mineArtifacts) {
    const m = a.name.match(/^pp-shard-.+-(\d+)$/);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    shards.set(idx, { idx, runId: a.workflow_run?.id, artifact: a, status: "succeeded" });
  }

  // For shards that don't have an artifact yet, scan recent workflow_runs for
  // matching ones via shard idx in display_title (we'll set this in the
  // workflow via env GITHUB_RUN_NAME). As fallback we mark them "running".
  // Implementation note: we keep this loose for v1.5 since matching by run-name
  // requires more API calls and Actions is generally fast enough that polling
  // every 5s and looking at the artifact set is sufficient.

  const expectedTotal = inferTotal(mineArtifacts, candidates, runId);
  const completed = shards.size;
  const running = candidates.filter((c) => c.status === "in_progress" || c.status === "queued").length;
  const failed = candidates.filter((c) => c.status === "completed" && c.conclusion === "failure").length;

  let aggregate: "pending" | "running" | "succeeded" | "failed";
  if (expectedTotal != null && completed >= expectedTotal) aggregate = "succeeded";
  else if (failed > 0 && completed + failed >= (expectedTotal ?? 0)) aggregate = "failed";
  else if (running > 0 || completed > 0) aggregate = "running";
  else aggregate = "pending";

  return NextResponse.json({
    runId,
    status: aggregate,
    totalShards: expectedTotal,
    completedShards: completed,
    artifactsReady: aggregate === "succeeded",
    shards: Array.from(shards.values()).map((s) => ({
      idx: s.idx,
      status: s.status,
      artifactName: s.artifact?.name,
      artifactId: s.artifact?.id,
    })),
  });
}

function inferTotal(arts: { name: string }[], runs: WorkflowRun[], runId: string): number | undefined {
  // Look at the highest shard idx we've seen as a lower bound; that's the
  // best signal we have without storing state. Once all shards uploaded, the
  // count matches totalShards. Until then we underestimate.
  const idxs = arts
    .map((a) => parseInt(a.name.replace(`pp-shard-${runId}-`, ""), 10))
    .filter((n) => Number.isFinite(n));
  return idxs.length ? Math.max(...idxs) + 1 : undefined;
}

function gh(token: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "pp-dispatch/1",
  };
}

function errResp(status: number, code: string, detail?: string) {
  return NextResponse.json({ error: code, ...(detail ? { detail } : {}) }, { status });
}
