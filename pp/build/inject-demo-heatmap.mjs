// Demo-only: inject a "Product usage heatmap" section into the demo report.
// This is NOT a real pp feature — it's a fabricated showcase block appended to
// web/public/demo/report.html (and pp/demo/report.html). It renders a mock
// Cadence dashboard with an attention/click heatmap overlay so the demo can
// show "where 1,000,000 agents spent their attention".
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
      // climb to the nearest scrollable ancestor
      var p = el;
      for (var d = 0; d < 8 && p; d++) {
        var oy = getComputedStyle(p).overflowY;
        if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) return p;
        p = p.parentElement;
      }
    }
    return null;
  }

  function blob(x, y, r, color, op) {
    return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + (r*2) + 'px;height:' + (r*2) + 'px;margin:-' + r + 'px 0 0 -' + r + 'px;border-radius:50%;background:radial-gradient(circle,' + color + ' 0%,' + color + ' 18%,transparent 70%);opacity:' + op + ';mix-blend-mode:screen;pointer-events:none;"></div>';
  }
  function pin(x, y, label, tone) {
    return '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%);pointer-events:none;">' +
      '<div style="width:10px;height:10px;border-radius:50%;background:' + tone + ';box-shadow:0 0 0 3px color-mix(in oklch,' + tone + ' 30%,transparent);margin:0 auto 5px;"></div>' +
      '<div style="font-family:\\'JetBrains Mono\\',monospace;font-size:9px;letter-spacing:0.3px;color:var(--fg-1);background:var(--bg);border:1px solid var(--line-2);padding:2px 6px;white-space:nowrap;border-radius:2px;">' + label + '</div>' +
    '</div>';
  }

  function buildSection() {
    var sec = document.createElement("section");
    sec.setAttribute("data-pp-heatmap", "1");
    sec.style.cssText = "padding:36px 40px;border-top:1px solid var(--line);max-width:1100px;margin:0 auto;width:100%;box-sizing:border-box;";

    // mock Cadence dashboard dimensions
    var W = 1020, H = 560;

    var hot = "oklch(0.72 0.20 28)";   // red-ish (frustration / blockers)
    var warm = "oklch(0.82 0.16 75)";  // amber (hesitation)
    var good = "oklch(0.88 0.18 118)"; // lime (delight)

    var overlay =
      // buried export — the #1 issue, top-right settings menu
      blob(initX(940), 96, 92, hot, 0.85) +
      // create-cadence / onboarding entry — top of main column
      blob(initX(560), 150, 80, hot, 0.7) +
      // timezone per-person setting — delight, mid sidebar
      blob(initX(150), 300, 64, good, 0.7) +
      // Cmd+K command palette — delight, top bar center
      blob(initX(560), 70, 52, good, 0.6) +
      // template editor — feature-fit miss, main column mid
      blob(initX(620), 330, 70, warm, 0.6) +
      // slack integration — feature miss, lower main
      blob(initX(700), 470, 66, warm, 0.55) +
      // cool ambient on nav
      blob(initX(150), 180, 48, good, 0.25) +
      pin(initX(940), 96, "Export (buried 3 levels) · 41% of attention", hot) +
      pin(initX(560), 150, "Create-first-cadence · drop-off", hot) +
      pin(initX(150), 300, "Per-person timezone · delight", good) +
      pin(initX(560), 70, "Cmd+K palette · delight", good);

    function initX(v){ return v; }

    sec.innerHTML =
      '<div style="font-family:\\'JetBrains Mono\\',monospace;font-size:10px;letter-spacing:1.6px;color:var(--fg-3);text-transform:uppercase;margin-bottom:14px;">Product usage heatmap</div>' +
      '<h2 style="font-family:\\'Instrument Serif\\',Georgia,serif;font-size:30px;font-weight:400;letter-spacing:-0.3px;margin:0 0 6px;">Where <span style="font-style:italic;">1,000,000</span> agents spent their attention.</h2>' +
      '<p style="font-size:13px;color:var(--fg-2);line-height:1.6;margin:0 0 24px;max-width:680px;">Aggregated clicks, hovers, and dwell time across the whole population, projected onto the product UI. Red = friction &amp; blockers, amber = hesitation, lime = delight.</p>' +
      '<div style="position:relative;width:100%;max-width:' + W + 'px;aspect-ratio:' + W + '/' + H + ';border:1px solid var(--line-2);background:var(--bg-1);border-radius:3px;overflow:hidden;">' +
        mockUI(W, H) +
        '<div style="position:absolute;inset:0;">' + overlay + '</div>' +
      '</div>' +
      legend(good, warm, hot);

    return sec;
  }

  function mockUI(W, H) {
    // A simplified Cadence dashboard: left nav, top bar, standup feed.
    return '<div style="position:absolute;inset:0;display:grid;grid-template-columns:200px 1fr;grid-template-rows:52px 1fr;font-family:Geist,system-ui,sans-serif;color:var(--fg-2);">' +
      // sidebar
      '<div style="grid-row:1 / span 2;border-right:1px solid var(--line);background:var(--bg-2);padding:16px 14px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:22px;"><div style="width:16px;height:16px;background:var(--accent);border-radius:3px;"></div><span style="font-weight:600;color:var(--fg-1);font-size:13px;">Cadence</span></div>' +
        navItem("Today", true) + navItem("My cadences") + navItem("Team feed") + navItem("Reports") + navItem("Integrations") +
        '<div style="margin-top:24px;font-size:10px;letter-spacing:1px;color:var(--fg-3);text-transform:uppercase;">Workspace</div>' +
        navItem("Settings") + navItem("Timezones") +
      '</div>' +
      // top bar
      '<div style="border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--bg-1);">' +
        '<div style="display:flex;align-items:center;gap:8px;color:var(--fg-3);font-size:12px;border:1px solid var(--line-2);border-radius:4px;padding:6px 10px;width:280px;">⌘K  Search or run a command…</div>' +
        '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:12px;color:var(--fg-3);">Settings ▾</div><div style="width:24px;height:24px;border-radius:50%;background:var(--bg-3);"></div></div>' +
      '</div>' +
      // main feed
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
  function legend(good, warm, hot){
    return '<div style="display:flex;align-items:center;gap:16px;margin-top:16px;font-family:\\'JetBrains Mono\\',monospace;font-size:10px;color:var(--fg-3);letter-spacing:0.4px;">' +
      '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:' + good + ';"></span>delight</span>' +
      '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:' + warm + ';"></span>hesitation</span>' +
      '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:' + hot + ';"></span>friction / blocker</span>' +
      '<span style="margin-left:auto;">aggregated over 1,000,000 agents</span>' +
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
    // strip old injection (between marker script tags) so re-runs are idempotent
    html = html.replace(/<script>\/\*__PP_DEMO_HEATMAP__\*\/[\s\S]*?<\/script>\s*/g, "");
  }
  html = html.replace("</body>", SCRIPT + "\n</body>");
  await writeFile(file, html);
  console.log(`✓ injected heatmap → ${file}`);
}
