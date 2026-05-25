// bench-report.ts — render summary.json into scorecard.html.
//
// Self-contained HTML with the same warm-dark + lime + Geist + JetBrains Mono
// design tokens as pp's report viewer. Two sections:
//
//   ① OVERVIEW — aggregate recall / precision / F1, by category, by severity
//   ② PER-FIXTURE drilldown — for each fixture: GT issues with match status,
//      pp findings categorized as matched / false positive
//
// Pure server-side HTML generation. No React, no JS in output (links to
// per-fixture run.json + matched.json as raw artifacts).
//
// Usage: npx tsx scripts/bench-report.ts bench-001

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { BenchSummary, FixtureScore } from "./types.js";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const RUNS_DIR = resolve(HERE, "..", "runs");

const BENCH_ID = process.argv[2];
if (!BENCH_ID || !/^bench-\d+$/.test(BENCH_ID)) {
  console.error("usage: tsx bench-report.ts <bench-NNN>");
  process.exit(1);
}

const benchDir = join(RUNS_DIR, BENCH_ID);
const summaryPath = join(benchDir, "summary.json");
if (!existsSync(summaryPath)) {
  console.error(`✗ ${summaryPath} not found — run bench-score.ts first`);
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]
  );

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const sevTone = (s: string) =>
  s === "high" ? "var(--danger)" : s === "med" ? "var(--warn)" : "var(--neutral)";

const gradeFor = (f1: number): { letter: string; color: string } => {
  if (f1 >= 0.85) return { letter: "A", color: "var(--good)" };
  if (f1 >= 0.7) return { letter: "B", color: "var(--good)" };
  if (f1 >= 0.55) return { letter: "C", color: "var(--warn)" };
  if (f1 >= 0.4) return { letter: "D", color: "var(--warn)" };
  return { letter: "F", color: "var(--danger)" };
};

// ── render ──────────────────────────────────────────────────────────────────

function renderHead(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>pp-bench scorecard · ${esc(BENCH_ID)}</title>
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
  .hero h2 { font-size: 36px; line-height:1.15; letter-spacing:-0.6px; font-weight: 400; margin:0 0 8px; }

  .metrics { display:grid; grid-template-columns: repeat(6, 1fr); gap: 1px;
    background: var(--line); border: 1px solid var(--line); margin-top: 28px; }
  .metric { background: var(--bg-1); padding: 22px 24px; }
  .metric .k { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:1.4px;
    color:var(--fg-3); text-transform:uppercase; margin-bottom:10px; }
  .metric .v { font-size:36px; line-height:1; letter-spacing:-1px; font-weight:400;
    font-variant-numeric: tabular-nums; }
  .metric .sub { font-family:'JetBrains Mono',monospace; font-size:10px;
    color:var(--fg-3); margin-top:8px; line-height:1.5;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  section.block { padding: 36px 0; border-bottom: 1px solid var(--line); }
  section.block h3 { font-size: 18px; font-weight: 500; margin: 0 0 16px;
    font-family:'JetBrains Mono',monospace; letter-spacing: 1px; text-transform: uppercase; color: var(--fg-2); }

  table.fx { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.fx th, table.fx td { padding: 12px 16px; border-bottom: 1px solid var(--line);
    text-align: left; vertical-align: top; }
  table.fx th { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:1.2px;
    color: var(--fg-3); text-transform: uppercase; font-weight: 500;
    background: var(--bg-1); border-top: 1px solid var(--line); }
  table.fx td.num { font-family:'JetBrains Mono',monospace; font-variant-numeric: tabular-nums; text-align: right; }
  table.fx .grade { display:inline-block; width:24px; height:24px; line-height:24px; text-align:center;
    font-family:'JetBrains Mono',monospace; font-weight:600; font-size:13px; border-radius:2px; }

  .bar { height: 6px; background: var(--bg-2); position: relative; overflow: hidden; }
  .bar > div { height: 100%; background: var(--accent); }

  details.fx-detail { border: 1px solid var(--line); margin-bottom: 12px; background: var(--bg-1); }
  details.fx-detail > summary { padding: 14px 20px; cursor: pointer; list-style: none;
    display: grid; grid-template-columns: 28px 1fr 80px 80px 80px 60px; gap: 16px; align-items: center; }
  details.fx-detail > summary::-webkit-details-marker { display: none; }
  details.fx-detail .meta-cell { font-family:'JetBrains Mono',monospace; font-size:11px; font-variant-numeric:tabular-nums; text-align: right; color: var(--fg-2); }

  .grid-cols { display:grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 0 20px 20px; }
  .col-block { background: var(--bg); border: 1px solid var(--line); }
  .col-block .label { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:1.4px;
    color: var(--fg-3); text-transform:uppercase; padding: 10px 16px; border-bottom: 1px solid var(--line); }
  .col-block ul { list-style: none; margin: 0; padding: 0; }
  .col-block li { padding: 10px 16px; border-bottom: 1px solid var(--line); display: flex; gap: 10px; align-items: flex-start; }
  .col-block li:last-child { border-bottom: 0; }
  .col-block li .sev { font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:600;
    letter-spacing:0.6px; padding: 2px 6px; border: 1px solid; border-radius: 2px;
    flex-shrink: 0; text-transform: uppercase; }
  .col-block li .text { font-size: 12.5px; line-height: 1.5; flex: 1; }
  .col-block li .cat { font-family:'JetBrains Mono',monospace; font-size:9px; color: var(--fg-3); display:block; margin-top:4px; }
  .col-block li.matched .text::before { content: "✓ "; color: var(--good); font-weight: 600; }
  .col-block li.missed .text::before { content: "✗ "; color: var(--danger); font-weight: 600; }

  footer { padding: 28px 40px; color: var(--fg-3); font-size: 11px;
    font-family:'JetBrains Mono', monospace; border-top: 1px solid var(--line); }
</style>
</head><body>`;
}

function renderHero(s: BenchSummary): string {
  const agg = s.aggregate;
  const grade = gradeFor(agg.f1);
  return `
<header class="top">
  <div class="crumb">
    <div class="logo"><i></i><s></s></div>
    <div>
      <h1>pp-bench</h1>
      <div class="sub">${esc(s.runId)} · ${s.fixtureCount} fixtures · ${esc(s.pp.model)} · ${esc(s.pp.provider)}</div>
    </div>
  </div>
  <div style="font-family:'JetBrains Mono',monospace; font-size:10px; color: var(--fg-3); letter-spacing:0.6px; text-align:right;">
    started ${esc(s.startedAt.slice(0, 16).replace("T", " "))}<br>
    agents/fixture ${esc(String(s.pp.agentsPerFixture))} · maxSteps ${s.pp.maxSteps}
  </div>
</header>
<div class="container">
  <div class="hero">
    <div class="eyebrow">scorecard · 体验预测准确度</div>
    <h2>
      pp 在 ${s.fixtureCount} 个故意设计有缺陷的 fixture 上找到了
      <span style="color: var(--accent);">${agg.matched}/${agg.gtTotal}</span> 个已知问题。
      <br>
      整体 <span class="grade" style="background: ${grade.color}; color: var(--bg); padding: 4px 10px; border-radius: 2px; margin-left: 4px;">${grade.letter}</span>
      ${" "}F1 = ${agg.f1.toFixed(2)}.
    </h2>

    <div class="metrics">
      <div class="metric"><div class="k">RECALL</div><div class="v" style="color: var(--accent);">${pct(agg.recall)}</div><div class="sub">${agg.matched} / ${agg.gtTotal} GT 找到</div></div>
      <div class="metric"><div class="k">PRECISION</div><div class="v" style="color: var(--accent);">${pct(agg.precision)}</div><div class="sub">${agg.ppTotal - sum(s.perFixture, (x) => x.falsePositives.length)} / ${agg.ppTotal} 真命中</div></div>
      <div class="metric"><div class="k">F1</div><div class="v" style="color: ${grade.color};">${agg.f1.toFixed(2)}</div><div class="sub">综合质量</div></div>
      <div class="metric"><div class="k">SEVERITY ACC</div><div class="v">${pct(agg.severityAcc)}</div><div class="sub">分级是否对得上</div></div>
      <div class="metric"><div class="k">CATEGORY ACC</div><div class="v">${pct(agg.categoryAcc)}</div><div class="sub">类目是否对得上</div></div>
      <div class="metric"><div class="k">FALSE POS</div><div class="v" style="color: ${agg.ppTotal - sum(s.perFixture, (x) => x.falsePositives.length) === agg.ppTotal ? "var(--good)" : "var(--warn)"};">${sum(s.perFixture, (x) => x.falsePositives.length)}</div><div class="sub">pp 多说出来的</div></div>
    </div>
  </div>
</div>`;
}

function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((s, x) => s + f(x), 0);
}

function renderFixtureRow(fx: FixtureScore): string {
  const grade = gradeFor(fx.f1);
  return `
<details class="fx-detail">
  <summary>
    <span class="grade" style="background: ${grade.color}; color: var(--bg);">${grade.letter}</span>
    <div>
      <div style="font-weight: 500; font-size: 14px;">${esc(fx.fixtureId)}</div>
      <div class="mono" style="font-size: 10px; color: var(--fg-3); margin-top: 3px; letter-spacing: 0.3px;">
        ${fx.matched}/${fx.gtTotal} GT · ${fx.ppTotal} findings · ${fx.falsePositives.length} false pos
      </div>
    </div>
    <span class="meta-cell">R ${pct(fx.recall)}</span>
    <span class="meta-cell">P ${pct(fx.precision)}</span>
    <span class="meta-cell">F1 ${fx.f1.toFixed(2)}</span>
    <span class="meta-cell" style="color: var(--accent);">▼</span>
  </summary>
  <div class="grid-cols">
    <div class="col-block">
      <div class="label">Ground truth (${fx.gtTotal})</div>
      <ul>
        ${fx.verdicts
          .map((v) => {
            const gt = fx.missed.find((m) => m.gtId === v.gtId)?.gt;
            // Find GT title from missed list, or via the verdict's data
            const sev = gt?.severity || "low";
            const cat = gt?.category || "";
            const title = gt?.title || `gt:${v.gtId}`;
            const matchedClass = v.matched ? "matched" : "missed";
            return `<li class="${matchedClass}">
              <span class="sev" style="color: ${sevTone(sev)}; border-color: color-mix(in oklch, ${sevTone(sev)} 40%, transparent); background: color-mix(in oklch, ${sevTone(sev)} 12%, transparent);">${esc(sev)}</span>
              <div class="text">${esc(title)}
                <span class="cat">${esc(cat)} · ${v.matched ? `conf ${v.confidence.toFixed(2)}` : "missed"}</span>
              </div>
            </li>`;
          })
          .join("")}
      </ul>
    </div>
    <div class="col-block">
      <div class="label">pp findings (${fx.ppTotal})</div>
      <ul>
        ${
          fx.ppTotal === 0
            ? `<li><div class="text" style="color: var(--fg-3); font-style: italic;">no findings reported</div></li>`
            : fx.falsePositives
                .map((fp) => {
                  const sev = fp.finding.severity;
                  return `<li>
                    <span class="sev" style="color: ${sevTone(sev)}; border-color: color-mix(in oklch, ${sevTone(sev)} 40%, transparent); background: color-mix(in oklch, ${sevTone(sev)} 12%, transparent);">${esc(sev)}</span>
                    <div class="text" style="color: var(--fg-3);">⚠ ${esc(fp.finding.title)}
                      <span class="cat">${esc(fp.finding.category)} · false positive</span>
                    </div>
                  </li>`;
                })
                .join("") +
              (fx.matched > 0
                ? `<li><div class="text" style="color: var(--good);">+ ${fx.matched} matched findings (mapped to GT above)</div></li>`
                : "")
        }
      </ul>
    </div>
  </div>
</details>`;
}

function renderBody(s: BenchSummary): string {
  const sorted = [...s.perFixture].sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));
  return `
<div class="container">
  <section class="block">
    <h3>fixtures · ${s.perFixture.length}</h3>
    ${sorted.map(renderFixtureRow).join("")}
  </section>
</div>
<footer>
  pp-bench · ${esc(BENCH_ID)} · summary.json + matched.json per fixture in this run dir<br>
  pp v${esc(s.pp.version)} · ${esc(s.pp.model)} via ${esc(s.pp.provider)} · maxSteps ${s.pp.maxSteps}, maxMin ${s.pp.maxMinutes}
</footer>
</body></html>`;
}

async function main() {
  const summary = JSON.parse(await readFile(summaryPath, "utf8")) as BenchSummary;
  const html = renderHead() + renderHero(summary) + renderBody(summary);
  const out = join(benchDir, "scorecard.html");
  await writeFile(out, html);
  console.log(`✓ ${out}`);
  console.log(`  open ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
