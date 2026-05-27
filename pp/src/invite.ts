// HMAC-signed invite tokens. Stateless: no DB.
//
// Token format: pp_<userTag>_<issuedAtMs>_<sigHex>
//   where sig = HMAC-SHA256(secret, `${userTag}|${issuedAtMs}|${expMs ?? "-"}`)
//   userTag may be encoded with an expiry suffix: tagName.expMs (dot-separated)
//
// On verification:
//   - parse parts
//   - recompute HMAC
//   - constant-time compare
//   - if expMs present and < now → expired
//
// Shared between pp CLI (this file) and the Vercel function
// (web/lib/invite.ts re-exports the same logic via copy — keep them in sync).

import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifiedInvite {
  ok: boolean;
  userTag?: string;
  issuedAtMs?: number;
  expMs?: number;
  reason?: "malformed" | "bad_signature" | "expired";
}

export function generateInvite(opts: {
  secret: string;
  userTag: string;
  expDays?: number;
}): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(opts.userTag)) {
    throw new Error("userTag must match /[a-zA-Z0-9_-]+/");
  }
  const issuedAtMs = Date.now();
  const expMs = opts.expDays != null ? issuedAtMs + opts.expDays * 24 * 60 * 60 * 1000 : undefined;
  const tagPart = expMs != null ? `${opts.userTag}.${expMs}` : opts.userTag;
  const sig = sign(opts.secret, tagPart, issuedAtMs);
  return `pp_${tagPart}_${issuedAtMs}_${sig}`;
}

export function verifyInvite(opts: { token: string; secret: string }): VerifiedInvite {
  const m = opts.token.match(/^pp_([a-zA-Z0-9_-]+(?:\.\d+)?)_(\d+)_([0-9a-f]+)$/);
  if (!m) return { ok: false, reason: "malformed" };
  const [, tagPart, issuedStr, sigHex] = m;
  const issuedAtMs = parseInt(issuedStr, 10);
  if (!Number.isFinite(issuedAtMs)) return { ok: false, reason: "malformed" };

  const expected = sign(opts.secret, tagPart, issuedAtMs);
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

function sign(secret: string, tagPart: string, issuedAtMs: number): string {
  const expPart = tagPart.includes(".") ? tagPart.split(".")[1] : "-";
  const payload = `${tagPart}|${issuedAtMs}|${expPart}`;
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}
