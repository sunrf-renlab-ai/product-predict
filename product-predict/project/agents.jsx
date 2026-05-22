// Agent Panel — configure the synthetic users
const { useState: useStateA } = React;

function AgentsView({ onStart, onBack, agentCount }) {
  const visibleAgents = AGENTS.slice(0, Math.min(agentCount, AGENTS.length));
  const [selected, setSelected] = useStateA(visibleAgents.map((a) => a.id));
  const [sourceMode, setSourceMode] = useStateA("preset"); // preset | data | mix
  const [scenario, setScenario] = useStateA("first_session");

  const allIds = visibleAgents.map((a) => a.id);
  const allOn = selected.length === allIds.length;

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
      {/* Main agent grid */}
      <div style={{ overflow: "auto", padding: "32px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>Step 02 · Agent Panel</div>
            <h2 style={{ fontSize: 32, letterSpacing: -0.6, margin: 0, fontWeight: 400 }}>
              挑选要扔进沙盒的 <span style={{ color: "var(--accent)" }}>{selected.length}</span> 位合成用户
            </h2>
          </div>
          <button onClick={() => setSelected(allOn ? [] : allIds)} className="mono" style={{
            fontSize: 11, color: "var(--fg-2)", border: "1px solid var(--line-2)",
            padding: "6px 12px", letterSpacing: 0.4,
          }}>
            {allOn ? "清空选择" : "全选"}
          </button>
        </div>
        <p style={{ color: "var(--fg-2)", fontSize: 13, marginTop: 12, marginBottom: 28, maxWidth: 560 }}>
          每个 agent 有独立的目标、技术熟练度、注意力模型与情绪基线。
          点击卡片切换是否参与；点头像可以预览画像。
        </p>

        {/* Source mode tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid var(--line-2)", width: "fit-content" }}>
          {[
            { id: "preset", label: "人群预设", sub: "12 个画像" },
            { id: "data", label: "从内测数据生成", sub: "需 ≥50 真实用户" },
            { id: "mix", label: "混合", sub: "预设 + 数据" },
          ].map((m) => (
            <button key={m.id} onClick={() => setSourceMode(m.id)} style={{
              padding: "10px 16px", borderRight: "1px solid var(--line-2)",
              background: sourceMode === m.id ? "var(--bg-2)" : "transparent",
              color: sourceMode === m.id ? "var(--fg)" : "var(--fg-2)",
              textAlign: "left",
            }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{m.label}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Agent grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
          {visibleAgents.map((a, i) => {
            const isOn = selected.includes(a.id);
            return (
              <div
                key={a.id}
                onClick={() => setSelected((s) => isOn ? s.filter((x) => x !== a.id) : [...s, a.id])}
                className="fade-in-up"
                style={{
                  background: "var(--bg-1)", padding: "16px 16px 14px",
                  cursor: "pointer", position: "relative",
                  opacity: isOn ? 1 : 0.35,
                  animationDelay: `${i * 0.025}s`,
                  transition: "opacity .15s ease, background .15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <AgentAvatar agent={a} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{a.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>{a.age} · {a.role}</div>
                  </div>
                  <div style={{
                    width: 14, height: 14, border: "1px solid " + (isOn ? "var(--accent)" : "var(--line-2)"),
                    background: isOn ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent-fg)",
                  }}>
                    {isOn && Icon.check}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2 }}>TECH</span>
                  <MiniBar value={a.tech} width={70} />
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 10, minHeight: 32 }}>
                  目标：{a.goal}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.traits.map((tr) => (
                    <span key={tr} className="mono" style={{
                      fontSize: 9, color: "var(--fg-2)", letterSpacing: 0.3,
                      padding: "2px 6px", background: "var(--bg-3)",
                    }}>{tr}</span>
                  ))}
                  <span className="mono" style={{
                    fontSize: 9, color: a.tone === "急躁" || a.tone === "挑剔" ? "var(--warn)" : "var(--fg-2)",
                    padding: "2px 6px", background: "var(--bg-3)",
                  }}>{a.tone}</span>
                </div>
              </div>
            );
          })}

          {/* Add agent placeholder */}
          <div style={{
            background: "var(--bg-1)", padding: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--fg-3)", cursor: "pointer", minHeight: 142,
            border: "1px dashed var(--line-2)", margin: -1,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>+</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: 1.2 }}>定制 AGENT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right config rail */}
      <aside style={{ borderLeft: "1px solid var(--line)", background: "var(--bg-1)", display: "flex", flexDirection: "column" }}>
        <Section label="Scenario · 测试场景">
          <div style={{ padding: "12px 20px" }}>
            {[
              { id: "first_session", label: "首次会话", sub: "登录→空状态→创建第一个任务" },
              { id: "daily_use", label: "日常使用", sub: "多次进出，团队协作" },
              { id: "power_user", label: "高频任务", sub: "100+ 任务的极端场景" },
              { id: "mobile", label: "移动端", sub: "375×667 viewport" },
            ].map((s) => (
              <label key={s.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid var(--line)", cursor: "pointer",
              }}>
                <input type="radio" checked={scenario === s.id} onChange={() => setScenario(s.id)} style={{ accentColor: "oklch(0.88 0.18 118)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>{s.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </Section>

        <Section label="Run Parameters">
          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <ParamRow label="模拟时长" value="每 agent 10 分钟" />
            <ParamRow label="并行实例" value={`${Math.min(8, selected.length)} 个浏览器`} />
            <ParamRow label="情绪基线" value="多样化" />
            <ParamRow label="预估用时" value={`~${Math.ceil(selected.length * 12 / 8)} 秒`} accent />
            <ParamRow label="预估成本" value={`$${(selected.length * 0.18).toFixed(2)}`} />
          </div>
        </Section>

        <div style={{ flex: 1 }} />

        <div style={{ padding: 16, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onBack}>← 返回</Btn>
          <Btn variant="primary" onClick={onStart} icon={Icon.play} style={{ flex: 1, justifyContent: "center" }} disabled={selected.length === 0}>
            启动模拟
          </Btn>
        </div>
      </aside>
    </div>
  );
}

function ParamRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: 1.2, textTransform: "uppercase" }}>{label}</span>
      <span className="mono" style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--fg)" }}>{value}</span>
    </div>
  );
}

Object.assign(window, { AgentsView });
