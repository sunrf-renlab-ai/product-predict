// Re-generate report.html for a run.json without re-running agents.
// Useful when the template changes.
import { readFile } from "node:fs/promises";
import { writeReports } from "../src/report.js";

const runDir = process.argv[2];
if (!runDir) {
  console.error("usage: tsx build/regen-report.ts <runDir>");
  process.exit(1);
}
const meta = JSON.parse(await readFile(`${runDir}/run.json`, "utf8"));
const { html, md } = await writeReports(runDir, meta);
console.log("rewrote:", html, md);
