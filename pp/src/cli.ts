#!/usr/bin/env node
import { Command } from "commander";
import { resolve, join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import { existsSync, statSync, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

import { executeRun } from "./runner.js";
import { writeReports } from "./report.js";
import { providerInfo, simKeyCount, MOCK_MODE } from "./llm.js";
import { ensurePlaywrightBrowser } from "./preflight.js";
import { generatePresetPersonas } from "./persona-gen.js";
import {
  derivePersonasFromBeta,
  deriveMixedPersonas,
  type ParsedSource,
} from "./persona-derive.js";
import { parseDocument } from "./parsers/document.js";
import { parseAudio } from "./parsers/audio.js";
import {
  savePersonaSet,
  loadPersonaSet,
  listPersonaSets,
  personaSetPath,
  deletePersonaSet,
} from "./persona-store.js";
import type { PersonaSet } from "./types.js";

// Resolve the install dir so `pp demo` can find the bundled sample report
// regardless of where the user invoked from.
const HERE = dirname(fileURLToPath(import.meta.url));
const INSTALL_ROOT = resolve(HERE, ".."); // pp/ (parent of src/)
const DEMO_DIR = resolve(INSTALL_ROOT, "demo");

const program = new Command();
program
  .name("pp")
  .description("Product Predict — user experience simulation. Run synthetic users in a real browser.")
  .version("0.5.0")
  .action(() => {
    // No subcommand → friendly first-screen instead of bare commander help.
    printIntro();
  });

// ── pp run ──────────────────────────────────────────────────────────────────

program
  .command("run")
  .description("Run a predict against a target URL.")
  .argument("<url>", "Target URL")
  .option("--personas <name>", "saved persona set (from `pp personas list`)")
  .option("--hint <text>", "if no --personas, generate fresh personas for this hint")
  .option("-a, --agents <n>", "number of agent slots (default: sim key count)", (v) => parseInt(v, 10))
  .option("--max-steps <n>", "safety cap on steps per agent (real users quit on their own)", (v) => parseInt(v, 10), 30)
  .option("--max-minutes <n>", "wall-clock safety cap per agent (minutes)", (v) => parseInt(v, 10), 10)
  .option("--out <dir>", "runs output base", "./runs")
  .option("--head", "show the browser (default: headless)", false)
  .option("--viewport <wxh>", "viewport", "1280x800")
  .option("--concurrency <n>", "parallel agents", (v) => parseInt(v, 10), 2)
  .option("--no-open", "don't open the report when done")
  .action(async (url: string, opts) => {
    const [w, h] = String(opts.viewport).split("x").map((n: string) => parseInt(n, 10));
    const outDir = resolve(process.cwd(), opts.out);

    console.log(`pp run ${url}`);
    printProvider();
    if (!ensurePlaywrightBrowser()) process.exit(1);

    // 1. Resolve persona set.
    let set: PersonaSet;
    if (opts.personas) {
      set = await loadPersonaSet(opts.personas);
      console.log(`  personas: "${set.name}" (${set.origin}, ${set.personas.length} archetypes)`);
    } else {
      const hint = opts.hint || url;
      console.log(`  personas: generating fresh from hint "${shortText(hint, 50)}"`);
      const simKeys = safeSimKeys();
      const n = Math.min(opts.agents ?? simKeys, simKeys);
      set = await generatePresetPersonas({ targetHint: hint, n });
      console.log(`  generated ${set.personas.length} archetypes (not saved; use \`pp personas generate\` to persist)`);
    }

    console.log(`  agents=${opts.agents ?? "auto"} maxSteps=${opts.maxSteps} maxMin=${opts.maxMinutes} concurrency=${opts.concurrency} headless=${!opts.head}`);
    console.log(`  out=${outDir}`);

    // 2. Run.
    const { run, runDir } = await executeRun({
      targetUrl: url,
      personaSet: set,
      agents: opts.agents,
      maxSteps: opts.maxSteps,
      maxMinutes: opts.maxMinutes,
      outDir,
      headless: !opts.head,
      viewport: { w, h },
      concurrency: opts.concurrency,
      log: (line) => console.log(line),
    });

    // 3. Emit reports.
    const { html, md } = await writeReports(runDir, run);
    console.log("");
    console.log(`✓ ${run.id} complete`);
    console.log(`  ${run.issues.length} issues · ${run.delights.length} delights`);
    console.log(`  predicted NPS ${run.metrics.predictedNps} · task success ${(run.metrics.taskSuccess * 100).toFixed(0)}%`);
    console.log(`  HTML: ${html}`);
    console.log(`  MD:   ${md}`);

    if (opts.open) {
      openInBrowser(html);
    }
  });

// ── pp personas <subcommand> ────────────────────────────────────────────────

const personas = program.command("personas").description("Manage persona sets used by `pp run`.");

personas
  .command("generate")
  .description("AI-generate a persona set tailored to a project hint (URL or short description).")
  .argument("<hint>", "what the product is (URL, repo desc, or one-liner)")
  .option("-n <n>", "persona count (capped at sim-key count)", (v) => parseInt(v, 10))
  .option("--save <name>", "save with this name (defaults to a slug from the hint)")
  .option("--language <lang>", "zh | en", "zh")
  .action(async (hint: string, opts) => {
    printProvider();
    const simKeys = safeSimKeys();
    const n = Math.min(opts.n ?? simKeys, simKeys);
    if (opts.n && opts.n > simKeys) {
      console.warn(`! requested ${opts.n} personas but only ${simKeys} sim keys — capping to ${simKeys}`);
    }
    console.log(`generating ${n} personas for "${shortText(hint, 60)}"…`);
    const set = await generatePresetPersonas({ targetHint: hint, n, language: opts.language });
    const slug = opts.save || set.id;
    const path = await savePersonaSet(set, slug);
    console.log(`✓ saved as "${slug}" (${path})`);
    printPersonaSummary(set);
  });

personas
  .command("from-beta")
  .description("Derive a persona set from real beta data (docs / audio).")
  .argument("<files...>", "paths to .md/.txt/.pdf/.docx/.mp3/.wav/.m4a/.flac/.ogg/.webm")
  .option("-n <n>", "persona count", (v) => parseInt(v, 10))
  .option("--hint <text>", "optional product description to frame the population")
  .option("--save <name>", "save with this name")
  .option("--language <lang>", "zh | en", "zh")
  .action(async (files: string[], opts) => {
    printProvider();
    const simKeys = safeSimKeys();
    const n = Math.min(opts.n ?? simKeys, simKeys);
    console.log(`parsing ${files.length} source(s)…`);
    const sources = await parseSources(files);
    console.log(`  ${sources.length} sources, ${sources.reduce((s, x) => s + x.text.length, 0)} text chars`);
    console.log(`deriving ${n} personas from beta…`);
    const set = await derivePersonasFromBeta({ sources, n, language: opts.language, targetHint: opts.hint });
    const slug = opts.save || set.id;
    const path = await savePersonaSet(set, slug);
    console.log(`✓ saved as "${slug}" (${path})`);
    printPersonaSummary(set);
  });

personas
  .command("mixed")
  .description("Combine an AI preset with beta-derived personas.")
  .argument("<hint>", "product description")
  .argument("<files...>", "beta data files")
  .option("-n <n>", "persona count", (v) => parseInt(v, 10))
  .option("--save <name>", "save with this name")
  .option("--language <lang>", "zh | en", "zh")
  .action(async (hint: string, files: string[], opts) => {
    printProvider();
    const simKeys = safeSimKeys();
    const n = Math.min(opts.n ?? simKeys, simKeys);
    console.log(`parsing ${files.length} source(s)…`);
    const sources = await parseSources(files);
    console.log(`generating preset + deriving beta in parallel, then merging…`);
    const set = await deriveMixedPersonas({ targetHint: hint, sources, n, language: opts.language });
    const slug = opts.save || set.id;
    const path = await savePersonaSet(set, slug);
    console.log(`✓ saved as "${slug}" (${path})`);
    printPersonaSummary(set);
  });

personas
  .command("list")
  .description("List saved persona sets.")
  .action(async () => {
    const all = await listPersonaSets();
    if (all.length === 0) {
      console.log("(none) — run `pp personas generate <hint>` first.");
      return;
    }
    for (const s of all) {
      console.log(`${s.id.padEnd(28)}  ${s.origin.padEnd(7)}  ${String(s.count).padStart(2)} personas  ${s.name}`);
    }
  });

personas
  .command("show")
  .description("Print a persona set as JSON.")
  .argument("<name>")
  .action(async (name: string) => {
    const set = await loadPersonaSet(name);
    console.log(JSON.stringify(set, null, 2));
  });

personas
  .command("edit")
  .description("Open the persona set in $EDITOR.")
  .argument("<name>")
  .action(async (name: string) => {
    const path = personaSetPath(name);
    if (!existsSync(path)) throw new Error(`persona set "${name}" not found`);
    const editor = process.env.EDITOR || "vi";
    const p = spawn(editor, [path], { stdio: "inherit" });
    await new Promise<void>((r) => p.on("exit", () => r()));
  });

personas
  .command("delete")
  .description("Delete a saved persona set.")
  .argument("<name>")
  .action(async (name: string) => {
    await deletePersonaSet(name);
    console.log(`deleted ${name}`);
  });

// ── pp list / serve ─────────────────────────────────────────────────────────

program
  .command("list")
  .description("List past runs in --out (default ./runs).")
  .option("--out <dir>", "runs base dir", "./runs")
  .action(async (opts) => {
    const outDir = resolve(process.cwd(), opts.out);
    if (!existsSync(outDir)) {
      console.log("(no runs)");
      return;
    }
    const names = (await readdir(outDir)).filter((n) => /^run-\d+$/.test(n)).sort();
    for (const n of names) {
      const jsonPath = join(outDir, n, "run.json");
      if (!existsSync(jsonPath)) continue;
      const r = JSON.parse(await readFile(jsonPath, "utf8"));
      console.log(`${n}  ${r.target?.title || r.target?.url}  · ${r.issues?.length || 0} issues · NPS ${r.metrics?.predictedNps}`);
    }
  });

program
  .command("serve")
  .description("Serve the runs/ directory as a local dashboard.")
  .option("--port <p>", "port", (v) => parseInt(v, 10), 8907)
  .option("--out <dir>", "runs base dir", "./runs")
  .option("--no-open", "don't auto-open the dashboard in a browser")
  .action(async (opts) => {
    const outDir = resolve(process.cwd(), opts.out);
    const port = opts.port;
    const server = createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      let path = url.pathname;
      if (path === "/") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(indexHtml(outDir));
        return;
      }
      const safe = path.replace(/^\/+/, "").replace(/\.\./g, "");
      const file = join(outDir, safe);
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": mime(file) });
      createReadStream(file).pipe(res);
    });
    server.listen(port, () => {
      console.log(`pp serve · http://localhost:${port}`);
      console.log(`  serving: ${outDir}`);
      if (opts.open) openInBrowser(`http://localhost:${port}`);
    });
  });

// ── pp demo ─────────────────────────────────────────────────────────────────

program
  .command("demo")
  .description("Open the bundled sample report — what pp's output looks like, before you run anything.")
  .action(async () => {
    const html = join(DEMO_DIR, "report.html");
    if (!existsSync(html)) {
      console.error(`✗ demo not found at ${html}. Reinstall pp:`);
      console.error(`    curl -fsSL https://product-predict.vercel.app/install | sh`);
      process.exit(1);
    }
    // Serve the demo dir so screenshots load via their relative paths.
    const port = 8911;
    const server = createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      const path = url.pathname === "/" ? "/report.html" : url.pathname;
      const safe = path.replace(/^\/+/, "").replace(/\.\./g, "");
      const file = join(DEMO_DIR, safe);
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": mime(file) });
      createReadStream(file).pipe(res);
    });
    server.listen(port, () => {
      const url = `http://localhost:${port}/`;
      console.log(`pp demo · ${url}`);
      console.log(`  sample: 7-agent run against a 4-tab todo app (real MiniMax-M2.7 output)`);
      console.log(`  Ctrl-C to stop`);
      openInBrowser(url);
    });
  });

// ── helpers ─────────────────────────────────────────────────────────────────

function printProvider(): void {
  if (MOCK_MODE) {
    console.log(`  provider=MOCK (PP_MOCK_LLM=1)`);
    return;
  }
  try {
    const p = providerInfo();
    if (p.name === "proxy") {
      console.log(`  provider=cloud-proxy · ${p.baseURL} · ${p.simKeyCount} sim slots (hosted by sunrf-renlab-ai)`);
    } else {
      console.log(`  provider=${p.name} · model=${p.model} · main=${p.mainKeyPrefix} · ${p.simKeyCount} sim key${p.simKeyCount === 1 ? "" : "s"}`);
    }
  } catch (e) {
    console.error(`✗ ${(e as Error).message}`);
    process.exit(1);
  }
}

function safeSimKeys(): number {
  if (MOCK_MODE) return 6;
  try {
    return simKeyCount();
  } catch {
    return 1;
  }
}

function printPersonaSummary(set: PersonaSet): void {
  for (const p of set.personas) {
    console.log(
      `  ${p.glyph} ${p.name.padEnd(20)} ${String(p.age).padStart(2)}·${p.role.padEnd(8)} ` +
      `tech ${p.tech}/5 · w=${(p.weight * 100).toFixed(0)}%`
    );
  }
}

async function parseSources(files: string[]): Promise<ParsedSource[]> {
  const audioExt = new Set([".mp3", ".wav", ".m4a", ".flac", ".ogg", ".webm", ".aac"]);
  const out: ParsedSource[] = [];
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (audioExt.has(ext)) {
      console.log(`  audio: ${f}`);
      out.push(await parseAudio(f));
    } else {
      console.log(`  doc:   ${f}`);
      out.push(await parseDocument(f));
    }
  }
  return out;
}

function shortText(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function openInBrowser(url: string): void {
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  spawn(opener, [url], { detached: true, stdio: "ignore" }).unref();
}

const C = (() => {
  const t = process.stdout.isTTY;
  return {
    dim:    (s: string) => (t ? `\x1b[2m${s}\x1b[0m` : s),
    bold:   (s: string) => (t ? `\x1b[1m${s}\x1b[0m` : s),
    accent: (s: string) => (t ? `\x1b[38;5;191m${s}\x1b[0m` : s),  // lime-ish
    fg:     (s: string) => s,
  };
})();

function printIntro(): void {
  const accent = C.accent;
  const dim = C.dim;
  const bold = C.bold;
  process.stdout.write(`
  ${bold("Product Predict")} ${dim("· user experience simulation")}

  ${dim("Run synthetic users — each with their own preferences, prior tools,")}
  ${dim("competitor experience — against your product in a real browser.")}
  ${dim("Get back how that population felt, not just a bug list.")}

  ${bold("One-line first run")}
    ${accent("$")} pp run ${dim("https://your-app.com")} --hint ${dim('"what your product is"')}

  ${bold("See what a report looks like first")}
    ${accent("$")} pp demo

  ${bold("Save a reusable persona set")}
    ${accent("$")} pp personas generate ${dim('"your product description"')} --save my-product
    ${accent("$")} pp run ${dim("<url>")} --personas my-product

  ${bold("From real beta data")}
    ${accent("$")} pp personas from-beta ${dim("interviews/*.md calls/*.m4a")} --save my-beta

  ${bold("Browse past runs")}
    ${accent("$")} pp serve

  ${bold("Help")}
    ${accent("$")} pp --help                    ${dim("# all commands")}
    ${accent("$")} pp <command> --help          ${dim("# any specific one")}
    ${dim("https://product-predict.vercel.app")}

`);
}

function indexHtml(outDir: string): string {
  if (!existsSync(outDir)) {
    return `<h1>No runs yet</h1><p>Run <code>pp run &lt;url&gt;</code> first.</p>`;
  }
  const names: string[] = [];
  try {
    for (const n of require("node:fs").readdirSync(outDir)) {
      if (/^run-\d+$/.test(n) && existsSync(join(outDir, n, "report.html"))) names.push(n);
    }
  } catch {}
  names.sort().reverse();
  const items = names.map((n) => `<li><a href="/${n}/report.html">${n}</a></li>`).join("\n");
  return `<!doctype html><html><head><meta charset=utf-8><title>Product Predict · Runs</title>
<style>body{font-family:'JetBrains Mono',ui-monospace,monospace;background:#0d0d0c;color:#f0ede3;padding:40px;}
a{color:oklch(0.88 0.18 118)}</style></head>
<body><h1>Product Predict · Runs</h1>${names.length ? `<ul>${items}</ul>` : "<p>No runs yet.</p>"}</body></html>`;
}

function mime(file: string): string {
  const ext = extname(file).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".md": "text/markdown; charset=utf-8",
  } as Record<string, string>)[ext] || "application/octet-stream";
}

await program.parseAsync(process.argv);
