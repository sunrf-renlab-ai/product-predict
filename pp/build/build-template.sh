#!/usr/bin/env bash
# Build the report viewer template from the prototype's JSX files + our overrides.
# Output: ../src/templates/report.html
set -euo pipefail

cd "$(dirname "$0")"
ROOT=".."
PROTO="$ROOT/../product-predict/project"
OUT_DIR="$ROOT/src/templates"
mkdir -p "$OUT_DIR"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# 1. Concatenate JSX in dependency order — minus tweaks-panel.jsx and app.jsx
#    (replaced by app-viewer.jsx).
cat "$PROTO/shared.jsx" \
    "$PROTO/setup.jsx" \
    "$PROTO/agents.jsx" \
    "./agents-viewer.jsx" \
    "$PROTO/simulation.jsx" \
    "./sim-viewer.jsx" \
    "$PROTO/report.jsx" \
    "./report-viewer.jsx" \
    "./app-viewer.jsx" \
    > "$TMP/bundle.jsx"

# 2. Compile JSX → JS via esbuild (classic React.createElement transform).
npx --yes esbuild --jsx=transform --loader=jsx --target=es2020 \
  < "$TMP/bundle.jsx" > "$TMP/bundle.js"

# 3. Build the final HTML by piping head + scripts + tail.
{
  cat <<'HEAD'
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>Product Predict · Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #0d0d0c;
    --bg-1: #131311;
    --bg-2: #1a1a17;
    --bg-3: #232320;
    --line: #2a2a26;
    --line-2: #353530;
    --fg: #f0ede3;
    --fg-1: #d4d0c4;
    --fg-2: #8a877d;
    --fg-3: #56544c;
    --accent: oklch(0.88 0.18 118);
    --accent-dim: oklch(0.88 0.18 118 / 0.15);
    --accent-fg: #0d0d0c;
    --danger: oklch(0.72 0.18 28);
    --warn: oklch(0.82 0.14 75);
    --good: oklch(0.82 0.14 155);
    --neutral: oklch(0.75 0.04 240);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); font-family: 'Geist', system-ui, sans-serif; font-feature-settings: "ss01", "ss02", "cv11"; }
  body { min-height: 100vh; overflow: hidden; }
  ::selection { background: var(--accent); color: var(--accent-fg); }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--line-2); }

  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: "ss02", "ss03", "zero"; }
  .serif { font-family: 'Instrument Serif', serif; }

  button { font-family: inherit; cursor: pointer; border: 0; background: transparent; color: inherit; padding: 0; }
  input, textarea { font-family: inherit; color: inherit; background: transparent; border: 0; outline: 0; }

  #root { height: 100vh; }

  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 100;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0);
    background-size: 3px 3px;
    mix-blend-mode: overlay;
  }

  @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
  .cursor-blink { animation: blink 1s steps(2) infinite; }
  @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.4); opacity: 0; } }
  .pulse-ring { animation: pulse-ring 1.8s ease-out infinite; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .shimmer { background: linear-gradient(90deg, transparent 0%, var(--accent-dim) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2s linear infinite; }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-up { animation: fade-in-up 0.4s ease-out backwards; }
  @keyframes slide-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  .slide-in { animation: slide-in 0.3s ease-out backwards; }
</style>
</head>
<body>
<div id="root">
  <div id="__loading" style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d0d0c;color:#8a877d;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.4px;gap:14px;">
    <div style="width:24px;height:24px;background:#f0ede3;position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="width:10px;height:10px;background:#0d0d0c;"></div>
      <div style="position:absolute;top:-3px;right:-3px;width:7px;height:7px;background:oklch(0.88 0.18 118);"></div>
    </div>
    <div>PRODUCT PREDICT · LOADING REPORT&hellip;</div>
  </div>
</div>

<!-- Injected run.json (one large literal, replaced by report.ts when writing report.html) -->
<script>window.__PP_RUN__ = /*__PP_RUN__*/null/*__END_PP_RUN__*/;</script>

<!-- Data shim — fans out __PP_RUN__ into the globals the JSX expects. -->
<script>
HEAD

  cat "$ROOT/build/data-shim.js"

  cat <<'MIDDLE'
</script>

<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>

<script>
MIDDLE

  cat "$TMP/bundle.js"

  cat <<'TAIL'
</script>
</body>
</html>
TAIL
} > "$OUT_DIR/report.html"

echo "wrote $OUT_DIR/report.html ($(wc -c < "$OUT_DIR/report.html") bytes)"
