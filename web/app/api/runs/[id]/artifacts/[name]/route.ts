// GET /api/runs/:id/artifacts/:name — proxy artifact zip download.
//
// GitHub artifacts download requires authentication. The CLI hits this proxy
// route instead of GitHub directly, so the PAT stays on Vercel.
//
// We look up the artifact by name (which embeds runId), then redirect-fetch
// the zip via GitHub's signed URL.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "sunrf-renlab-ai/product-predict";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; name: string }> }) {
  const { id: runId, name: rawName } = await ctx.params;
  const ghToken = process.env.GITHUB_DISPATCH_TOKEN;
  if (!ghToken) return new NextResponse("no_token", { status: 500 });

  const repo = process.env.GITHUB_DISPATCH_REPO || DEFAULT_REPO;
  const name = decodeURIComponent(rawName);

  // Validate format
  if (!/^[a-z0-9-]+$/i.test(runId)) return new NextResponse("bad_runId", { status: 400 });
  if (!name.startsWith(`pp-shard-${runId}-`)) {
    return new NextResponse("artifact name does not match run id", { status: 400 });
  }

  // Find the artifact by name.
  const listRes = await fetch(
    `https://api.github.com/repos/${repo}/actions/artifacts?per_page=100&name=${encodeURIComponent(name)}`,
    {
      headers: {
        "Authorization": `Bearer ${ghToken}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "pp-dispatch/1",
      },
      cache: "no-store",
    }
  );
  if (!listRes.ok) return new NextResponse(await listRes.text(), { status: 502 });
  const { artifacts } = (await listRes.json()) as {
    artifacts: { id: number; name: string; expired: boolean }[];
  };
  const a = artifacts.find((x) => x.name === name && !x.expired);
  if (!a) return new NextResponse("artifact_not_found", { status: 404 });

  // Stream the zip back.
  const dlRes = await fetch(
    `https://api.github.com/repos/${repo}/actions/artifacts/${a.id}/zip`,
    {
      headers: {
        "Authorization": `Bearer ${ghToken}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "pp-dispatch/1",
      },
      redirect: "follow",
    }
  );
  if (!dlRes.ok || !dlRes.body) {
    return new NextResponse(await dlRes.text(), { status: dlRes.status });
  }

  return new NextResponse(dlRes.body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}.zip"`,
    },
  });
}
