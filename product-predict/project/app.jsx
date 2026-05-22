// App shell — sidebar, top bar, view routing, tweaks
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "lime",
  "agentCount": 24,
  "view": "setup",
  "simMode": "running"
}/*EDITMODE-END*/;

const ACCENTS = {
  lime:   { val: "oklch(0.88 0.18 118)", dim: "oklch(0.88 0.18 118 / 0.15)", label: "石灰" },
  amber:  { val: "oklch(0.82 0.16 75)",  dim: "oklch(0.82 0.16 75 / 0.15)",  label: "琥珀" },
  cyan:   { val: "oklch(0.83 0.13 195)", dim: "oklch(0.83 0.13 195 / 0.15)", label: "青蓝" },
  magenta:{ val: "oklch(0.75 0.22 340)", dim: "oklch(0.75 0.22 340 / 0.15)", label: "品红" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useStateApp(t.view || "setup"); // setup | agents | sim | report
  const [activeRun, setActiveRun] = useStateApp("r-042");

  // Apply accent + theme
  useEffectApp(() => {
    const acc = ACCENTS[t.accent] || ACCENTS.lime;
    document.documentElement.style.setProperty("--accent", acc.val);
    document.documentElement.style.setProperty("--accent-dim", acc.dim);
    document.documentElement.classList.toggle("light", t.theme === "light");
  }, [t.accent, t.theme]);

  // Sync external view tweak
  useEffectApp(() => { if (t.view && t.view !== view) setView(t.view); }, [t.view]);

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar view={view} onView={(v) => { setView(v); setTweak("view", v); }} activeRun={activeRun} setActiveRun={setActiveRun} />

      {/* Main */}
      <main style={{ display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden", position: "relative" }}>
        <TopBar view={view} />
        <div style={{ overflow: "hidden", position: "relative" }} key={view} className="fade-in-up">
          {view === "setup" && <SetupView onStart={() => { setView("agents"); setTweak("view", "agents"); }} />}
          {view === "agents" && <AgentsView agentCount={t.agentCount}
            onBack={() => { setView("setup"); setTweak("view", "setup"); }}
            onStart={() => { setView("sim"); setTweak("view", "sim"); setTweak("simMode", "running"); }} />}
          {view === "sim" && <SimulationView agentCount={t.agentCount} simMode={t.simMode}
            onComplete={() => { setView("report"); setTweak("view", "report"); }} />}
          {view === "report" && <ReportView onRerun={() => { setView("setup"); setTweak("view", "setup"); }} />}
        </div>
      </main>

      <Tweaks t={t} setTweak={setTweak} />
    </div>
  );
}

function Sidebar({ view, onView, activeRun, setActiveRun }) {
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
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.6, marginTop: 3 }}>v0.4 · ari@lumen</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 10px" }}>
        <button onClick={() => onView("setup")} className="mono" style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 10px", fontSize: 11, letterSpacing: 0.4,
          color: view === "setup" ? "var(--accent-fg)" : "var(--fg-1)",
          background: view === "setup" ? "var(--accent)" : "var(--bg-3)",
          textTransform: "uppercase", fontWeight: 600,
        }}>
          {Icon.plus} NEW PREDICT RUN
        </button>
      </div>

      <div style={{ padding: "20px 18px 8px" }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
          Views
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", padding: "0 8px" }}>
        {[
          { id: "setup", label: "Setup", desc: "git → scan" },
          { id: "agents", label: "Agents", desc: "panel config" },
          { id: "sim", label: "Simulation", desc: "live" },
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
        {PAST_RUNS.map((r) => (
          <button key={r.id} onClick={() => setActiveRun(r.id)} style={{
            display: "block", width: "100%", padding: "10px 18px",
            textAlign: "left", borderLeft: activeRun === r.id ? "2px solid var(--accent)" : "2px solid transparent",
            background: activeRun === r.id ? "var(--bg-2)" : "transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Dot color={r.status === "running" ? "var(--accent)" : "var(--good)"} size={5} pulse={r.status === "running"} />
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>#{r.id.split("-")[1]}</span>
              <span style={{ fontSize: 11, color: "var(--fg-1)" }}>{r.name}</span>
              {r.score && <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-2)" }}>{r.score}</span>}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 0.3, paddingLeft: 12 }}>
              {r.branch} · {r.commit} · {r.time}
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 6 }}>USAGE · MAY</div>
        <div style={{ height: 4, background: "var(--bg-3)", marginBottom: 6 }}>
          <div style={{ height: "100%", width: "64%", background: "var(--accent)" }} />
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--fg-2)" }}>1,247 / 2,000 sim-min</div>
      </div>
    </aside>
  );
}

function TopBar({ view }) {
  const titles = {
    setup: { crumb: "Project / pebble-app", title: "New Predict Run" },
    agents: { crumb: "Project / pebble-app / Run #043", title: "Agent Panel" },
    sim: { crumb: "Project / pebble-app / Run #043", title: "Live Simulation" },
    report: { crumb: "Project / pebble-app / Run #043", title: "Feedback Report" },
  };
  const cur = titles[view];
  return (
    <div style={{
      borderBottom: "1px solid var(--line)", padding: "10px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: 0.6 }}>{cur.crumb}</span>
        <span style={{ color: "var(--fg-3)" }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{cur.title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="mono" style={{
          fontSize: 11, color: "var(--fg-2)", display: "flex", alignItems: "center", gap: 6,
          padding: "4px 8px", border: "1px solid var(--line-2)",
        }}>
          {Icon.search}
          <span>跳转…</span>
          <span style={{ color: "var(--fg-3)", marginLeft: 8 }}>⌘K</span>
        </button>
        <div style={{ width: 24, height: 24, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: "var(--accent-fg)" }}>A</div>
      </div>
    </div>
  );
}

/* ------ Tweaks Panel ------ */
function Tweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakRadio label="模式" value={t.theme} options={[{ value: "dark", label: "深色" }, { value: "light", label: "浅色" }]} onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="强调色"
          value={ACCENTS[t.accent]?.val}
          options={Object.entries(ACCENTS).map(([key, v]) => v.val)}
          onChange={(v) => {
            const key = Object.keys(ACCENTS).find(k => ACCENTS[k].val === v) || "lime";
            setTweak("accent", key);
          }} />
      </TweakSection>

      <TweakSection label="Run">
        <TweakSlider label="Agent 数量" value={t.agentCount} min={5} max={120} step={1} onChange={(v) => setTweak("agentCount", v)} />
        <TweakRadio label="模拟阶段" value={t.simMode} options={[{ value: "running", label: "运行中" }, { value: "complete", label: "已完成" }]} onChange={(v) => setTweak("simMode", v)} />
      </TweakSection>

      <TweakSection label="导航">
        <TweakSelect label="视图" value={t.view} options={[
          { value: "setup", label: "01 · Setup" },
          { value: "agents", label: "02 · Agents" },
          { value: "sim", label: "03 · Simulation" },
          { value: "report", label: "04 · Report" },
        ]} onChange={(v) => setTweak("view", v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
