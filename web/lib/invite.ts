// Edge-runtime-compatible HMAC invite verifier. Pure Web Crypto API — no
// node:crypto. Mirrors pp/src/invite.ts (keep them in sync). Tokens look like:
//   pp_<userTag>_<issuedAtMs>_<sigHex>
// where userTag may carry an expiry: tagName.expMs

export interface VerifiedInvite {
  ok: boolean;
  userTag?: string;
  issuedAtMs?: number;
  expMs?: number;
  reason?: "malformed" | "bad_signature" | "expired";
}

export async function verifyInvite(opts: { token: string; secret: string }): Promise<VerifiedInvite> {
  const m = opts.token.match(/^pp_([a-zA-Z0-9_-]+(?:\.\d+)?)_(\d+)_([0-9a-f]+)$/);
  if (!m) return { ok: false, reason: "malformed" };
  const [, tagPart, issuedStr, sigHex] = m;
  const issuedAtMs = parseInt(issuedStr, 10);
  if (!Number.isFinite(issuedAtMs)) return { ok: false, reason: "malformed" };

  const expected = await sign(opts.secret, tagPart, issuedAtMs);
  if (!constantTimeEq(expected, sigHex)) return { ok: false, reason: "bad_signature" };

  let userTag = tagPart;
  let expMs: number | undefined;
  const dot = tagPart.indexOf(".");
  if (dot > 0) {
    userTag = tagPart.slice(0, dot);
    const eStr = tagPart.slice(dot + 1);
    expMs = parseInt(eStr, 10);
    if (Number.isFinite(expMs) && expMs < Date.now()) {
      return { ok: false, reason: "expired", userTag, issuedAtMs, expMs };
    }
  }

  return { ok: true, userTag, issuedAtMs, expMs };
}

async function sign(secret: string, tagPart: string, issuedAtMs: number): Promise<string> {
  const expPart = tagPart.includes(".") ? tagPart.split(".")[1] : "-";
  const payload = `${tagPart}|${issuedAtMs}|${expPart}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 32);
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
