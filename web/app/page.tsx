"use client";

import { useState } from "react";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Hero />
      <HowItWorks />
      <Install />
      <DemoCard />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header
      style={{
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Logo />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Product Predict</div>
          <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.6 }}>
            v0.5 · local CLI · public demo
          </div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--fg-2)" }}>
        <a href="#how">how it works</a>
        <a href="#install">install</a>
        <a href="/demo">demo report</a>
        <a href="https://github.com/sunrf-renlab-ai/product-predict" target="_blank" rel="noreferrer">
          github
        </a>
        <a href="/login">sign in</a>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        background: "var(--fg)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 10, height: 10, background: "var(--bg)" }} />
      <div
        style={{
          position: "absolute",
          top: -3,
          right: -3,
          width: 7,
          height: 7,
          background: "var(--accent)",
        }}
      />
    </div>
  );
}

function Hero() {
  return (
    <section
      style={{
        padding: "96px 32px 64px",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        className="mono fade-in-up"
        style={{
          fontSize: 10,
          letterSpacing: 1.6,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        User Experience Simulation · not a test runner
      </div>
      <h1
        className="fade-in-up"
        style={{
          fontSize: 64,
          lineHeight: 1.02,
          letterSpacing: -2,
          margin: "0 0 24px",
          fontWeight: 400,
          textWrap: "balance",
        }}
      >
        Find out how <span className="serif" style={{ fontStyle: "italic" }}>strangers</span> feel
        <br />
        about your product <span style={{ color: "var(--accent)" }}>before they meet it</span>.
      </h1>
      <p
        className="fade-in-up"
        style={{
          animationDelay: "0.1s",
          fontSize: 17,
          color: "var(--fg-2)",
          maxWidth: 620,
          lineHeight: 1.55,
          marginBottom: 36,
        }}
      >
        Product Predict generates a population of synthetic users tailored to your product —
        each with their own preferences, prior tools, and competitor experience — and lets
        them use it in a real browser. They quit when a real user would quit. You get back
        not a bug list, but{" "}
        <span style={{ color: "var(--fg-1)" }}>
          how that population <em className="serif">felt</em> about your product
        </span>
        : the design issues, the misalignments, the it-doesn't-fit-this-kind-of-person you
        couldn't see yourself.
      </p>
      <div className="fade-in-up" style={{ animationDelay: "0.2s", display: "flex", gap: 12 }}>
        <a
          href="#install"
          className="mono"
          style={{
            padding: "12px 20px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.4,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          → install pp
        </a>
        <a
          href="/demo"
          className="mono"
          style={{
            padding: "12px 20px",
            border: "1px solid var(--line-2)",
            fontSize: 13,
            letterSpacing: 0.4,
            color: "var(--fg-1)",
          }}
        >
          see a real report
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "AI generates the population",
      d: "Given a one-liner about your product, pp produces 5-10 personas with preferences, prior tools (incl. competitors), and weights summing to a realistic distribution. Edit them as JSON. Or derive them from real beta data — docs + audio.",
    },
    {
      n: "02",
      t: "Each one uses it in a real browser",
      d: "Headless Chromium, your target URL. Every persona has their own context, their own POV, their own patience. They explore what they care about. They skip what bores them. They quit when satisfied — or frustrated, or just curious-out.",
    },
    {
      n: "03",
      t: "You get a feelings report",
      d: "Not a bug list — observations like ‘the navigation rhythm is off for someone coming from Asana’ or ‘the empty state doesn't sell the product to a non-technical user.’ With evidence: real screenshots, the agent's own words, where they hesitated.",
    },
  ];
  return (
    <section
      id="how"
      style={{
        padding: "64px 32px",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: 1.6,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        How it works
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={s.n}
            style={{ background: "var(--bg-1)", padding: "28px 28px 32px", animationDelay: `${i * 0.1}s` }}
            className="fade-in-up"
          >
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--accent)",
                letterSpacing: 1.4,
                marginBottom: 12,
              }}
            >
              {s.n}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, letterSpacing: -0.2 }}>
              {s.t}
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.55 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Install() {
  return (
    <section
      id="install"
      style={{
        padding: "64px 32px",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: 1.6,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        Install · no signup, no API key
      </div>
      <h2
        style={{
          fontSize: 36,
          letterSpacing: -0.8,
          margin: "0 0 24px",
          fontWeight: 400,
        }}
      >
        One command. Zero config.
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--fg-2)",
          maxWidth: 620,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        pp is a local CLI. Reports stay on your laptop. The simulation pool runs on our
        side — you get a free quota by virtue of having the binary installed.
        No accounts, no tokens.
      </p>
      <InstallBlock />
      <div style={{ height: 16 }} />
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--fg-3)",
          lineHeight: 1.8,
          marginBottom: 24,
        }}
      >
        · Clones to <span style={{ color: "var(--fg-1)" }}>~/.pp/src</span>, symlinks <span style={{ color: "var(--fg-1)" }}>pp</span> into <span style={{ color: "var(--fg-1)" }}>~/.local/bin</span><br />
        · Playwright + Chromium auto-downloaded on first install (~150 MB, one-time)<br />
        · Re-run anytime to upgrade — it git-pulls the latest<br />
        · Requires <span style={{ color: "var(--fg-1)" }}>git</span>, <span style={{ color: "var(--fg-1)" }}>node ≥ 20</span>, <span style={{ color: "var(--fg-1)" }}>npm</span>
      </div>

      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--line-2)",
          padding: "16px 20px",
          maxWidth: 720,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--fg-3)",
            letterSpacing: 1.2,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          first run
        </div>
        <pre
          className="mono"
          style={{
            margin: 0,
            fontSize: 12.5,
            color: "var(--fg-1)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          <span style={{ color: "var(--accent)" }}>$</span> pp run <span style={{ color: "var(--fg-3)" }}>https://your-app.com</span> --hint <span style={{ color: "var(--fg-3)" }}>"team todo app"</span>
        </pre>
        <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 8, lineHeight: 1.7 }}>
          AI generates ~6 personas tailored to that description, drives them through your URL in real Chromium, writes <span style={{ color: "var(--fg-1)" }}>./runs/run-001/report.html</span>. ~3 min.
        </div>
      </div>
    </section>
  );
}

const INSTALL_CMD = "curl -fsSL https://product-predict.vercel.app/install | sh";

function InstallBlock() {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — fallback would be select-all but most modern browsers grant
      // clipboard permission to https origins by default.
    }
  };
  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--accent)",
        padding: "20px 24px",
        maxWidth: 720,
        marginBottom: 16,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 9,
          color: "var(--accent)",
          letterSpacing: 1.2,
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        install — one line
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <code
          className="mono"
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: "var(--fg)",
            lineHeight: 1.5,
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: "var(--accent)" }}>$</span> {INSTALL_CMD}
        </code>
        <button
          onClick={onCopy}
          aria-label="copy install command"
          className="mono"
          style={{
            flexShrink: 0,
            padding: "6px 12px",
            fontSize: 10,
            letterSpacing: 0.6,
            background: copied ? "var(--accent)" : "transparent",
            color: copied ? "var(--accent-fg)" : "var(--accent)",
            border: "1px solid var(--accent)",
            borderRadius: 2,
            fontWeight: 600,
            transition: "background .15s ease, color .15s ease",
            cursor: "pointer",
          }}
        >
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
    </div>
  );
}

function DemoCard() {
  return (
    <section
      style={{
        padding: "64px 32px",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: 1.6,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        See a sample report
      </div>
      <div
        style={{
          border: "1px solid var(--line-2)",
          background: "var(--bg-1)",
          padding: "32px 32px 36px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 20, marginBottom: 8, letterSpacing: -0.2 }}>
            Cadence · async standups for distributed teams
          </div>
          <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6, marginBottom: 12 }}>
            6 personas — PM, eng lead, designer, project manager, ops, solo founder. <span style={{ color: "var(--fg-1)" }}>2 accomplished · 2 frustrated · 1 explored · 1 gave up.</span> The report surfaces 9 functional-design observations: PDF export missing, template field types not editable, Slack only single-workspace, i18n at 60%, onboarding too heavy for 4-person teams… plus 5 delights (Cmd+K, per-person timezones, spring animations).
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--fg-3)",
              letterSpacing: 0.6,
            }}
          >
            Lei Wang (Asana 5y user, PjM): "Export is buried three levels deep under Settings → Reports, and there's no PDF. Is my boss expecting me to convert it myself?"
          </div>
        </div>
        <a
          href="/demo"
          className="mono"
          style={{
            padding: "14px 22px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.4,
            flexShrink: 0,
          }}
        >
          OPEN REPORT →
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "40px 32px",
        borderTop: "1px solid var(--line)",
        color: "var(--fg-3)",
        fontSize: 12,
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div className="mono" style={{ letterSpacing: 0.3 }}>
        Product Predict · built by sunrf-renlab-ai · MIT
      </div>
      <div className="mono" style={{ letterSpacing: 0.3 }}>
        <a href="https://github.com/sunrf-renlab-ai/product-predict">github</a>
        {"  ·  "}
        <a href="/demo">demo</a>
      </div>
    </footer>
  );
}
