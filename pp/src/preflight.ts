// Preflight checks that pp can actually run: Playwright's Chromium browser
// must be downloaded. If not, install it interactively (with consent — the
// download is ~150MB).
//
// Called from cli.ts before any `pp run` invocation.

import { spawnSync, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function ensurePlaywrightBrowser(opts: { silent?: boolean } = {}): boolean {
  // Playwright caches browsers under ~/Library/Caches/ms-playwright (macOS),
  // ~/.cache/ms-playwright (Linux), %USERPROFILE%\AppData\Local\ms-playwright
  // (Windows). The exact directory name is `chromium-<rev>`.
  const cacheDir = playwrightCacheDir();
  const hasChromium = existsSync(cacheDir) && hasAnyChromiumBuild(cacheDir);
  if (hasChromium) return true;

  if (!opts.silent) {
    console.log("");
    console.log("⚙  Playwright's Chromium browser isn't installed yet.");
    console.log(`   pp needs it to drive real browser sessions (~150 MB download, one-time).`);
    console.log(`   Running: npx playwright install chromium`);
    console.log("");
  }

  const r = spawnSync("npx", ["playwright", "install", "chromium"], {
    stdio: opts.silent ? "ignore" : "inherit",
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "" },
  });

  if (r.status !== 0) {
    console.error("");
    console.error("✗ Chromium install failed. Try manually:");
    console.error("    npx playwright install chromium");
    console.error("");
    return false;
  }

  if (!opts.silent) console.log("✓ Chromium ready.");
  return true;
}

function playwrightCacheDir(): string {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH && process.env.PLAYWRIGHT_BROWSERS_PATH !== "0") {
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  }
  const home = homedir();
  if (process.platform === "darwin") return join(home, "Library", "Caches", "ms-playwright");
  if (process.platform === "win32") return join(home, "AppData", "Local", "ms-playwright");
  return join(home, ".cache", "ms-playwright");
}

function hasAnyChromiumBuild(cacheDir: string): boolean {
  try {
    const entries = execSync(`ls -1 ${JSON.stringify(cacheDir)} 2>/dev/null`, { encoding: "utf8" });
    return entries.split("\n").some((line) => line.startsWith("chromium-") || line.startsWith("chromium_headless"));
  } catch {
    return false;
  }
}
