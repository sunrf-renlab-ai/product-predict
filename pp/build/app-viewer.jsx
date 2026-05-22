// App shell for the report viewer — same sidebar + topbar as the prototype,
// minus the Tweaks panel.  Default view is "report" because that's what people
// open the viewer to see.
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [view, setView] = useStateApp("report"); // setup | agents | sim | report
  const [activeRun, setActiveRun] = useStateApp(
    window.PAST_RUNS && window.PAST_RUNS.length ? window.PAST_RUNS[0].id : null
  );

  // Lock accent to lime; theme to dark.  No Tweaks panel in the viewer.
  useEffectApp(() => {
    document.documentElement.style.setProperty("--accent", "oklch(0.88 0.18 118)");
    document.documentElement.style.setProperty("--accent-dim", "oklch(0.88 0.18 118 / 0.15)");
    document.documentElement.classList.remove("light");
  }, []);

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden" }}>
      <Sidebar view={view} onView={setView} activeRun={activeRun} setActiveRun={setActiveRun} />
      <main style={{ display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden", position: "relative" }}>
        <TopBar view={view} />
        <div style={{ overflow: "hidden", position: "relative" }} key={view} className="fade-in-up">
          {view === "setup" && <SetupView onStart={() => setView("agents")} />}
          {view === "agents" && <AgentsView agentCount={(window.AGENTS || []).length || 0}
            onBack={() => setView("setup")}
            onStart={() => setView("sim")} />}
          {view === "sim" && <SimulationView agentCount={(window.AGENTS || []).length || 0} simMode="complete"
            onComplete={() => setView("report")} />}
          {view === "report" && <ReportView onRerun={() => setView("setup")} />}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ view, onView, activeRun, setActiveRun }) {
  const meta = window.RUN_META;
  return (
    <aside style={{
      borderRight: "1px solid var(--line)", background: "var(--bg-1)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, background: "var(--fg)", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 9, height: 9, background: "var(--bg)" }} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, background: "var(--accent)" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1 }}>Product Predict</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.6, marginTop: 3 }}>
              {meta ? `${meta.id} · viewer` : "viewer · no run"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 18px 8px" }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
          Views
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", padding: "0 8px" }}>
        {[
          { id: "setup", label: "Setup", desc: "target" },
          { id: "agents", label: "Agents", desc: "panel" },
          { id: "sim", label: "Replay", desc: "events" },
          { id: "report", label: "Report", desc: "findings" },
        ].map((v, i) => (
          <button key={v.id} onClick={() => onView(v.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 10px", textAlign: "left",
            color: view === v.id ? "var(--fg)" : "var(--fg-2)",
            background: view === v.id ? "var(--bg-2)" : "transparent",
            position: "relative",
          }}>
            <span className="mono" style={{ fontSize: 10, color: view === v.id ? "var(--accent)" : "var(--fg-3)", width: 16 }}>0{i + 1}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{v.label}</span>
            <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>{v.desc}</span>
          </button>
        ))}
      </nav>

      <div style={{ padding: "24px 18px 8px" }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
          Recent Runs
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {(window.PAST_RUNS || []).map((r) => (
          <button key={r.id} onClick={() => setActiveRun(r.id)} style={{
            display: "block", width: "100%", padding: "10px 18px",
            textAlign: "left", borderLeft: activeRun === r.id ? "2px solid var(--accent)" : "2px solid transparent",
            background: activeRun === r.id ? "var(--bg-2)" : "transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, minWidth: 0 }}>
              <Dot color="var(--good)" size={5} />
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", flexShrink: 0 }}>#{r.id.split("-")[1] || r.id}</span>
              <span style={{
                fontSize: 11, color: "var(--fg-1)", flex: 1, minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} title={r.name}>{r.name}</span>
              {r.score != null && <span className="mono" style={{ fontSize: 10, color: "var(--fg-2)", flexShrink: 0 }}>{r.score}</span>}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.3, paddingLeft: 12 }}>
              {r.branch} · {r.commit} · {r.time}
            </div>
          </button>
        ))}
      </div>

      {meta && (() => {
        const agentCount = (meta.agents || []).length;
        const eventCount = (meta.activity || []).length;
        const wall = meta.startedAt && meta.finishedAt
          ? Math.max(0, Math.round((new Date(meta.finishedAt).getTime() - new Date(meta.startedAt).getTime()) / 1000))
          : null;
        const exits = (meta.agents || []).reduce((acc, a) => {
          const k = a.exitReason || "unknown";
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        }, {});
        return (
          <>
            <div style={{ padding: "14px 18px 12px", borderTop: "1px solid var(--line)" }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 8 }}>RUN SUMMARY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <SidebarStat k="AGENTS" v={agentCount} />
                <SidebarStat k="EVENTS" v={eventCount} />
                <SidebarStat k="WALL" v={wall != null ? `${wall < 60 ? wall + "s" : Math.floor(wall/60) + ":" + String(wall%60).padStart(2,"0")}` : "—"} />
                <SidebarStat k="ISSUES" v={(meta.issues || []).length} />
              </div>
              {agentCount > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                  {Object.entries(exits).map(([reason, n]) => (
                    <span key={reason} className="mono" style={{
                      fontSize: 9, letterSpacing: 0.4, padding: "2px 6px",
                      background: "var(--bg-3)", color: exitColor(reason),
                    }}>{reason} ×{n}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--line)" }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 6 }}>RUN COST</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--fg-1)" }}>${(meta.cost?.usd || 0).toFixed(2)}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 2 }}>
                {Math.round((meta.cost?.tokensIn || 0) / 1000)}k in · {Math.round((meta.cost?.tokensOut || 0) / 1000)}k out
              </div>
            </div>
          </>
        );
      })()}
    </aside>
  );
}

function SidebarStat({ k, v }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.6 }}>{k}</div>
      <div className="mono" style={{ fontSize: 14, color: "var(--fg-1)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{v}</div>
    </div>
  );
}

function exitColor(reason) {
  return reason === "accomplished" ? "var(--good)"
       : reason === "explored"     ? "var(--fg-2)"
       : reason === "frustrated"   ? "var(--warn)"
       : reason === "timeout"      ? "var(--fg-3)"
       :                              "var(--danger)";
}

function TopBar({ view }) {
  const meta = window.RUN_META;
  // Truncate the project name so long target.title strings don't push the page
  // title off-screen on the right.
  const rawName = meta ? (meta.target.title || meta.target.url) : "—";
  const projectName = rawName.length > 38 ? rawName.slice(0, 37) + "…" : rawName;
  const titles = {
    setup: { crumb: `Project / ${projectName}`, title: "Target" },
    agents: { crumb: `Project / ${projectName} / ${meta?.id || "—"}`, title: "Agent Panel" },
    sim: { crumb: `Project / ${projectName} / ${meta?.id || "—"}`, title: "Replay" },
    report: { crumb: `Project / ${projectName} / ${meta?.id || "—"}`, title: "Feedback Report" },
  };
  const cur = titles[view];
  return (
    <div style={{
      borderBottom: "1px solid var(--line)", padding: "10px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)",
      gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        <span className="mono" style={{
          fontSize: 10, color: "var(--fg-3)", letterSpacing: 0.6,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={cur.crumb}>{cur.crumb}</span>
        <span style={{ color: "var(--fg-3)", flexShrink: 0 }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{cur.title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {meta && (
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>
            {meta.startedAt?.slice(0, 16).replace("T", " ")}
          </span>
        )}
        <div style={{ width: 24, height: 24, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: "var(--accent-fg)" }}>P</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
