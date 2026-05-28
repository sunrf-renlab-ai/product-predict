"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [cliToken, setCliToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        window.location.replace("/login");
        return;
      }
      setEmail(session.user.email ?? null);
      // The CLI token is the refresh token — long-lived, lets the CLI mint
      // fresh access tokens for /api/sim without re-login.
      setCliToken(session.refresh_token);
      setLoading(false);
    });
  }, []);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.replace("/login");
  }

  function copyToken() {
    navigator.clipboard.writeText(cliToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="mono" style={{ fontSize: 13, color: "var(--fg-2)" }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 6 }}>
              Product Predict
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 400, letterSpacing: -0.4, margin: 0 }}>Your account</h1>
          </div>
          <button onClick={signOut} style={ghostBtn}>SIGN OUT</button>
        </div>

        <div style={row}>
          <div style={label}>Signed in as</div>
          <div style={{ fontSize: 15 }}>{email}</div>
        </div>

        <div style={{ ...panel, marginTop: 28 }}>
          <div style={{ fontSize: 16, marginBottom: 6 }}>Connect the CLI</div>
          <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.65, margin: "0 0 18px" }}>
            Install pp, then run <code style={code}>pp login</code> and paste the token below when prompted.
            After that, <code style={code}>pp run</code> uses our simulation backend — no API keys to manage.
          </p>

          <div style={tokenBox}>
            <code style={{ fontSize: 11, wordBreak: "break-all", color: "var(--fg-1)", lineHeight: 1.5 }}>
              {cliToken}
            </code>
          </div>
          <button onClick={copyToken} style={{ ...copyBtn, background: copied ? "var(--good, #7fb069)" : "var(--accent)" }}>
            {copied ? "✓ COPIED" : "COPY CLI TOKEN"}
          </button>

          <div style={{ marginTop: 22 }}>
            <div style={label}>Install</div>
            <pre style={pre}>curl -sSL https://product-predict.renlab.ai/install.sh | sh</pre>
            <div style={{ ...label, marginTop: 14 }}>Authenticate</div>
            <pre style={pre}>pp login</pre>
            <div style={{ ...label, marginTop: 14 }}>Run</div>
            <pre style={pre}>pp run http://localhost:3000</pre>
          </div>
        </div>

        <div style={{ marginTop: 28, fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--mono, monospace)" }}>
          <a href="/" style={{ color: "inherit", borderBottom: "1px dashed var(--line-2)" }}>← home</a>
          {"   ·   "}
          <a href="/demo" style={{ color: "inherit", borderBottom: "1px dashed var(--line-2)" }}>demo report</a>
        </div>
      </div>
    </main>
  );
}

const row: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", border: "1px solid var(--line)", background: "var(--bg-1)", borderRadius: 2,
};
const label: React.CSSProperties = {
  fontFamily: "var(--mono, monospace)", fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)",
  textTransform: "uppercase", marginBottom: 8,
};
const panel: React.CSSProperties = {
  border: "1px solid var(--line)", background: "var(--bg-1)", padding: "26px 24px", borderRadius: 2,
};
const code: React.CSSProperties = {
  fontFamily: "var(--mono, monospace)", fontSize: 12, color: "var(--accent)",
  background: "var(--bg)", padding: "1px 5px", borderRadius: 2,
};
const tokenBox: React.CSSProperties = {
  border: "1px solid var(--line-2)", background: "var(--bg)", padding: "12px 14px",
  borderRadius: 2, maxHeight: 90, overflow: "auto",
};
const copyBtn: React.CSSProperties = {
  marginTop: 12, padding: "10px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
  color: "var(--accent-fg)", border: "none", borderRadius: 2, cursor: "pointer",
  fontFamily: "var(--mono, monospace)",
};
const ghostBtn: React.CSSProperties = {
  padding: "8px 14px", fontSize: 11, letterSpacing: 0.5, background: "transparent",
  color: "var(--fg-2)", border: "1px solid var(--line-2)", borderRadius: 2, cursor: "pointer",
  fontFamily: "var(--mono, monospace)",
};
const pre: React.CSSProperties = {
  fontFamily: "var(--mono, monospace)", fontSize: 12, background: "var(--bg)",
  border: "1px solid var(--line)", padding: "10px 12px", borderRadius: 2, margin: 0,
  color: "var(--fg-1)", overflow: "auto",
};
