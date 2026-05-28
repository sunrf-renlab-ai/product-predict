// /demo just iframes the static report.html — it's a fully self-contained
// React UMD bundle with the run injected at build time. No need to re-render
// it from Next.
export default function Demo() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "8px 16px",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", letterSpacing: 0.4 }}>
          ← <a href="/">product-predict</a> · demo: Cadence · 1,000,000 agents · 9 observations
        </div>
        <a
          href="/demo/report.html"
          target="_blank"
          rel="noreferrer"
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--accent)",
            letterSpacing: 0.6,
            padding: "4px 10px",
            border: "1px solid var(--accent)",
          }}
        >
          OPEN FULL-SCREEN ↗
        </a>
      </div>
      <iframe
        src="/demo/report.html"
        style={{ flex: 1, width: "100%", border: 0 }}
        title="Product Predict — Cadence demo report"
      />
    </div>
  );
}
