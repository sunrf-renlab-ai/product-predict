// Sim proxy at /api/sim/v1/messages — the URL matches the Anthropic SDK's
// expected path scheme, so callers can use:
//   new Anthropic({ baseURL: "https://product-predict.vercel.app/api/sim" })
// and the SDK transparently POSTs to .../v1/messages here.
//
// Why this exists: pp CLI users shouldn't carry MiniMax keys (we pay for the
// plan, not them). They POST through this proxy. We attach a key from our pool
// and forward to api.minimaxi.com/anthropic/v1/messages.
//
// Env required on Vercel (server-only):
//   PP_SIM_KEYS              comma-or-newline-separated list of sk-cp-... keys
//                            (the simulation pool; do NOT include the main key)
//   PP_SIM_BASE_URL          optional; defaults to https://api.minimaxi.com/anthropic
//   PP_SIM_MODEL_DEFAULT     optional override for what model to insist on
//   PP_MAX_PER_MIN           soft rate-limit per IP (in-memory, per-instance,
//                            ~5min lifetime); defaults to 60
//
// Rate limiting (MVP): in-memory per-IP. Resets when Vercel recycles the
// instance (~minutes). Good enough until real abuse appears, then swap in
// Upstash. MiniMax per-key rate limits already cap fan-out anyway.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_MIN = parseInt(process.env.PP_MAX_PER_MIN || "60", 10);
const BASE_URL = process.env.PP_SIM_BASE_URL || "https://api.minimaxi.com/anthropic";

// Allow these models through; everything else gets coerced to MiniMax-M2.7.
// (Right now MiniMax only exposes one model via the anthropic-compat endpoint.)
const ALLOWED_MODELS = new Set(["MiniMax-M2.7"]);

let _simKeys: string[] | null = null;
function simKeys(): string[] {
  if (_simKeys) return _simKeys;
  const raw = process.env.PP_SIM_KEYS || "";
  _simKeys = raw.split(/[,\n\s]+/).filter((k) => k.startsWith("sk-cp-"));
  if (_simKeys.length === 0) {
    throw new Error("PP_SIM_KEYS not configured on the server");
  }
  return _simKeys;
}

let _keyIdx = 0;
function nextSimKey(): string {
  const keys = simKeys();
  const k = keys[_keyIdx % keys.length];
  _keyIdx++;
  return k;
}

// Tiny in-memory token bucket per IP. Map<ip, { resetAt: number; count: number }>.
const buckets = new Map<string, { resetAt: number; count: number }>();
function checkRate(ip: string): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { resetAt: now + 60_000, count: 1 });
    return { ok: true, remaining: MAX_PER_MIN - 1, resetIn: 60 };
  }
  if (b.count >= MAX_PER_MIN) {
    return { ok: false, remaining: 0, resetIn: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, remaining: MAX_PER_MIN - b.count, resetIn: Math.ceil((b.resetAt - now) / 1000) };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anon";

  const rate = checkRate(ip);
  if (!rate.ok) {
    return NextResponse.json(
      {
        type: "error",
        error: {
          type: "rate_limit_error",
          message: `Too many requests from ${ip}. Try again in ${rate.resetIn}s.`,
        },
      },
      { status: 429, headers: rateHeaders(rate) }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { type: "error", error: { type: "invalid_request_error", message: "body is not valid JSON" } },
      { status: 400 }
    );
  }

  // Coerce model.
  const requestedModel = typeof body.model === "string" ? body.model : "";
  if (!ALLOWED_MODELS.has(requestedModel)) {
    body.model = "MiniMax-M2.7";
  }

  // Forward.
  const key = nextSimKey();
  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return NextResponse.json(
      {
        type: "error",
        error: {
          type: "upstream_error",
          message: `pp sim proxy: upstream fetch failed: ${(e as Error).message}`,
        },
      },
      { status: 502, headers: rateHeaders(rate) }
    );
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      ...rateHeaders(rate),
    },
  });
}

function rateHeaders(rate: { remaining: number; resetIn: number }): Record<string, string> {
  return {
    "x-pp-ratelimit-remaining": String(rate.remaining),
    "x-pp-ratelimit-reset": String(rate.resetIn),
    "x-pp-ratelimit-max": String(MAX_PER_MIN),
  };
}
