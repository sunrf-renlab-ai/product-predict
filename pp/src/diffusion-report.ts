// diffusion-report.ts — writes the macro-layer artifacts into a run dir:
//   diffusion.json  — the full DiffusionResult (machine-readable)
//   diffusion.html  — a self-contained viewer: a 1,000,000-agent propagation
//                     field + live q/reach sliders + bifurcation chart.
// Mirrors report.ts: read the template, inject the data at a marker, write.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { DiffusionResult } from "./diffusion.js";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(here, "templates/diffusion.html");
const CMP_TEMPLATE = resolve(here, "templates/diffusion-comparison.html");

export async function writeDiffusion(
  runDir: string,
  result: DiffusionResult
): Promise<{ html: string; json: string }> {
  const template = await readFile(TEMPLATE, "utf8");
  const injected = template.replace(
    "/*__PP_DIFF__*/null/*__END_PP_DIFF__*/",
    JSON.stringify(result)
  );
  const htmlPath = join(runDir, "diffusion.html");
  await writeFile(htmlPath, injected);

  const jsonPath = join(runDir, "diffusion.json");
  await writeFile(jsonPath, JSON.stringify(result, null, 2));

  return { html: htmlPath, json: jsonPath };
}

// Write an A/B comparison viewer. Both results MUST have been computed under the
// SAME assumptions (reach/q) so the shared confounds cancel and the DIFFERENCE
// is the trustworthy signal.
export async function writeComparison(
  outDir: string,
  a: DiffusionResult,
  b: DiffusionResult
): Promise<{ html: string }> {
  const template = await readFile(CMP_TEMPLATE, "utf8");
  const injected = template.replace(
    "/*__PP_CMP__*/null/*__END_PP_CMP__*/",
    JSON.stringify({ a, b })
  );
  const htmlPath = join(outDir, `diffusion-compare-${a.runId}-vs-${b.runId}.html`);
  await writeFile(htmlPath, injected);
  return { html: htmlPath };
}
