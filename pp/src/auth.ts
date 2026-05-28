// CLI authentication. The user logs in on the web dashboard, copies their
// "CLI token" (a Supabase refresh token), and runs `pp login` to store it.
// At run time we exchange the refresh token for a short-lived access token
// and send it as a Bearer to the sim proxy.
//
// Storage: macOS Keychain entry `pp-auth-token` (same pattern as other
// credentials). Falls back to PP_AUTH_TOKEN env on non-macOS / CI.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

// Public Supabase project config (publishable — safe to ship in the CLI).
const SUPABASE_URL = process.env.PP_SUPABASE_URL || "https://zlftcanyskprkzbujpjs.supabase.co";
const SUPABASE_ANON = process.env.PP_SUPABASE_ANON || "sb_publishable_h8EQqPAspVx349RLnb6OBQ_QlihGD2N";

const KEYCHAIN_SERVICE = "pp-auth-token";

let _accessToken: string | null = null;
let _accessExp = 0; // epoch ms

// ── token storage ────────────────────────────────────────────────────────

export async function storeRefreshToken(token: string): Promise<void> {
  if (process.platform === "darwin") {
    await execFileP("security", [
      "add-generic-password", "-U", "-a", process.env.USER || "pp", "-s", KEYCHAIN_SERVICE, "-w", token,
    ]);
    return;
  }
  throw new Error(
    "non-macOS: set PP_AUTH_TOKEN env to your CLI token instead of `pp login`"
  );
}

export async function readRefreshToken(): Promise<string | null> {
  if (process.env.PP_AUTH_TOKEN) return process.env.PP_AUTH_TOKEN;
  if (process.platform === "darwin") {
    try {
      const { stdout } = await execFileP("security", [
        "find-generic-password", "-s", KEYCHAIN_SERVICE, "-w",
      ]);
      const t = stdout.trim();
      return t || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function clearToken(): Promise<void> {
  if (process.platform === "darwin") {
    await execFileP("security", ["delete-generic-password", "-s", KEYCHAIN_SERVICE]).catch(() => {});
  }
  _accessToken = null;
  _accessExp = 0;
}

export async function isLoggedIn(): Promise<boolean> {
  return (await readRefreshToken()) != null;
}

// ── access token exchange ──────────────────────────────────────────────────

// Exchange the stored refresh token for a fresh access token. Cached in-memory
// until ~1 min before expiry. The refresh token rotates on each exchange, so we
// persist the new one.
export async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _accessExp - 60_000) return _accessToken;

  const refresh = await readRefreshToken();
  if (!refresh) {
    throw new Error("not logged in — run `pp login` first (get your token at product-predict.renlab.ai/dashboard)");
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`login expired or invalid (${res.status}). Run \`pp login\` again. ${body.slice(0, 120)}`);
  }
  const data = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  _accessToken = data.access_token;
  _accessExp = Date.now() + (data.expires_in || 3600) * 1000;

  // Persist the rotated refresh token so the next session still works.
  if (data.refresh_token && data.refresh_token !== refresh) {
    await storeRefreshToken(data.refresh_token).catch(() => {});
  }
  return _accessToken;
}

// Validate a refresh token at login time by attempting one exchange. Returns
// the user's email if the token resolves to a session.
export async function validateAndStore(refreshToken: string): Promise<{ email: string | null }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    throw new Error("that token didn't work — copy a fresh one from product-predict.renlab.ai/dashboard");
  }
  const data = (await res.json()) as { refresh_token: string; user?: { email?: string } };
  await storeRefreshToken(data.refresh_token || refreshToken);
  return { email: data.user?.email ?? null };
}
