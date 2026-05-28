// Demo-only: inject a "Product usage heatmap" section into the demo report.
// This is NOT a real pp feature — it's a fabricated showcase block appended to
// web/public/demo/report.html (and pp/demo/report.html). It renders a mock
// Cadence dashboard with a realistic attention heatmap overlay (Hotjar-style
// thermal gradient: blue→green→yellow→red by click/dwell intensity), so the
// demo can show "where 1,000,000 agents spent their attention".
//
// Run after regenerating the demo report:
//   node pp/build/inject-demo-heatmap.mjs

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const TARGETS = [
  resolve(here, "../demo/report.html"),
  resolve(here, "../../web/public/demo/report.html"),
];

const MARKER = "/*__PP_DEMO_HEATMAP__*/";

// The injected runtime: after React renders, find the scroll column that holds
// the report sections and append the heatmap section to it.
const SCRIPT = `
<script>${MARKER}
(function () {
  function findScrollColumn() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("#root *"));
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!/Route Heatmap/.test(el.textContent || "")) continue;
      var p = el;
      for (var d = 0; d < 8 && p; d++) {
        var oy = getComputedStyle(p).overflowY;
        if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) return p;
        p = p.parentElement;
      }
    }
    return null;
  }

  // Hotjar-style thermal ramp. intensity 0..1 controls how far up the ramp the
  // CENTER of the blob reaches (cool spots stay blue/green, hot spots peak red).
  // Each blob fades to fully transparent at its edge; overlapping blobs blend
  // additively (screen) and the whole layer is blurred for organic feathering.
  function heatBlob(x, y, r, intensity) {
    // color stops for a single point, scaled by intensity
    var a = intensity; // peak alpha
    var stops =
      "rgba(255,38,28," + (0.92*a).toFixed(2) + ") 0%," +
      "rgba(255,38,28," + (0.85*a).toFixed(2) + ") 8%," +
      "rgba(255,142,0," + (0.7*a).toFixed(2) + ") 20%," +
      "rgba(250,230,40," + (0.55*a).toFixed(2) + ") 34%," +
      "rgba(70,210,90," + (0.4*a).toFixed(2) + ") 50%," +
      "rgba(40,120,235," + (0.22*a).toFixed(2) + ") 68%," +
      "rgba(40,120,235,0) 82%";
    return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + (r*2) + 'px;height:' + (r*2) + 'px;margin:-' + r + 'px 0 0 -' + r + 'px;border-radius:50%;background:radial-gradient(circle,' + stops + ');"></div>';
  }

  function buildSection() {
    var sec = document.createElement("section");
    sec.setAttribute("data-pp-heatmap", "1");
    sec.style.cssText = "padding:36px 40px;border-top:1px solid var(--line);max-width:1100px;margin:0 auto;width:100%;box-sizing:border-box;";

    var W = 1020, H = 560;

    // Scattered click/dwell points (organic clusters, not tidy circles).
    // [x, y, radius, intensity]. Hottest = export (buried, top-right) and the
    // create-cadence CTA; warm = command palette, template feed, timezones.
    var points = [
      // export cluster (hottest)
      [905, 96, 70, 1.0], [928, 118, 52, 0.95], [882, 86, 46, 0.8], [950, 140, 40, 0.7], [870, 130, 38, 0.6],
      // create-cadence CTA cluster
      [905, 188, 56, 0.92], [880, 210, 40, 0.7],
      // main feed — template / first card
      [620, 250, 64, 0.72], [690, 300, 50, 0.55], [560, 330, 46, 0.5],
      // command palette (top bar)
      [560, 72, 50, 0.62], [620, 72, 36, 0.45],
      // timezone / settings sidebar (delight + the settings hunt)
      [150, 300, 54, 0.6], [150, 405, 44, 0.5], [150, 250, 36, 0.4],
      // lower feed / slack integration hunt
      [700, 460, 52, 0.5], [760, 500, 40, 0.38],
      // ambient nav
      [150, 150, 40, 0.3], [150, 190, 34, 0.28],
    ];

    var blobs = "";
    for (var i = 0; i < points.length; i++) {
      blobs += heatBlob(points[i][0], points[i][1], points[i][2], points[i][3]);
    }

    sec.innerHTML =
      '<div style="font-family:\\'JetBrains Mono\\',monospace;font-size:10px;letter-spacing:1.6px;color:var(--fg-3);text-transform:uppercase;margin-bottom:14px;">Product usage heatmap</div>' +
      '<h2 style="font-family:\\'Instrument Serif\\',Georgia,serif;font-size:30px;font-weight:400;letter-spacing:-0.3px;margin:0 0 6px;">Where <span style="font-style:italic;">1,000,000</span> agents spent their attention.</h2>' +
      '<p style="font-size:13px;color:var(--fg-2);line-height:1.6;margin:0 0 24px;max-width:680px;">Aggregated clicks, hovers, and dwell time across the whole population, projected onto the product UI. The hottest zones — the buried export and the create-cadence CTA — are exactly where the run flagged friction.</p>' +
      '<div style="position:relative;width:100%;max-width:' + W + 'px;aspect-ratio:' + W + '/' + H + ';border:1px solid var(--line-2);background:var(--bg-1);border-radius:4px;overflow:hidden;">' +
        mockUI(W, H) +
        // dim the UI a touch so the heat reads on top
        '<div style="position:absolute;inset:0;background:rgba(13,13,12,0.35);"></div>' +
        // the heat layer: blurred + additive blend for a real heatmap feel
        '<div style="position:absolute;inset:0;filter:blur(14px) saturate(1.15);mix-blend-mode:screen;">' + blobs + '</div>' +
      '</div>' +
      legend();

    return sec;
  }

  function mockUI(W, H) {
    return '<div style="position:absolute;inset:0;display:grid;grid-template-columns:200px 1fr;grid-template-rows:52px 1fr;font-family:Geist,system-ui,sans-serif;color:var(--fg-2);opacity:0.9;">' +
      '<div style="grid-row:1 / span 2;border-right:1px solid var(--line);background:var(--bg-2);padding:16px 14px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:22px;"><div style="width:16px;height:16px;background:var(--accent);border-radius:3px;"></div><span style="font-weight:600;color:var(--fg-1);font-size:13px;">Cadence</span></div>' +
        navItem("Today", true) + navItem("My cadences") + navItem("Team feed") + navItem("Reports") + navItem("Integrations") +
        '<div style="margin-top:24px;font-size:10px;letter-spacing:1px;color:var(--fg-3);text-transform:uppercase;">Workspace</div>' +
        navItem("Settings") + navItem("Timezones") +
      '</div>' +
      '<div style="border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--bg-1);">' +
        '<div style="display:flex;align-items:center;gap:8px;color:var(--fg-3);font-size:12px;border:1px solid var(--line-2);border-radius:4px;padding:6px 10px;width:280px;">⌘K  Search or run a command…</div>' +
        '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:12px;color:var(--fg-3);">Settings ▾</div><div style="width:24px;height:24px;border-radius:50%;background:var(--bg-3);"></div></div>' +
      '</div>' +
      '<div style="padding:20px 24px;overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><div style="font-size:17px;color:var(--fg-1);font-weight:500;">Monday standup</div><div style="font-size:11px;color:var(--accent-fg);background:var(--accent);padding:6px 12px;border-radius:4px;font-weight:600;">+ New cadence</div></div>' +
        feedCard("Maya Chen", "Shipped the cadence chart. Reviewing PR #421 next.") +
        feedCard("Kenji Okada", "CI is green. Looking at the webhook gap for standup answers.") +
        feedCard("Aiko Tanaka", "Set up timezones for the Tokyo + London folks.") +
        '<div style="margin-top:14px;display:flex;gap:10px;"><div style="flex:1;height:64px;border:1px dashed var(--line-2);border-radius:4px;"></div><div style="flex:1;height:64px;border:1px dashed var(--line-2);border-radius:4px;"></div></div>' +
      '</div>' +
    '</div>';
  }
  function navItem(t, active){
    return '<div style="font-size:12.5px;padding:6px 8px;border-radius:4px;margin-bottom:2px;color:' + (active?'var(--fg-1)':'var(--fg-2)') + ';background:' + (active?'var(--bg-3)':'transparent') + ';">' + t + '</div>';
  }
  function feedCard(name, body){
    return '<div style="border:1px solid var(--line);border-radius:5px;padding:12px 14px;margin-bottom:10px;background:var(--bg);">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><div style="width:18px;height:18px;border-radius:50%;background:var(--bg-3);"></div><span style="font-size:12px;color:var(--fg-1);font-weight:500;">' + name + '</span></div>' +
      '<div style="font-size:12px;color:var(--fg-2);line-height:1.5;">' + body + '</div>' +
    '</div>';
  }
  function legend(){
    var bar = "linear-gradient(90deg, rgba(40,120,235,0.9) 0%, rgba(70,210,90,0.9) 35%, rgba(250,230,40,0.95) 62%, rgba(255,142,0,0.95) 82%, rgba(255,38,28,1) 100%)";
    return '<div style="display:flex;align-items:center;gap:14px;margin-top:16px;font-family:\\'JetBrains Mono\\',monospace;font-size:10px;color:var(--fg-3);letter-spacing:0.5px;">' +
      '<span>LOW</span>' +
      '<span style="flex:0 0 220px;height:8px;border-radius:4px;background:' + bar + ';"></span>' +
      '<span>HIGH</span>' +
      '<span style="margin-left:auto;text-transform:uppercase;">attention · aggregated over 1,000,000 agents</span>' +
    '</div>';
  }

  function tryInject(attempt) {
    if (document.querySelector('[data-pp-heatmap]')) return;
    var col = findScrollColumn();
    if (col) { col.appendChild(buildSection()); return; }
    if (attempt < 40) setTimeout(function(){ tryInject(attempt+1); }, 150);
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(function(){ tryInject(0); }, 300);
  } else {
    window.addEventListener("DOMContentLoaded", function(){ setTimeout(function(){ tryInject(0); }, 300); });
  }
})();
</script>
`;

for (const file of TARGETS) {
  let html;
  try {
    html = await readFile(file, "utf8");
  } catch {
    console.log(`skip (not found): ${file}`);
    continue;
  }
  if (html.includes(MARKER)) {
    html = html.replace(/<script>\/\*__PP_DEMO_HEATMAP__\*\/[\s\S]*?<\/script>\s*/g, "");
  }
  html = html.replace("</body>", SCRIPT + "\n</body>");
  await writeFile(file, html);
  console.log(`✓ injected heatmap → ${file}`);
}
