"use client";

import { useState } from "react";
import { supabaseBrowser, SUPABASE_CONFIGURED } from "@/lib/supabase";

type Phase = "idle" | "checking" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) {
      setPhase("error");
      setMsg("Auth is not configured on this deployment yet.");
      return;
    }
    const sb = supabaseBrowser();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setPhase("error");
      setMsg("Enter a valid email address.");
      return;
    }

    setPhase("checking");
    setMsg("");

    // Does this email already have an invite? Existing users skip the code.
    const { data: hasInvite, error: checkErr } = await sb.rpc("email_has_invite", {
      p_email: cleanEmail,
    });
    if (checkErr) {
      setPhase("error");
      setMsg("Couldn't reach the server. Try again.");
      return;
    }

    if (!hasInvite) {
      // New user — must redeem an invite code.
      if (!code.trim()) {
        setNeedCode(true);
        setPhase("idle");
        setMsg("This email isn't registered yet. Enter your invite code to sign up.");
        return;
      }
      const { data: redeemed, error: redeemErr } = await sb.rpc("redeem_invite", {
        p_code: code.trim(),
        p_email: cleanEmail,
      });
      if (redeemErr || !redeemed) {
        setPhase("error");
        setMsg("That invite code is invalid or already used.");
        return;
      }
    }

    // Send the magic link. For new users this also creates the account, which
    // the server-side trigger permits only because the invite was just redeemed.
    setPhase("sending");
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error: otpErr } = await sb.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: redirectTo },
    });
    if (otpErr) {
      setPhase("error");
      setMsg(otpErr.message || "Couldn't send the magic link.");
      return;
    }
    setPhase("sent");
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <div className="mono" style={eyebrow}>Product Predict</div>
        <h1 style={h1}>Sign in</h1>
        <p style={sub}>
          Magic-link sign-in. New here? You'll need an invite code.
        </p>

        {phase === "sent" ? (
          <div style={notice}>
            <div style={{ fontSize: 15, marginBottom: 6, color: "var(--fg)" }}>Check your inbox</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6 }}>
              We sent a magic link to <span style={{ color: "var(--accent)" }}>{email.trim().toLowerCase()}</span>.
              Click it to finish signing in.
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
              autoComplete="email"
              required
            />
            {needCode && (
              <input
                type="text"
                placeholder="Invite code (e.g. PP-ALPHA-XXXX)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={input}
                autoCapitalize="characters"
              />
            )}
            <button
              type="submit"
              disabled={phase === "checking" || phase === "sending"}
              style={{ ...button, opacity: phase === "checking" || phase === "sending" ? 0.6 : 1 }}
            >
              {phase === "checking" ? "CHECKING…" : phase === "sending" ? "SENDING…" : "SEND MAGIC LINK"}
            </button>
          </form>
        )}

        {msg && (
          <div style={{ marginTop: 14, fontSize: 12.5, color: phase === "error" ? "var(--danger, #e0726a)" : "var(--fg-2)", lineHeight: 1.5 }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: 28, fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--mono, monospace)" }}>
          <a href="/" style={{ color: "inherit", borderBottom: "1px dashed var(--line-2)" }}>← back to home</a>
        </div>
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  padding: 24, background: "var(--bg)",
};
const card: React.CSSProperties = {
  width: "100%", maxWidth: 420, border: "1px solid var(--line)", background: "var(--bg-1)",
  padding: "40px 36px", borderRadius: 2,
};
const eyebrow: React.CSSProperties = {
  fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 20,
};
const h1: React.CSSProperties = { fontSize: 28, fontWeight: 400, letterSpacing: -0.5, margin: "0 0 8px" };
const sub: React.CSSProperties = { fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6, margin: "0 0 28px" };
const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", fontSize: 14, background: "var(--bg)",
  border: "1px solid var(--line-2)", color: "var(--fg)", borderRadius: 2, outline: "none",
};
const button: React.CSSProperties = {
  width: "100%", padding: "13px 14px", fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
  background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 2,
  cursor: "pointer", fontFamily: "var(--mono, monospace)",
};
const notice: React.CSSProperties = {
  border: "1px solid var(--line-2)", background: "var(--bg)", padding: "20px 18px", borderRadius: 2,
};
