// Live Simulation View — the hero of the prototype
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

function SimulationView({ onComplete, simMode, agentCount }) {
  const [elapsed, setElapsed] = useStateS(0); // seconds in sim time
  const [playing, setPlaying] = useStateS(simMode !== "complete");
  const [feedFilter, setFeedFilter] = useStateS("all");
  const [focusedAgent, setFocusedAgent] = useStateS("a04");
  const feedRef = useRefS(null);

  const totalDuration = 180; // 3 minutes
  const progress = simMode === "complete" ? 1 : Math.min(elapsed / totalDuration, 1);

  useEffectS(() => {
    if (!playing || simMode === "complete") return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e >= totalDuration) { setPlaying(false); return totalDuration; }
        return e + 1;
      });
    }, 280); // 1 sim-sec per 280ms real
    return () => clearInterval(id);
  }, [playing, simMode]);

  // Visible activity = up to the current simulated time
  const simCutoff = simMode === "complete" ? Infinity : elapsed;
  const visible = ACTIVITY.filter((a) => {
    const [h, m, s] = a.t.split(":").map(Number);
    const total = h * 3600 + m * 60 + s;
    if (total > simCutoff) return false;
    if (feedFilter === "issues") return a.sentiment < 0;
    if (feedFilter === "delights") return a.sentiment > 0;
    return true;
  }).slice().reverse();

  useEffectS(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [visible.length]);

  const stats = {
    active: simMode === "complete" ? 0 : Math.min(8, Math.max(1, Math.floor(progress * 12) + 1)),
    done: simMode === "complete" ? agentCount : Math.floor(progress * agentCount),
    queued: simMode === "complete" ? 0 : agentCount - Math.floor(progress * agentCount) - Math.min(8, Math.floor(progress * 12) + 1),
    events: visible.length === 0 ? 0 : ACTIVITY.length - ACTIVITY.indexOf(ACTIVITY.find(a => visible.find(v => v.t === a.t))),
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden" }}>
      {/* Top status bar */}
      <div style={{
        borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
        padding: "14px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 32, alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {simMode !== "complete" && playing && <Dot color="var(--accent)" pulse size={8} />}
          {simMode === "complete" && <Dot color="var(--good)" size={8} />}
          {!playing && simMode !== "complete" && <Dot color="var(--warn)" size={8} />}
          <span className="mono" style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--fg-1)" }}>
            {simMode === "complete" ? "Run #043 · 完成" : playing ? "Run #043 · 模拟中" : "Run #043 · 已暂停"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          <Metric label="TIME" value={fmtTime(simMode === "complete" ? totalDuration : elapsed)} mono />
          <Metric label="ACTIVE" value={stats.active} accent={stats.active > 0} />
          <Metric label="QUEUED" value={stats.queued} />
          <Metric label="DONE" value={`${stats.done}/${agentCount}`} />
          <Metric label="EVENTS" value={visible.length === 0 ? 0 : Math.min(ACTIVITY.length, Math.floor(progress * 184))} />
          <Metric label="ISSUES" value={visible.filter(v => v.sentiment < 0).length} accent />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={() => setPlaying((p) => !p)} icon={playing ? Icon.pause : Icon.play} disabled={simMode === "complete"}>
            {playing ? "暂停" : "继续"}
          </Btn>
          <Btn variant={simMode === "complete" ? "primary" : "ghost"} onClick={onComplete} icon={Icon.arrow}>
            查看报告
          </Btn>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, height: 2, background: "var(--line)", zIndex: 2 }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: "var(--accent)",
          transition: "width 0.3s linear",
        }} />
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

          <div ref={feedRef} style={{ flex: 1, overflow: "auto" }}>
            {visible.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 12 }}>
                <div className="shimmer" style={{ height: 1, marginBottom: 16 }} />
                等待 agent 启动…
              </div>
            )}
            {visible.map((a, i) => {
              const agent = AGENTS.find((x) => x.id === a.agent);
              const isFocused = focusedAgent === a.agent;
              return (
                <div key={`${a.t}-${i}`}
                  onClick={() => setFocusedAgent(a.agent)}
                  className="slide-in"
                  style={{
                    padding: "11px 20px", borderBottom: "1px solid var(--line)",
                    display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 12, alignItems: "flex-start",
                    cursor: "pointer",
                    background: isFocused ? "var(--bg-2)" : "transparent",
                    animationDelay: `${Math.min(i * 0.04, 0.4)}s`,
                  }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", paddingTop: 4 }}>{a.t}</span>
                  <AgentAvatar agent={agent} size={20} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--fg-1)" }}>
                      <span style={{ fontWeight: 500 }}>{agent.name.split(" ")[0]}</span>
                      <span style={{ color: "var(--fg-2)" }}> · </span>
                      <span>{a.text}</span>
                    </div>
                    <div className="mono" style={{ marginTop: 4, fontSize: 9, color: sentColor(a.sentiment), letterSpacing: 0.4, textTransform: "uppercase" }}>
                      {kindLabel(a.kind)} · sentiment {a.sentiment > 0 ? "+" : ""}{a.sentiment}
                    </div>
                  </div>
                  <Dot color={sentColor(a.sentiment)} size={5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center — Product POV */}
        <div style={{ borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-1)" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              POV · {AGENTS.find(a => a.id === focusedAgent)?.name}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>
              chrome 124 · 1440×900
            </div>
          </div>

          <div style={{ flex: 1, padding: 24, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
            <PebblePreview agent={AGENTS.find(a => a.id === focusedAgent)} progress={progress} />
          </div>
        </div>

        {/* Right — Agent roster + sentiment */}
        <aside style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
          <Section label="Agents · 实时状态">
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              {AGENTS.slice(0, Math.min(agentCount, 12)).map((a, i) => {
                const phase = agentPhase(a.id, progress, simMode);
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
                        {phase.label}
                      </div>
                    </div>
                    <Dot color={phase.color} size={6} pulse={phase.status === "active"} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section label="Sentiment · 0–3 min">
            <div style={{ padding: "16px 20px" }}>
              <SentimentChart progress={progress} simMode={simMode} />
            </div>
          </Section>

          {agentCount > 12 && (
            <div style={{ padding: "12px 20px", color: "var(--fg-3)", fontSize: 11, borderTop: "1px solid var(--line)" }}>
              <span className="mono">+ {agentCount - 12} 位 agent 在后台运行</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, accent, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4 }}>{label}</span>
      <span className={mono ? "mono" : "mono"} style={{
        fontSize: 13, color: accent ? "var(--accent)" : "var(--fg)", letterSpacing: -0.3, fontWeight: 500,
      }}>{value}</span>
    </div>
  );
}

function kindLabel(k) {
  return { enter: "ENTER", click: "CLICK", shortcut: "SHORTCUT", confused: "CONFUSED",
    delight: "DELIGHT", note: "OBSERVATION", search: "SEARCH", rage: "RAGE", exit: "EXIT" }[k] || k.toUpperCase();
}

function agentPhase(id, progress, simMode) {
  // Deterministic pseudo phase based on agent index and progress
  const idx = AGENTS.findIndex(a => a.id === id);
  if (simMode === "complete") return { label: "已完成", status: "done", color: "var(--good)" };
  const start = (idx * 0.05) % 1;
  const end = Math.min(start + 0.5, 1);
  if (progress < start) return { label: "排队中", status: "queued", color: "var(--fg-3)" };
  if (progress > end) return { label: "已完成", status: "done", color: "var(--good)" };
  const phases = ["登录", "探索", "创建任务", "通知设置", "邀请协作", "导出数据", "退出"];
  return {
    label: phases[Math.floor(((progress - start) / (end - start)) * phases.length)] || "运行中",
    status: "active",
    color: "var(--accent)",
  };
}

/* The fake "Pebble" product being tested — agent's POV */
function PebblePreview({ agent, progress }) {
  // Simulate a cursor moving and a "thought" bubble
  const thoughts = {
    a04: "「创建第一个任务」按钮在哪？",
    a02: "Cmd+K… 还是不行。",
    a03: "这个圆角不对劲。",
    a09: "好顺的拖拽。",
    a05: "键盘把输入框遮住了。",
    a11: "导出 CSV 在哪？",
    a01: "整体节奏不错。",
    a06: "Tab → Enter，行云流水。",
    a07: "邮件摘要开关怎么这么深？",
    a08: "权限就两档？",
    a10: "批量粘贴邮箱很爽。",
    a12: "模板太少了。",
  };

  return (
    <div style={{
      width: 620, maxWidth: "100%", aspectRatio: "16/10",
      background: "#1a1a17", border: "1px solid var(--line-2)",
      position: "relative", overflow: "hidden",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
    }}>
      {/* Browser chrome */}
      <div style={{ height: 22, background: "#0f0f0d", display: "flex", alignItems: "center", padding: "0 8px", gap: 4, borderBottom: "1px solid #2a2a26" }}>
        {[0,1,2].map((i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a2a26" }} />)}
        <div className="mono" style={{ marginLeft: 12, fontSize: 9, color: "#56544c" }}>pebble.app/today</div>
      </div>

      {/* App layout */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", height: "calc(100% - 22px)" }}>
        {/* Sidebar */}
        <div style={{ background: "#13130f", borderRight: "1px solid #2a2a26", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="mono" style={{ fontSize: 9, color: "#56544c", letterSpacing: 0.6, marginBottom: 6 }}>PEBBLE</div>
          {["Inbox", "Today", "Upcoming", "Projects", "Tags"].map((item, i) => (
            <div key={item} style={{
              padding: "5px 8px", fontSize: 11,
              background: i === 1 ? "#252521" : "transparent",
              color: i === 1 ? "#f0ede3" : "#8a877d",
            }}>{item}</div>
          ))}
        </div>

        {/* Main pane */}
        <div style={{ padding: "14px 18px", position: "relative" }}>
          <div style={{ fontSize: 16, color: "#f0ede3", marginBottom: 12 }}>Today</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { t: "审核 PR #421", done: false },
              { t: "对齐周一 standup 议程", done: true },
              { t: "回 Lars 的合同邮件", done: false },
              { t: "Pebble onboarding 第二轮迭代", done: false, focus: true },
            ].map((task, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px", background: "#1f1f1c",
                border: task.focus ? "1px solid oklch(0.88 0.18 118)" : "1px solid transparent",
              }}>
                <div style={{ width: 11, height: 11, border: "1px solid #56544c", background: task.done ? "#56544c" : "transparent" }} />
                <span style={{ fontSize: 11, color: task.done ? "#56544c" : "#d4d0c4", textDecoration: task.done ? "line-through" : "none" }}>{task.t}</span>
              </div>
            ))}
          </div>

          {/* Floating cursor with thought */}
          <div style={{
            position: "absolute",
            left: `${20 + ((progress * 80) % 70)}%`,
            top: `${30 + ((progress * 100) % 50)}%`,
            transition: "all 0.6s ease",
            pointerEvents: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>
              <path d="M1 1 L1 11 L4 8 L6 12 L8 11 L6 7 L11 7 Z" fill={agent.color} stroke="#0d0d0c" strokeWidth="0.8"/>
            </svg>
            <div style={{
              marginTop: 4, marginLeft: 12,
              background: agent.color, color: "#0d0d0c",
              fontSize: 10, padding: "3px 7px",
              fontWeight: 500, whiteSpace: "nowrap",
              fontFamily: "Geist, sans-serif",
            }}>{thoughts[agent.id] || agent.name + " 正在探索…"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentChart({ progress, simMode }) {
  const W = 280, H = 100;
  const cutoff = simMode === "complete" ? 100 : progress * 100;
  const path = SENTIMENT_CURVE.filter(p => p.t <= cutoff).map((p, i) => {
    const x = (p.t / 100) * W;
    const y = H - (p.v * H);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const fillPath = path ? `${path} L${(cutoff / 100 * W).toFixed(1)},${H} L0,${H} Z` : "";

  return (
    <svg width={W} height={H + 14} style={{ display: "block" }}>
      {/* Grid */}
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1="0" x2={W} y1={H - g * H} y2={H - g * H} stroke="var(--line)" strokeWidth="0.5" />
      ))}
      {/* Threshold */}
      <line x1="0" x2={W} y1={H * 0.5} y2={H * 0.5} stroke="var(--line-2)" strokeDasharray="2,3" strokeWidth="0.5" />

      {fillPath && <path d={fillPath} fill="var(--accent-dim)" />}
      {path && <path d={path} stroke="var(--accent)" fill="none" strokeWidth="1.5" />}

      {/* Annotations */}
      {[{ x: 15, label: "空白页" }, { x: 47, label: "找通知" }, { x: 85, label: "邀请协作" }].map((a) => (
        <g key={a.x}>
          <line x1={a.x / 100 * W} x2={a.x / 100 * W} y1={H} y2={H + 4} stroke="var(--fg-3)" strokeWidth="0.5" />
          <text x={a.x / 100 * W} y={H + 12} fontSize="8" fill="var(--fg-3)" fontFamily="JetBrains Mono" textAnchor="middle">{a.label}</text>
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { SimulationView });
