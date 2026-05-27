#!/usr/bin/env node
// Generate an HMAC-signed invite token for pp cloud.
//
// Usage:
//   PP_INVITE_SECRET=... node pp/scripts/gen-invite.mjs <userTag> [expDays]
//
// Example:
//   PP_INVITE_SECRET=$(security find-generic-password -s pp-invite-secret -w) \
//     node pp/scripts/gen-invite.mjs alice 90
//   → pp_alice.1791251200000_1761123456789_a1b2c3...

import { createHmac } from "node:crypto";

const secret = process.env.PP_INVITE_SECRET;
if (!secret) {
  console.error("PP_INVITE_SECRET env var required (keep this in macOS Keychain `pp-invite-secret`)");
  process.exit(2);
}

const userTag = process.argv[2];
const expDays = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;
if (!userTag) {
  console.error("usage: gen-invite.mjs <userTag> [expDays]");
  process.exit(2);
}
if (!/^[a-zA-Z0-9_-]+$/.test(userTag)) {
  console.error("userTag must match /[a-zA-Z0-9_-]+/");
  process.exit(2);
}

const issuedAtMs = Date.now();
const expMs = expDays != null && Number.isFinite(expDays) ? issuedAtMs + expDays * 86400000 : undefined;
const tagPart = expMs != null ? `${userTag}.${expMs}` : userTag;
const expPart = expMs != null ? String(expMs) : "-";
const payload = `${tagPart}|${issuedAtMs}|${expPart}`;
const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);

const token = `pp_${tagPart}_${issuedAtMs}_${sig}`;
console.log(token);
if (expMs) console.error(`(expires: ${new Date(expMs).toISOString()})`);
