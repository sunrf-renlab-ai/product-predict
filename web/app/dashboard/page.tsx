"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [cliToken, setCliToken] = useState("");
  const [loading, setLoading] = useState(true);

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

          <div style={label}>CLI token</div>
          <div style={{ ...tokenBox, display: "flex", alignItems: "center", gap: 12 }}>
            <code style={{ flex: 1, minWidth: 0, maxHeight: 66, overflow: "auto", fontFamily: "var(--mono, monospace)", fontSize: 11, wordBreak: "break-all", color: "var(--fg-1)", lineHeight: 1.5 }}>
              {cliToken}
            </code>
            <CopyButton value={cliToken} />
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={label}>Install</div>
            <CmdBox value="curl -sSL https://product-predict.renlab.ai/install.sh | sh" />
            <div style={{ ...label, marginTop: 14 }}>Authenticate</div>
            <CmdBox value="pp login" />
            <div style={{ ...label, marginTop: 14 }}>Run</div>
            <CmdBox value="pp run http://localhost:3000" />
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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const onCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };
  return (
    <button
      onClick={onCopy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="copy to clipboard"
      title="Copy"
      style={{
        flexShrink: 0,
        padding: "4px 9px",
        fontSize: 10,
        letterSpacing: 0.6,
        fontFamily: "var(--mono, monospace)",
        background: "transparent",
        color: copied ? "var(--fg-1)" : hover ? "var(--fg-2)" : "var(--fg-3)",
        border: "1px solid var(--line-2)",
        borderRadius: 2,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "color .15s ease, border-color .15s ease",
      }}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function CmdBox({ value }: { value: string }) {
  return (
    <div style={cmdBox}>
      <code
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: "var(--mono, monospace)",
          fontSize: 12,
          color: "var(--fg-1)",
          whiteSpace: "pre",
          overflowX: "auto",
        }}
      >
        {value}
      </code>
      <CopyButton value={value} />
    </div>
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
  border: "1px solid var(--line-2)", background: "var(--bg)", padding: "8px 10px 8px 12px",
  borderRadius: 2,
};
const ghostBtn: React.CSSProperties = {
  padding: "8px 14px", fontSize: 11, letterSpacing: 0.5, background: "transparent",
  color: "var(--fg-2)", border: "1px solid var(--line-2)", borderRadius: 2, cursor: "pointer",
  fontFamily: "var(--mono, monospace)",
};
const cmdBox: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12,
  background: "var(--bg)", border: "1px solid var(--line)",
  padding: "8px 10px 8px 12px", borderRadius: 2, margin: 0,
};
