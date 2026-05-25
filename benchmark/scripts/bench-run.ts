// bench-run.ts — orchestrates a pp run against every fixture.
//
//  1. Spin up a single static HTTP server rooted at benchmark/fixtures/.
//     Each fixture is served at http://localhost:8200/<slug>/site/.
//  2. For each fixture, invoke pp's executeRun() in-process — same code path
//     that the CLI uses, no subprocess overhead.
//  3. Save per-fixture run.json + write a top-level bench-NNN/index.json with
//     pointers + metadata.
//
// Concurrency: 2 fixtures at a time. Each pp run spawns N parallel agents
// internally; running 3+ fixtures in parallel would saturate the sim proxy.
//
// Usage:
//   cd benchmark
//   npx tsx scripts/bench-run.ts             # default: 3 personas per fixture
//   npx tsx scripts/bench-run.ts --agents 4  # override agent slot count
//   npx tsx scripts/bench-run.ts --only 01   # filter to fixture by id prefix

import { readdir, readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { existsSync, statSync, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

import { executeRun } from "../../pp/src/runner.js";
import { writeReports } from "../../pp/src/report.js";
import { generatePresetPersonas } from "../../pp/src/persona-gen.js";
import type { PersonaSet } from "../../pp/src/types.js";

import type { Fixture, FixtureRunResult } from "./types.js";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const BENCH_ROOT = resolve(HERE, "..");
const FIXTURES_DIR = resolve(BENCH_ROOT, "fixtures");
const RUNS_DIR = resolve(BENCH_ROOT, "runs");
const STATIC_PORT = 8200;
const MAX_CONCURRENT = 2;

// ── arg parse ───────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function flag(name: string, def?: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
}
const AGENTS = parseInt(flag("agents", "3") || "3", 10);
const MAX_STEPS = parseInt(flag("max-steps", "15") || "15", 10);
const MAX_MINUTES = parseInt(flag("max-minutes", "4") || "4", 10);
const ONLY = flag("only");

// ── helpers ─────────────────────────────────────────────────────────────────

function mime(p: string): string {
  return ({
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
  } as Record<string, string>)[extname(p).toLowerCase()] || "application/octet-stream";
}

async function loadFixtures(): Promise<Fixture[]> {
  const names = (await readdir(FIXTURES_DIR))
    .filter((n) => /^\d{2}-/.test(n))
    .sort();
  const out: Fixture[] = [];
  for (const n of names) {
    if (ONLY && !n.startsWith(ONLY)) continue;
    const gtPath = join(FIXTURES_DIR, n, "ground-truth.json");
    if (!existsSync(gtPath)) {
      console.warn(`  [skip] ${n} — ground-truth.json missing`);
      continue;
    }
    const fx = JSON.parse(await readFile(gtPath, "utf8")) as Fixture;
    out.push(fx);
  }
  return out;
}

async function nextBenchId(): Promise<string> {
  await mkdir(RUNS_DIR, { recursive: true });
  const names = (await readdir(RUNS_DIR)).filter((n) => /^bench-\d+$/.test(n));
  let max = 0;
  for (const n of names) {
    max = Math.max(max, parseInt(n.split("-")[1], 10));
  }
  return `bench-${String(max + 1).padStart(3, "0")}`;
}

function startStaticServer(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolveFn) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${STATIC_PORT}`);
      const safe = url.pathname.replace(/^\/+/, "").replace(/\.\./g, "");
      let file = join(FIXTURES_DIR, safe);
      // dir → index.html
      if (existsSync(file) && statSync(file).isDirectory()) {
        file = join(file, "index.html");
      }
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": mime(file) });
      createReadStream(file).pipe(res);
    });
    server.listen(STATIC_PORT, () => {
      resolveFn({
        url: `http://localhost:${STATIC_PORT}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

async function runOne(fixture: Fixture, benchDir: string): Promise<FixtureRunResult> {
  const outDir = join(benchDir, "per-fixture", fixture.id, "runs");
  await mkdir(outDir, { recursive: true });

  const targetUrl = `http://localhost:${STATIC_PORT}/${fixture.id}/site/`;
  const tStart = Date.now();

  // Generate a fresh persona set scoped to this fixture's hint.
  let set: PersonaSet;
  try {
    set = await generatePresetPersonas({ targetHint: fixture.hint, n: AGENTS });
  } catch (e) {
    return {
      fixtureId: fixture.id,
      runId: "",
      runDir: "",
      durationSec: 0,
      agentCount: 0,
      ppIssues: [],
      error: `persona-gen failed: ${(e as Error).message}`,
    };
  }

  try {
    const { run, runDir } = await executeRun({
      targetUrl,
      personaSet: set,
      agents: AGENTS,
      maxSteps: MAX_STEPS,
      maxMinutes: MAX_MINUTES,
      outDir,
      headless: true,
      viewport: { w: 1280, h: 800 },
      concurrency: AGENTS, // saturate inside one fixture
      log: (line) => process.stdout.write(`    [${fixture.id}] ${line}\n`),
    });
    await writeReports(runDir, run);
    return {
      fixtureId: fixture.id,
      runId: run.id,
      runDir,
      durationSec: (Date.now() - tStart) / 1000,
      agentCount: run.agents.length,
      ppIssues: run.issues.map((i) => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        category: i.category,
        quote: i.quote,
        agentRef: i.agentRef,
        evidence: i.evidence,
        journey: i.journey,
      })),
    };
  } catch (e) {
    return {
      fixtureId: fixture.id,
      runId: "",
      runDir: "",
      durationSec: (Date.now() - tStart) / 1000,
      agentCount: 0,
      ppIssues: [],
      error: `executeRun failed: ${(e as Error).message}`,
    };
  }
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  const fixtures = await loadFixtures();
  if (fixtures.length === 0) {
    console.error("✗ no fixtures found");
    process.exit(1);
  }
  console.log(`pp-bench: ${fixtures.length} fixtures`);
  console.log(`  agents=${AGENTS} maxSteps=${MAX_STEPS} maxMin=${MAX_MINUTES} concurrency=${MAX_CONCURRENT}`);

  const benchId = await nextBenchId();
  const benchDir = join(RUNS_DIR, benchId);
  await mkdir(benchDir, { recursive: true });
  console.log(`  output: ${benchDir}`);

  const server = await startStaticServer();
  console.log(`  static: ${server.url}`);
  console.log("");

  const results: FixtureRunResult[] = [];
  let cursor = 0;
  const workers = Array.from({ length: MAX_CONCURRENT }, async () => {
    while (cursor < fixtures.length) {
      const i = cursor++;
      const fx = fixtures[i];
      console.log(`  ▶ ${fx.id} (${i + 1}/${fixtures.length})`);
      const r = await runOne(fx, benchDir);
      console.log(
        `    ${r.error ? "✗" : "✓"} ${fx.id} ${r.error ?? `${r.ppIssues.length} findings · ${r.durationSec.toFixed(0)}s`}`
      );
      results.push(r);
    }
  });
  await Promise.all(workers);
  await server.close();

  // Sort by fixture id for stable output.
  results.sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));
  const indexPath = join(benchDir, "index.json");
  await writeFile(
    indexPath,
    JSON.stringify(
      {
        benchId,
        runStartedAt: new Date().toISOString(),
        agents: AGENTS,
        maxSteps: MAX_STEPS,
        maxMinutes: MAX_MINUTES,
        fixtureCount: fixtures.length,
        results,
      },
      null,
      2
    )
  );

  console.log("");
  console.log(`✓ ${benchId} complete · ${results.length} fixtures · index: ${indexPath}`);
  console.log(`  next: npx tsx scripts/bench-score.ts ${benchId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
