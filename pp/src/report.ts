// Report generator — turns run.json into:
//  - report.html (static viewer, prototype-derived, dark mode only)
//  - report.md   (AI-consumable patch plan / drop-in prompt)
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Run } from "./types.js";
import { runDiffusion } from "./diffusion.js";
import { writeDiffusion } from "./diffusion-report.js";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(here, "templates/report.html");

// Floating link from the report to the propagation forecast. A fixed-position
// sibling element — injected as a string so it never touches the React bundle.
const PROPAGATION_LINK =
  `<a href="diffusion.html" title="Population diffusion forecast for this run" ` +
  `style="position:fixed;right:18px;bottom:18px;z-index:99999;background:#16160f;` +
  `border:1px solid #2a2a1f;border-left:3px solid #d6ec5a;color:#f0ede3;` +
  `font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;padding:9px 14px;` +
  `border-radius:6px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.45)">` +
  `◍ Will it spread? · propagation →</a>`;

export async function writeReports(runDir: string, run: Run): Promise<{ html: string; md: string }> {
  // 1. HTML — load template, inject run.json, write to runDir/report.html.
  const template = await readFile(TEMPLATE, "utf8");
  let injected = template.replace(
    "/*__PP_RUN__*/null/*__END_PP_RUN__*/",
    JSON.stringify(run)
  );

  // Macro layer — generate the propagation forecast (diffusion.html/json) next
  // to the report and link to it. Best-effort: a diffusion failure must never
  // break the main report.
  try {
    const diff = runDiffusion(run, {}, run.finishedAt || new Date().toISOString());
    await writeDiffusion(runDir, diff);
    injected = injected.replace("</body>", PROPAGATION_LINK + "</body>");
  } catch {
    // no diffusion link this run
  }

  const htmlPath = join(runDir, "report.html");
  await writeFile(htmlPath, injected);

  // 2. Markdown — AI patch plan with everything Claude Code needs.
  const md = renderMarkdown(run);
  const mdPath = join(runDir, "report.md");
  await writeFile(mdPath, md);

  return { html: htmlPath, md: mdPath };
}

function renderMarkdown(run: Run): string {
  const lines: string[] = [];
  lines.push(`# Product Predict / ${run.id} / Experience Notes`);
  lines.push(`# target: ${run.target.url}`);
  lines.push(`# generated: ${run.finishedAt} · schema: pp.experience.v1`);
  lines.push(``);
  lines.push(`> This is NOT a bug list. It's how a population of AI agents *felt*`);
  lines.push(`> about your product. Treat the items below as experience observations:`);
  lines.push(`> some are bugs, but more are design/fit/rhythm issues you can only see`);
  lines.push(`> when someone unlike you uses your product.`);
  lines.push(``);
  lines.push(`## SUMMARY`);
  lines.push(`- ${run.issues.length} experience observations across ${run.agents.length} agents · ${run.activity.length} events`);
  lines.push(`- Predicted NPS: ${run.metrics.predictedNps} (achievable: ${run.metrics.achievableNps})`);
  lines.push(`- Task success: ${(run.metrics.taskSuccess * 100).toFixed(0)}% · Rage clicks: ${run.metrics.rageClicks} · Delights: ${run.metrics.delightCount}`);
  lines.push(`- Sessions: ${exitReasonSummary(run)}`);
  lines.push(`- Cost: $${run.cost.usd.toFixed(2)} (${run.cost.tokensIn.toLocaleString()} in / ${run.cost.tokensOut.toLocaleString()} out)`);
  lines.push(``);

  lines.push(`## OBSERVATIONS`);
  if (run.issues.length === 0) {
    lines.push(`(everyone seemed fine)`);
  } else {
    for (let i = 0; i < run.issues.length; i++) {
      const iss = run.issues[i];
      const agent = run.agents.find((a) => a.id === iss.agentRef);
      lines.push(``);
      lines.push(`### [${iss.id}] ${iss.severity.toUpperCase()} · ${iss.category} — ${iss.title}`);
      lines.push(`SCALE: ${iss.agents}/${run.agents.length} agents felt this · ${iss.evidence} events · where: ${iss.journey}`);
      if (iss.quote) {
        lines.push(`QUOTE (${agent?.name || iss.agentRef}, ${agent?.role || ""}): "${iss.quote}"`);
      }
    }
  }
  lines.push(``);

  if (run.delights.length) {
    lines.push(`## DELIGHTS`);
    for (const d of run.delights) {
      const ag = run.agents.find((a) => a.id === d.agent);
      lines.push(`- **${d.title}** (${d.count}× · ${ag?.name || d.agent}): "${d.quote}"`);
    }
    lines.push(``);
  }

  if (run.features && run.features.length) {
    lines.push(`## FEATURE USAGE`);
    lines.push(`Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.`);
    lines.push(``);
    lines.push(`| feature | hit rate | completion | sentiment | attempts |`);
    lines.push(`|---|---|---|---|---|`);
    for (const f of run.features) {
      const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
      const sent = f.avgSentiment >= 0 ? `+${f.avgSentiment.toFixed(1)}` : f.avgSentiment.toFixed(1);
      lines.push(`| ${f.name} | ${pct(f.hitRate)} (${f.hitCount}/${run.agents.length}) | ${pct(f.completionRate)} | ${sent} | ${f.totalAttempts} |`);
    }
    lines.push(``);
  }

  lines.push(`## EXIT REASONS`);
  for (const a of run.agents) {
    lines.push(`- ${a.name}: ${a.exitReason || "—"} (${(a.durationSec || 0).toFixed(0)}s)`);
  }
  lines.push(``);

  lines.push(`## VERIFICATION`);
  lines.push(`After applying fixes, re-run:`);
  lines.push("```");
  lines.push(`pp run ${run.target.url} --agents ${run.agents.length} --compare ${run.id}`);
  lines.push("```");
  lines.push(`Pass criteria: NPS ≥ ${Math.max(0, run.metrics.predictedNps + 20)}, Rage clicks ≤ ${Math.max(0, run.metrics.rageClicks - 2)}.`);
  lines.push(``);

  lines.push(`## DROP-IN PROMPT FOR YOUR CODING AGENT`);
  lines.push("```");
  lines.push(`I ran product-predict on this codebase (${run.id}) — ${((run as { displayAgentCount?: number }).displayAgentCount || run.agents.length).toLocaleString("en-US")} AI agents tried it for real.`);
  lines.push(`${run.issues.filter((i) => i.severity === "high").length} high-severity issues found. Read report.md for full details.`);
  lines.push(``);
  lines.push(`Apply fixes for high-severity issues in order. For each:`);
  lines.push(`  1. Read the issue title + quote.`);
  lines.push(`  2. Locate the relevant component in the codebase.`);
  lines.push(`  3. Apply a fix, then add a test that would have caught it.`);
  lines.push(`  4. After each fix, run \`pp run ${run.target.url} --compare ${run.id}\` and stop if it regresses.`);
  lines.push("```");

  return lines.join("\n");
}

function exitReasonSummary(run: Run): string {
  const counts: Record<string, number> = {};
  for (const a of run.agents) {
    const k = a.exitReason || "unknown";
    counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ");
}
