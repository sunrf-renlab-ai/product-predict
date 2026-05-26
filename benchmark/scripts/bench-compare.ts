// bench-compare.ts — render side-by-side comparison of two benchmark runs.
//
// Reads `runs/<A>/summary.json` and `runs/<B>/summary.json`, writes
// `runs/compare/<A>-vs-<B>.html` in the same design language as scorecard.
//
// Usage: npx tsx scripts/bench-compare.ts bench-001 bench-002

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { BenchSummary, FixtureScore } from "./types.js";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const RUNS_DIR = resolve(HERE, "..", "runs");

const A_ID = process.argv[2];
const B_ID = process.argv[3];
if (!A_ID || !B_ID || !/^bench-\d+$/.test(A_ID) || !/^bench-\d+$/.test(B_ID)) {
  console.error("usage: tsx bench-compare.ts <bench-A> <bench-B>");
  process.exit(1);
}

const aPath = join(RUNS_DIR, A_ID, "summary.json");
const bPath = join(RUNS_DIR, B_ID, "summary.json");
for (const p of [aPath, bPath]) {
  if (!existsSync(p)) {
    console.error(`✗ ${p} not found — run bench-score on it first`);
    process.exit(1);
  }
}

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]
  );

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const pct1 = (n: number) => `${(n * 100).toFixed(1)}%`;

function deltaTone(delta: number): string {
  if (Math.abs(delta) < 0.005) return "var(--fg-3)";
  return delta > 0 ? "var(--good)" : "var(--danger)";
}

function deltaArrow(delta: number): string {
  if (Math.abs(delta) < 0.005) return "·";
  return delta > 0 ? "↑" : "↓";
}

function deltaSpan(delta: number, format: (n: number) => string): string {
  const tone = deltaTone(delta);
  const arrow = deltaArrow(delta);
  const sign = delta > 0 ? "+" : "";
  return `<span style="color:${tone};">${arrow} ${sign}${format(delta)}</span>`;
}

const REWRITTEN = new Set([
  "07-lost-search",
  "09-fixed-template",
  "10-buried-export",
  "16-placeholder-label",
  "17-monolingual",
  "20-anti-pattern",
]);

function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((s, x) => s + f(x), 0);
}

function renderHead(aId: string, bId: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>pp-bench compare · ${esc(aId)} vs ${esc(bId)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg:#0d0d0c; --bg-1:#131311; --bg-2:#1a1a17; --bg-3:#232320;
    --line:#2a2a26; --line-2:#353530;
    --fg:#f0ede3; --fg-1:#d4d0c4; --fg-2:#8a877d; --fg-3:#56544c;
    --accent:oklch(0.88 0.18 118); --accent-dim:oklch(0.88 0.18 118 / 0.15); --accent-fg:#0d0d0c;
    --danger:oklch(0.72 0.18 28); --warn:oklch(0.82 0.14 75);
    --good:oklch(0.82 0.14 155); --neutral:oklch(0.75 0.04 240);
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background: var(--bg); color: var(--fg);
    font-family: 'Geist', system-ui, sans-serif;
    font-feature-settings: "ss01","ss02","cv11"; }
  body { min-height:100vh; }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: "ss02","ss03","zero"; }
  .serif { font-family: 'Instrument Serif', serif; }
  a { color: inherit; text-decoration: none; border-bottom: 1px dashed var(--line-2); }
  a:hover { border-bottom-color: var(--accent); }

  body::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:100;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0);
    background-size: 3px 3px; mix-blend-mode: overlay;
  }

  header.top { padding: 28px 40px; border-bottom: 1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between; gap:24px; }
  header.top .crumb { display:flex; align-items:center; gap:12px; }
  header.top .logo { width:22px; height:22px; background:var(--fg); position:relative;
    display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  header.top .logo i { width:9px; height:9px; background:var(--bg); display:block; }
  header.top .logo s { position:absolute; top:-2px; right:-2px; width:6px; height:6px; background:var(--accent); }
  header.top h1 { font-size:14px; font-weight:600; letter-spacing:-0.2px; margin:0; line-height:1; }
  header.top .sub { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--fg-3); letter-spacing:0.6px; margin-top:3px; }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 40px; }

  .hero { padding: 48px 0 40px; border-bottom: 1px solid var(--line); }
  .hero .eyebrow { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1.6px;
    color: var(--fg-3); text-transform: uppercase; margin-bottom: 16px; }
  .hero h2 { font-size: 32px; line-height:1.2; letter-spacing:-0.6px; font-weight: 400; margin:0 0 8px; }

  .metrics { display:grid; grid-template-columns: repeat(6, 1fr); gap: 1px;
    background: var(--line); border: 1px solid var(--line); margin-top: 28px; }
  .metric { background: var(--bg-1); padding: 22px 24px; }
  .metric .k { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:1.4px;
    color:var(--fg-3); text-transform:uppercase; margin-bottom:10px; }
  .metric .row { display:flex; align-items:baseline; gap:10px; }
  .metric .from { font-size:14px; color: var(--fg-3); font-family:'JetBrains Mono',monospace; font-variant-numeric:tabular-nums; }
  .metric .arrow { color: var(--fg-3); }
  .metric .to { font-size:28px; line-height:1; letter-spacing:-1px; font-weight:400; font-variant-numeric: tabular-nums; }
  .metric .delta { font-family:'JetBrains Mono',monospace; font-size:11px; margin-top:8px; line-height:1.5; }

  section.block { padding: 36px 0; border-bottom: 1px solid var(--line); }
  section.block h3 { font-size: 18px; font-weight: 500; margin: 0 0 16px;
    font-family:'JetBrains Mono',monospace; letter-spacing: 1px; text-transform: uppercase; color: var(--fg-2); }
  section.block .desc { font-size: 13px; color: var(--fg-2); margin-bottom: 24px; line-height: 1.55; max-width: 720px; }

  .cfg-grid { display:grid; grid-template-columns: 220px 1fr 1fr; gap: 1px;
    background: var(--line); border: 1px solid var(--line); }
  .cfg-grid > div { background: var(--bg-1); padding: 14px 18px; font-size: 13px; }
  .cfg-grid > div.head { background: var(--bg-2); font-family:'JetBrains Mono',monospace; font-size:10px;
    letter-spacing:1.2px; color: var(--fg-3); text-transform: uppercase; }
  .cfg-grid .key { color: var(--fg-3); font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.4px; }

  table.cmp { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.cmp th, table.cmp td { padding: 12px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
  table.cmp th { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1.2px;
    color: var(--fg-3); text-transform: uppercase; font-weight: 500;
    background: var(--bg-1); border-top: 1px solid var(--line); }
  table.cmp td.num { font-family:'JetBrains Mono',monospace; font-variant-numeric: tabular-nums; text-align: right; }
  table.cmp tr.rewritten td:first-child::before {
    content: "✎"; color: var(--accent); margin-right: 6px; font-weight: 600;
  }
  table.cmp tr.rewritten { background: color-mix(in oklch, var(--accent) 4%, transparent); }
  table.cmp .delta-cell { font-family:'JetBrains Mono',monospace; font-variant-numeric: tabular-nums;
    font-weight: 500; text-align: right; }

  .legend { display:flex; gap:24px; font-size:11px; color: var(--fg-3); margin-top:12px;
    font-family:'JetBrains Mono',monospace; letter-spacing:0.4px; }
  .legend span { display:inline-flex; align-items:center; gap:6px; }
  .legend .mark { width:10px; height:10px; }

  footer { padding: 28px 40px; color: var(--fg-3); font-size: 11px;
    font-family:'JetBrains Mono', monospace; border-top: 1px solid var(--line); }
</style>
</head><body>`;
}

function renderTop(aId: string, bId: string): string {
  return `
<header class="top">
  <div class="crumb">
    <div class="logo"><i></i><s></s></div>
    <div>
      <h1>pp-bench / compare</h1>
      <div class="sub">${esc(aId)} → ${esc(bId)}</div>
    </div>
  </div>
  <div style="font-family:'JetBrains Mono',monospace; font-size:10px; color: var(--fg-3); letter-spacing:0.6px; text-align:right;">
    side-by-side comparison<br>
    measuring pp's progress
  </div>
</header>`;
}

function renderHero(a: BenchSummary, b: BenchSummary): string {
  const deltaR = b.aggregate.recall - a.aggregate.recall;
  const deltaP = b.aggregate.precision - a.aggregate.precision;
  const deltaF1 = b.aggregate.f1 - a.aggregate.f1;
  const deltaSev = b.aggregate.severityAcc - a.aggregate.severityAcc;
  const deltaCat = b.aggregate.categoryAcc - a.aggregate.categoryAcc;
  const aFP = sum(a.perFixture, (x) => x.falsePositives.length);
  const bFP = sum(b.perFixture, (x) => x.falsePositives.length);
  const deltaFP = bFP - aFP;

  const f1Big = `<span class="from">${a.aggregate.f1.toFixed(2)}</span> <span class="arrow">→</span> <span class="to">${b.aggregate.f1.toFixed(2)}</span>`;
  return `
<div class="container">
  <div class="hero">
    <div class="eyebrow">scorecard delta · ${esc(a.runId)} → ${esc(b.runId)}</div>
    <h2>
      pp 在 ${b.fixtureCount} 个 fixtures 上从找到 <span style="color: var(--fg-3);">${a.aggregate.matched}/${a.aggregate.gtTotal}</span>
      ${" "}变成 <span style="color: var(--accent);">${b.aggregate.matched}/${b.aggregate.gtTotal}</span>。
      <br>F1: ${f1Big}.
    </h2>

    <div class="metrics">
      <div class="metric">
        <div class="k">RECALL</div>
        <div class="row"><span class="from">${pct(a.aggregate.recall)}</span><span class="arrow">→</span><span class="to" style="color: var(--accent);">${pct(b.aggregate.recall)}</span></div>
        <div class="delta">${deltaSpan(deltaR, pct1)}</div>
      </div>
      <div class="metric">
        <div class="k">PRECISION</div>
        <div class="row"><span class="from">${pct(a.aggregate.precision)}</span><span class="arrow">→</span><span class="to" style="color: var(--accent);">${pct(b.aggregate.precision)}</span></div>
        <div class="delta">${deltaSpan(deltaP, pct1)}</div>
      </div>
      <div class="metric">
        <div class="k">F1</div>
        <div class="row"><span class="from">${a.aggregate.f1.toFixed(2)}</span><span class="arrow">→</span><span class="to" style="color: ${deltaTone(deltaF1)};">${b.aggregate.f1.toFixed(2)}</span></div>
        <div class="delta">${deltaSpan(deltaF1, (n) => n.toFixed(3))}</div>
      </div>
      <div class="metric">
        <div class="k">SEVERITY ACC</div>
        <div class="row"><span class="from">${pct(a.aggregate.severityAcc)}</span><span class="arrow">→</span><span class="to">${pct(b.aggregate.severityAcc)}</span></div>
        <div class="delta">${deltaSpan(deltaSev, pct1)}</div>
      </div>
      <div class="metric">
        <div class="k">CATEGORY ACC</div>
        <div class="row"><span class="from">${pct(a.aggregate.categoryAcc)}</span><span class="arrow">→</span><span class="to">${pct(b.aggregate.categoryAcc)}</span></div>
        <div class="delta">${deltaSpan(deltaCat, pct1)}</div>
      </div>
      <div class="metric">
        <div class="k">FALSE POS</div>
        <div class="row"><span class="from">${aFP}</span><span class="arrow">→</span><span class="to" style="color: ${deltaFP <= 0 ? "var(--good)" : "var(--warn)"};">${bFP}</span></div>
        <div class="delta">${deltaSpan(-deltaFP / Math.max(aFP, 1), pct1)}</div>
      </div>
    </div>
  </div>
</div>`;
}

function renderConfig(a: BenchSummary, b: BenchSummary): string {
  const rows: Array<[string, string, string]> = [
    ["started", a.startedAt.slice(0, 16).replace("T", " "), b.startedAt.slice(0, 16).replace("T", " ")],
    ["model", `${a.pp.provider} · ${a.pp.model}`, `${b.pp.provider} · ${b.pp.model}`],
    ["max steps / agent", String(a.pp.maxSteps), String(b.pp.maxSteps)],
    ["max minutes / agent", String(a.pp.maxMinutes), String(b.pp.maxMinutes)],
    ["agents / fixture", String(a.pp.agentsPerFixture), String(b.pp.agentsPerFixture)],
    ["pp version", a.pp.version, b.pp.version],
    ["GT total", String(a.aggregate.gtTotal), String(b.aggregate.gtTotal)],
    ["pp findings total", String(a.aggregate.ppTotal), String(b.aggregate.ppTotal)],
  ];
  return `
<section class="block">
  <div class="container">
    <h3>Configuration</h3>
    <div class="desc">两次 run 的 pp 参数对比。"max steps" 是单个模拟用户 agent 在 fixture 上最多操作多少步;
    更高 = 更多探索时间。</div>
    <div class="cfg-grid">
      <div class="head">parameter</div>
      <div class="head">${esc(a.runId)}</div>
      <div class="head">${esc(b.runId)}</div>
      ${rows.map(([k, av, bv]) => {
        const same = av === bv;
        return `<div class="key">${esc(k)}</div>
                <div${same ? "" : ' style="color:var(--fg-2);"'}>${esc(av)}</div>
                <div${same ? "" : ' style="color:var(--accent);"'}>${esc(bv)}</div>`;
      }).join("\n      ")}
    </div>
  </div>
</section>`;
}

function renderFixtureTable(a: BenchSummary, b: BenchSummary): string {
  const aById = new Map(a.perFixture.map((f) => [f.fixtureId, f]));
  const bById = new Map(b.perFixture.map((f) => [f.fixtureId, f]));
  const allIds = Array.from(new Set([...aById.keys(), ...bById.keys()]));

  const rows = allIds
    .map((id) => {
      const fa = aById.get(id);
      const fb = bById.get(id);
      const aF1 = fa?.f1 ?? 0;
      const bF1 = fb?.f1 ?? 0;
      const aRec = fa?.recall ?? 0;
      const bRec = fb?.recall ?? 0;
      const aPrec = fa?.precision ?? 0;
      const bPrec = fb?.precision ?? 0;
      const aMatch = fa?.matched ?? 0;
      const bMatch = fb?.matched ?? 0;
      const gtTotal = fb?.gtTotal ?? fa?.gtTotal ?? 0;
      const deltaF1 = bF1 - aF1;
      const deltaRec = bRec - aRec;
      const isRewritten = REWRITTEN.has(id);
      return { id, gtTotal, aRec, bRec, aPrec, bPrec, aF1, bF1, aMatch, bMatch, deltaF1, deltaRec, isRewritten };
    })
    .sort((x, y) => y.deltaF1 - x.deltaF1);

  const wins = rows.filter((r) => r.deltaF1 > 0.005).length;
  const losses = rows.filter((r) => r.deltaF1 < -0.005).length;
  const same = rows.length - wins - losses;

  return `
<section class="block">
  <div class="container">
    <h3>Per-fixture delta</h3>
    <div class="desc">按 ΔF1 降序。<strong style="color:var(--good);">${wins} 涨</strong> ·
      <strong style="color:var(--danger);">${losses} 跌</strong> · ${same} 持平 ·
      ✎ 标识本次重写过的 fixture (6 个)。</div>
    <table class="cmp">
      <thead>
        <tr>
          <th>fixture</th>
          <th class="num">GT</th>
          <th class="num">${esc(a.runId)} (R / P / F1)</th>
          <th class="num">${esc(b.runId)} (R / P / F1)</th>
          <th class="num">Δ matched</th>
          <th class="num">Δ F1</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `<tr class="${r.isRewritten ? "rewritten" : ""}">
            <td>${esc(r.id)}</td>
            <td class="num">${r.gtTotal}</td>
            <td class="num" style="color: var(--fg-3);">${pct(r.aRec)} · ${pct(r.aPrec)} · ${r.aF1.toFixed(2)}</td>
            <td class="num">${pct(r.bRec)} · ${pct(r.bPrec)} · ${r.bF1.toFixed(2)}</td>
            <td class="num">${r.aMatch} → ${r.bMatch}</td>
            <td class="delta-cell" style="color: ${deltaTone(r.deltaF1)};">${deltaArrow(r.deltaF1)} ${r.deltaF1 >= 0 ? "+" : ""}${r.deltaF1.toFixed(3)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <div class="legend">
      <span><span class="mark" style="background: color-mix(in oklch, var(--accent) 30%, transparent);"></span>rewritten fixture</span>
      <span><span class="mark" style="background: var(--good);"></span>improved</span>
      <span><span class="mark" style="background: var(--danger);"></span>regressed</span>
    </div>
  </div>
</section>`;
}

function renderFooter(aId: string, bId: string): string {
  return `
<footer>
  generated · ${new Date().toISOString().slice(0, 16).replace("T", " ")} ·
  ${esc(aId)} vs ${esc(bId)} ·
  <a href="../${esc(aId)}/scorecard.html">${esc(aId)} scorecard</a> ·
  <a href="../${esc(bId)}/scorecard.html">${esc(bId)} scorecard</a>
</footer>
</body></html>`;
}

async function main() {
  const a = JSON.parse(await readFile(aPath, "utf-8")) as BenchSummary;
  const b = JSON.parse(await readFile(bPath, "utf-8")) as BenchSummary;

  const html =
    renderHead(A_ID, B_ID) +
    renderTop(A_ID, B_ID) +
    renderHero(a, b) +
    renderConfig(a, b) +
    renderFixtureTable(a, b) +
    renderFooter(A_ID, B_ID);

  const outDir = join(RUNS_DIR, "compare");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${A_ID}-vs-${B_ID}.html`);
  await writeFile(outPath, html);

  console.log(`✓ wrote ${outPath}`);
  console.log(`  aggregate ΔF1: ${(b.aggregate.f1 - a.aggregate.f1 >= 0 ? "+" : "")}${(b.aggregate.f1 - a.aggregate.f1).toFixed(3)}`);
  console.log(`  recall: ${pct(a.aggregate.recall)} → ${pct(b.aggregate.recall)}`);
  console.log(`  precision: ${pct(a.aggregate.precision)} → ${pct(b.aggregate.precision)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
