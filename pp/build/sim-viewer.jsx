// Replay view — replaces the prototype's SimulationView so it plays back the
// actual screenshots captured during the run instead of rendering a hardcoded
// "Pebble" mock.  Three columns: activity stream / focused-agent screenshots /
// agent roster + sentiment chart.

function SimulationView({ onComplete }) {
  const meta = window.RUN_META;
  const agents = window.AGENTS || [];
  const activity = window.ACTIVITY || [];

  const firstAgent = agents[0]?.id || null;
  const [focusedAgent, setFocusedAgent] = useStateS(firstAgent);
  const [feedFilter, setFeedFilter] = useStateS("all");
  const [stepIdx, setStepIdx] = useStateS(0);

  const filtered = activity.filter((a) => {
    if (feedFilter === "issues") return a.sentiment < 0;
    if (feedFilter === "delights") return a.sentiment > 0;
    return true;
  });

  const focused = agents.find((a) => a.id === focusedAgent);

  // Build the list of screenshots for the focused agent by walking the events
  // that carry a `shot` (i.e. real screenshots taken during the run).
  const shots = activity
    .filter((e) => e.agent === focusedAgent && e.shot)
    .map((e) => ({ src: e.shot, text: e.text, t: e.t, sentiment: e.sentiment }));

  const totalShots = shots.length;
  const safeIdx = Math.min(stepIdx, Math.max(0, totalShots - 1));
  const curShot = shots[safeIdx];

  React.useEffect(() => { setStepIdx(0); }, [focusedAgent]);

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden" }}>
      {/* Top status bar */}
      <div style={{
        borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
        padding: "14px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dot color="var(--good)" size={8} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--fg-1)" }}>
            {meta?.id || "—"} · 已完成 · 回放
          </span>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          <SimMetric label="AGENTS" value={agents.length} />
          <SimMetric label="EVENTS" value={activity.length} />
          <SimMetric label="ISSUES" value={activity.filter((e) => e.sentiment < 0).length} accent />
          <SimMetric label="DELIGHTS" value={activity.filter((e) => e.sentiment > 0).length} />
          <SimMetric label="COST" value={`$${meta?.cost?.usd?.toFixed(2) ?? "0.00"}`} />
        </div>

        <Btn variant="primary" onClick={onComplete} icon={Icon.arrow}>查看报告</Btn>
      </div>

      {/* Three column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 320px", overflow: "hidden" }}>

        {/* Activity feed */}
        <div style={{ borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{
            padding: "12px 20px", borderBottom: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              Activity Stream
            </div>
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--line-2)" }}>
              {["all", "issues", "delights"].map((f) => (
                <button key={f} onClick={() => setFeedFilter(f)} className="mono" style={{
                  fontSize: 10, padding: "3px 8px", letterSpacing: 0.6, textTransform: "uppercase",
                  background: feedFilter === f ? "var(--bg-3)" : "transparent",
                  color: feedFilter === f ? "var(--fg)" : "var(--fg-3)",
                  borderRight: f !== "delights" ? "1px solid var(--line-2)" : "0",
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 12 }}>
                没有事件。
              </div>
            )}
            {filtered.map((a, i) => {
              const ag = agents.find((x) => x.id === a.agent);
              const isFocused = focusedAgent === a.agent;
              return (
                <div key={`${a.t}-${i}`}
                  onClick={() => setFocusedAgent(a.agent)}
                  style={{
                    padding: "11px 20px", borderBottom: "1px solid var(--line)",
                    display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 12, alignItems: "flex-start",
                    cursor: "pointer",
                    background: isFocused ? "var(--bg-2)" : "transparent",
                  }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", paddingTop: 4 }}>{a.t}</span>
                  <AgentAvatar agent={ag} size={20} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--fg-1)" }}>
                      <span style={{ fontWeight: 500 }}>{ag ? ag.name.split(" ")[0] : a.agent}</span>
                      <span style={{ color: "var(--fg-2)" }}> · </span>
                      <span>{a.text}</span>
                    </div>
                    <div className="mono" style={{ marginTop: 4, fontSize: 9, color: sentColor(a.sentiment), letterSpacing: 0.4, textTransform: "uppercase" }}>
                      {a.kind} · sentiment {a.sentiment > 0 ? "+" : ""}{a.sentiment}
                    </div>
                  </div>
                  <Dot color={sentColor(a.sentiment)} size={5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center — screenshot of focused agent */}
        <div style={{ borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-1)" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              POV · {focused?.name || "—"}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>
              {totalShots > 0 ? `step ${safeIdx + 1} / ${totalShots}` : "no shots"}
            </div>
          </div>

          <div style={{ flex: 1, padding: 20, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
            {curShot ? (
              <img src={curShot.src} alt={curShot.text}
                style={{ maxWidth: "100%", maxHeight: "100%", border: "1px solid var(--line-2)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }} />
            ) : (
              <div style={{ color: "var(--fg-3)", fontSize: 13 }}>这位 agent 没有截图记录。</div>
            )}
          </div>

          {totalShots > 0 && (
            <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <button onClick={() => setStepIdx(Math.max(0, safeIdx - 1))} className="mono" style={{
                  fontSize: 11, color: "var(--fg-2)", padding: "4px 10px", border: "1px solid var(--line-2)",
                }}>← 上一步</button>
                <button onClick={() => setStepIdx(Math.min(totalShots - 1, safeIdx + 1))} className="mono" style={{
                  fontSize: 11, color: "var(--fg-2)", padding: "4px 10px", border: "1px solid var(--line-2)",
                }}>下一步 →</button>
                <input type="range" min={0} max={totalShots - 1} value={safeIdx}
                  onChange={(e) => setStepIdx(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "oklch(0.88 0.18 118)" }} />
              </div>
              {curShot && (
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-1)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--fg-3)" }}>{curShot.t}</span> · {curShot.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — agent roster + sentiment */}
        <aside style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
          <Section label="Agents · 状态">
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              {agents.map((a) => {
                const aCrashed = a.crashed;
                const aTrunc = a.truncated;
                const label = aCrashed ? "崩溃" : aTrunc ? "超步" : "已完成";
                const color = aCrashed ? "var(--danger)" : aTrunc ? "var(--warn)" : "var(--good)";
                return (
                  <div key={a.id} onClick={() => setFocusedAgent(a.id)}
                    style={{
                      padding: "10px 20px", borderBottom: "1px solid var(--line)",
                      display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center",
                      cursor: "pointer",
                      background: focusedAgent === a.id ? "var(--bg-2)" : "transparent",
                    }}>
                    <AgentAvatar agent={a} size={22} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.2 }}>{a.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.6 }}>
                        {label}
                      </div>
                    </div>
                    <Dot color={color} size={6} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section label="Sentiment Curve">
            <div style={{ padding: "16px 20px" }}>
              <SentimentCurve points={window.SENTIMENT_CURVE || []} />
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function SimMetric({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4 }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, color: accent ? "var(--accent)" : "var(--fg)", letterSpacing: -0.3, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SentimentCurve({ points }) {
  const W = 280, H = 100;
  if (!points.length) {
    return <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>暂无数据</div>;
  }
  const tMax = points[points.length - 1].t || 100;
  const path = points
    .map((p, i) => {
      const x = (p.t / tMax) * W;
      const y = H - p.v * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fillPath = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H + 14} style={{ display: "block" }}>
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1="0" x2={W} y1={H - g * H} y2={H - g * H} stroke="var(--line)" strokeWidth="0.5" />
      ))}
      <line x1="0" x2={W} y1={H * 0.5} y2={H * 0.5} stroke="var(--line-2)" strokeDasharray="2,3" strokeWidth="0.5" />
      <path d={fillPath} fill="var(--accent-dim)" />
      <path d={path} stroke="var(--accent)" fill="none" strokeWidth="1.5" />
    </svg>
  );
}

Object.assign(window, { SimulationView });
