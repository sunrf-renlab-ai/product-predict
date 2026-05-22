// One-line installer for pp.
//   curl -fsSL https://product-predict.vercel.app/install | sh
//
// Serves a bash script that:
//  - checks git + node 20+ + npm exist
//  - clones (or `git pull`s) sunrf-renlab-ai/product-predict to ~/.pp/src
//  - npm-installs deps (which postinstalls Chromium)
//  - symlinks bin/pp into ~/.local/bin/pp (creates the dir if missing)
//  - prints a PATH-export hint if ~/.local/bin isn't on PATH
//
// Plain text route — content-type matters: `curl | sh` must NOT see any
// HTML preamble or framework noise.

import { NextResponse } from "next/server";

export const runtime = "edge";

const SCRIPT = `#!/usr/bin/env bash
# pp installer · https://product-predict.vercel.app/install
# Curl-piped installation for the Product Predict CLI.
set -euo pipefail

PP_DIR="\${PP_INSTALL_DIR:-$HOME/.pp/src}"
PP_BIN="\${PP_BIN_DIR:-$HOME/.local/bin}"
REPO_URL="https://github.com/sunrf-renlab-ai/product-predict.git"

# ── ANSI helpers ────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  C_DIM='\\033[2m'; C_OK='\\033[32m'; C_WARN='\\033[33m'; C_ERR='\\033[31m'; C_OFF='\\033[0m'
else
  C_DIM=''; C_OK=''; C_WARN=''; C_ERR=''; C_OFF=''
fi
say()  { printf '%s%s%s\\n' "$C_DIM" "  $*" "$C_OFF"; }
ok()   { printf '%s✓%s %s\\n' "$C_OK" "$C_OFF" "$*"; }
warn() { printf '%s!%s %s\\n' "$C_WARN" "$C_OFF" "$*"; }
fail() { printf '%s✗%s %s\\n' "$C_ERR" "$C_OFF" "$*"; exit 1; }

printf '\\n  pp installer\\n  ────────────\\n\\n'

# ── 1. Prerequisites ────────────────────────────────────────────────────────
command -v git  >/dev/null 2>&1 || fail "git not found. Install git first."
command -v node >/dev/null 2>&1 || fail "node not found. Install Node.js ≥ 20 first (https://nodejs.org)."
command -v npm  >/dev/null 2>&1 || fail "npm not found (comes with Node.js)."

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node $(node -v) is too old. pp needs Node ≥ 20."
fi
ok "prereqs: git, node $(node -v), npm"

# ── 2. Clone or update ──────────────────────────────────────────────────────
if [ -d "$PP_DIR/.git" ]; then
  say "found existing install at $PP_DIR — updating"
  ( cd "$PP_DIR" && git fetch --quiet origin main && git reset --hard origin/main >/dev/null )
  ok "updated to $(cd "$PP_DIR" && git rev-parse --short HEAD)"
else
  say "cloning $REPO_URL → $PP_DIR"
  mkdir -p "$(dirname "$PP_DIR")"
  git clone --quiet --depth 1 "$REPO_URL" "$PP_DIR"
  ok "cloned to $PP_DIR"
fi

# ── 3. Install deps (postinstall fetches Chromium ~150 MB) ──────────────────
say "installing dependencies (one-time Chromium download ~150MB) …"
( cd "$PP_DIR/pp" && npm install --no-audit --no-fund --silent 2>&1 | tail -5 ) || \\
  fail "npm install failed in $PP_DIR/pp"
ok "deps installed"

# ── 4. Symlink the binary ───────────────────────────────────────────────────
mkdir -p "$PP_BIN"
ln -sf "$PP_DIR/pp/bin/pp" "$PP_BIN/pp"
ok "linked $PP_BIN/pp → $PP_DIR/pp/bin/pp"

# ── 5. PATH hint ────────────────────────────────────────────────────────────
case ":$PATH:" in
  *":$PP_BIN:"*) ok "$PP_BIN is on your PATH" ;;
  *)
    warn "$PP_BIN is NOT on your PATH yet"
    case "$SHELL" in
      */zsh)  RC="$HOME/.zshrc"  ;;
      */bash) RC="$HOME/.bashrc" ;;
      *)      RC="your shell rc" ;;
    esac
    printf '\\n    Add this to %s and restart your shell:\\n\\n      %sexport PATH="%s:$PATH"%s\\n\\n' \\
      "$RC" "$C_OK" "$PP_BIN" "$C_OFF"
    ;;
esac

# ── Done ────────────────────────────────────────────────────────────────────
printf '\\n  %sInstalled.%s Try it:\\n\\n' "$C_OK" "$C_OFF"
printf '    %spp run https://example.com --hint "what your product is"%s\\n\\n' "$C_DIM" "$C_OFF"
printf '  More:\\n'
printf '    pp --help\\n'
printf '    https://product-predict.vercel.app\\n\\n'
`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
