// Report — synthesized feedback
const { useState: useStateR } = React;

function ReportView({ onRerun }) {
  const [activeIssue, setActiveIssue] = useStateR("i01");
  const [mode, setMode] = useStateR("human"); // human | ai
  const issue = ISSUES.find(i => i.id === activeIssue);
  const agent = AGENTS.find(a => a.id === issue.agentRef);

  if (mode === "ai") return <AIReport onSwitch={() => setMode("human")} />;

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      {/* Mode toggle bar */}
      <div style={{
        borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
        padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
          Report #043 · 两种视图
        </div>
        <div style={{ display: "flex", border: "1px solid var(--line-2)" }}>
          <button onClick={() => setMode("human")} style={{
            padding: "6px 16px", fontSize: 11,
            background: mode === "human" ? "var(--bg-3)" : "transparent",
            color: mode === "human" ? "var(--fg)" : "var(--fg-2)",
            display: "flex", alignItems: "center", gap: 6,
            borderRight: "1px solid var(--line-2)",
          }}>
            <span style={{ fontSize: 13 }}>◐</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 500 }}>给人看</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>叙事 · 引语 · 证据</div>
            </div>
          </button>
          <button onClick={() => setMode("ai")} style={{
            padding: "6px 16px", fontSize: 11,
            background: mode === "ai" ? "var(--bg-3)" : "transparent",
            color: mode === "ai" ? "var(--fg)" : "var(--fg-2)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>◑</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 500 }}>给 AI 看</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>结构化 · 可直接修复</div>
            </div>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "36px 40px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginBottom: 28 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
              Report · Run #043 · pebble-app @ f9c2a1e
            </div>
            <h1 style={{ fontSize: 36, letterSpacing: -0.8, margin: 0, fontWeight: 400, lineHeight: 1.15 }}>
              <span className="serif" style={{ fontStyle: "italic" }}>24 位</span> 合成用户花了 4 小时 17 分用你的产品。
              <br/>这是他们的<span style={{ color: "var(--accent)" }}>未经粉饰</span>的反馈。
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Btn variant="ghost">导出 PDF</Btn>
            <Btn variant="ghost">同步到 Linear</Btn>
            <Btn variant="primary" onClick={onRerun} icon={Icon.arrow}>修复后重跑</Btn>
          </div>
        </div>

        {/* Score row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
          <BigScore label="Predicted NPS" value="−14" delta="可改进至 +28" tone="warn" big />
          <BigScore label="Task Success" value="67%" delta="9 / 24 卡在新建任务" tone="warn" />
          <BigScore label="Time-to-Value" value="3:42" delta="行业基准 1:20" tone="bad" />
          <BigScore label="Rage Clicks" value="11" delta="集中在「同步」按钮" tone="bad" />
          <BigScore label="Delight Moments" value="14" delta="拖拽 + 键盘流" tone="good" />
        </div>
      </div>

      {/* Body: issues + detail */}
      <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 600 }}>
        {/* Issues list */}
        <div style={{ borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              8 个问题 · 按严重度排序
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>HIGH · MED · LOW</span>
          </div>
          {ISSUES.map((iss, idx) => (
            <div key={iss.id} onClick={() => setActiveIssue(iss.id)}
              className="fade-in-up"
              style={{
                padding: "16px 24px", borderBottom: "1px solid var(--line)",
                cursor: "pointer",
                background: activeIssue === iss.id ? "var(--bg-2)" : "transparent",
                borderLeft: activeIssue === iss.id ? "2px solid var(--accent)" : "2px solid transparent",
                animationDelay: `${idx * 0.04}s`,
              }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, background: "var(--bg-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--fg-2)",
                  flexShrink: 0, marginTop: 1,
                }}>{String(idx + 1).padStart(2, "0")}</div>
                <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.45, fontWeight: 500 }}>{iss.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 34 }}>
                <Pill color={sevColor(iss.severity)} style={{ background: `color-mix(in oklch, ${sevColor(iss.severity)} 12%, transparent)` }}>
                  {iss.severity}
                </Pill>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{iss.category}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>· {iss.agents}/{24} agents</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>· {iss.evidence} evidence</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div style={{ padding: "28px 36px", overflow: "auto" }}>
          <div className="fade-in-up" key={activeIssue}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Pill color={sevColor(issue.severity)} style={{ background: `color-mix(in oklch, ${sevColor(issue.severity)} 12%, transparent)` }}>
                {issue.severity} severity
              </Pill>
              <Pill>{issue.category}</Pill>
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>impact · {issue.agents}/{24} agents</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.25, margin: "0 0 24px" }}>{issue.title}</h2>

            {/* Quote */}
            <div style={{
              padding: "20px 24px", background: "var(--bg-1)",
              borderLeft: `2px solid ${agent.color}`, marginBottom: 28,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <AgentAvatar agent={agent} size={26} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{agent.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 1 }}>{agent.age} · {agent.role} · tech {agent.tech}/5</div>
                </div>
              </div>
              <div className="serif" style={{ fontSize: 20, lineHeight: 1.45, color: "var(--fg)", letterSpacing: -0.1 }}>
                <span style={{ color: "var(--fg-3)" }}>“</span>{issue.quote}<span style={{ color: "var(--fg-3)" }}>”</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 12, letterSpacing: 0.4 }}>
                {issue.journey} · 回放 14s 片段 →
              </div>
            </div>

            {/* Evidence */}
            <div style={{ marginBottom: 28 }}>
              <h3 className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase", marginBottom: 12 }}>
                Evidence · 触发该问题的事件链
              </h3>
              <div style={{ border: "1px solid var(--line)", background: "var(--bg-1)" }}>
                {ACTIVITY.filter(a => a.sentiment < 0).slice(0, 4).map((a, i) => {
                  const ag = AGENTS.find(x => x.id === a.agent);
                  return (
                    <div key={i} style={{
                      padding: "10px 14px", borderBottom: i < 3 ? "1px solid var(--line)" : 0,
                      display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 10, alignItems: "center",
                    }}>
                      <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{a.t}</span>
                      <AgentAvatar agent={ag} size={18} />
                      <span style={{ fontSize: 12, color: "var(--fg-1)" }}>{a.text}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>→ 回放</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggested fixes */}
            <div style={{ marginBottom: 28 }}>
              <h3 className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase", marginBottom: 12 }}>
                AI Suggestions · 改动建议
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { effort: "S", text: "在空状态画面添加一个 100×100 的「+ 新任务」CTA，居中。", file: "src/pages/Today.tsx" },
                  { effort: "M", text: "首次访问时弹出 3 步引导，引导用户创建第一个任务。", file: "src/components/Onboarding.tsx · 新建" },
                  { effort: "L", text: "重新设计 onboarding 流程，参考 Linear 的「示例项目」模式。", file: "多文件改动" },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: "12px 16px", border: "1px solid var(--line)", background: "var(--bg-1)",
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
                  }}>
                    <div style={{
                      width: 26, height: 26, background: "var(--bg-3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--accent)", fontWeight: 600,
                    }}>{s.effort}</div>
                    <div>
                      <div style={{ fontSize: 12.5 }}>{s.text}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 4 }}>{s.file}</div>
                    </div>
                    <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }}>开 PR →</Btn>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row — Delights + Heatmap */}
      <div style={{ borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <Section label="Delights · 用户喜欢的">
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {DELIGHTS.map((d) => {
              const ag = AGENTS.find(x => x.id === d.agent);
              return (
                <div key={d.title} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                  <AgentAvatar agent={ag} size={24} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>“{d.quote}”</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Dot color="var(--good)" size={6} />
                    <span className="mono" style={{ fontSize: 11, color: "var(--good)" }}>{d.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section label="Route Heatmap · 路径热度" style={{ borderLeft: "1px solid var(--line)" }}>
          <div style={{ padding: "16px 24px" }}>
            {ROUTES_HEAT.map((r) => (
              <div key={r.path} style={{ marginBottom: 14, display: "grid", gridTemplateColumns: "180px 1fr 60px 60px", gap: 12, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-1)" }}>{r.path}</span>
                <div style={{ height: 10, background: "var(--bg-2)", position: "relative" }}>
                  <div style={{ width: `${(r.visits / 24) * 100}%`, height: "100%", background: "var(--accent)" }} />
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-2)" }}>{r.dwell}s</span>
                <span className="mono" style={{ fontSize: 10, color: r.drop > 0.3 ? "var(--danger)" : "var(--fg-3)" }}>↓{(r.drop * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function BigScore({ label, value, delta, tone, big }) {
  const toneColor = tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--danger)" : "var(--fg)";
  return (
    <div style={{ background: "var(--bg-1)", padding: "18px 22px" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: big ? 42 : 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1, color: toneColor, fontFamily: "Geist", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 8 }}>{delta}</div>
    </div>
  );
}

Object.assign(window, { ReportView });

/* ========== AI-facing Report ========== */
function AIReport({ onSwitch }) {
  const [tab, setTab] = useStateR("patch"); // patch | json | prompt
  const [copied, setCopied] = useStateR(null);
  const copy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  const patchDoc = buildPatchDoc();
  const jsonDoc = buildJsonDoc();
  const promptDoc = buildPromptDoc();

  const cur = { patch: patchDoc, json: jsonDoc, prompt: promptDoc }[tab];

  return (
    <div style={{ height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      {/* Mode toggle bar */}
      <div style={{
        borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
        padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
          Report #043 · 两种视图
        </div>
        <div style={{ display: "flex", border: "1px solid var(--line-2)" }}>
          <button onClick={onSwitch} style={{
            padding: "6px 16px", fontSize: 11, background: "transparent", color: "var(--fg-2)",
            display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid var(--line-2)",
          }}>
            <span style={{ fontSize: 13 }}>◐</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 500 }}>给人看</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>叙事 · 引语 · 证据</div>
            </div>
          </button>
          <button style={{
            padding: "6px 16px", fontSize: 11, background: "var(--bg-3)", color: "var(--fg)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>◑</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 500 }}>给 AI 看</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>结构化 · 可直接修复</div>
            </div>
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "32px 40px 28px", borderBottom: "1px solid var(--line)" }}>
        <h1 style={{ fontSize: 32, letterSpacing: -0.6, margin: "0 0 8px", fontWeight: 400, lineHeight: 1.2 }}>
          一份 <span style={{ color: "var(--accent)" }}>可执行</span> 的修复包。
        </h1>
        <p style={{ color: "var(--fg-2)", fontSize: 14, maxWidth: 680, lineHeight: 1.55, marginBottom: 20 }}>
          这一份是给 Claude Code / Cursor / Codex 读的。把下面任一格式喂给它，它就能找到对应文件、按优先级落地修复，并在完成后调用 <span className="mono" style={{ color: "var(--fg-1)" }}>pp run .</span> 验证。
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Pill color="var(--accent)" style={{ background: "var(--accent-dim)" }}>8 issues</Pill>
          <Pill>3 high · 3 med · 2 low</Pill>
          <Pill>12 files affected</Pill>
          <Pill>est. 4.2 hours dev time</Pill>
        </div>
      </div>

      {/* Format tabs */}
      <div style={{ padding: "0 40px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {[
            { id: "patch", label: "Patch Plan", sub: "markdown · 推荐" },
            { id: "json", label: "JSON Schema", sub: "machine-strict" },
            { id: "prompt", label: "Drop-in Prompt", sub: "粘到 chat 里" },
          ].map((tx) => (
            <button key={tx.id} onClick={() => setTab(tx.id)} style={{
              padding: "12px 18px", textAlign: "left",
              borderBottom: tab === tx.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: tab === tx.id ? "var(--fg)" : "var(--fg-2)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.label}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 2, letterSpacing: 0.4 }}>{tx.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => copy(tab, cur)} className="mono" style={{
            fontSize: 10, padding: "5px 12px", border: "1px solid var(--line-2)",
            color: copied === tab ? "var(--accent)" : "var(--fg-2)", letterSpacing: 0.6,
          }}>{copied === tab ? "✓ COPIED" : "COPY"}</button>
          <button className="mono" style={{
            fontSize: 10, padding: "5px 12px", border: "1px solid var(--line-2)",
            color: "var(--fg-2)", letterSpacing: 0.6,
          }}>DOWNLOAD</button>
          <button className="mono" style={{
            fontSize: 10, padding: "5px 12px", background: "var(--accent)",
            color: "var(--accent-fg)", letterSpacing: 0.6, fontWeight: 600,
          }}>SEND TO CLAUDE →</button>
        </div>
      </div>

      {/* Code viewport */}
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 280px", flex: 1, minHeight: 600 }}>
        {/* Line numbers */}
        <div className="mono" style={{
          background: "var(--bg-1)", borderRight: "1px solid var(--line)",
          padding: "16px 0", textAlign: "right", color: "var(--fg-3)", fontSize: 10.5,
          lineHeight: 1.65, userSelect: "none",
        }}>
          {cur.split("\n").map((_, i) => (
            <div key={i} style={{ padding: "0 12px" }}>{i + 1}</div>
          ))}
        </div>

        {/* Body */}
        <pre className="mono" style={{
          margin: 0, padding: "16px 20px", overflow: "auto", background: "var(--bg)",
          fontSize: 11.5, lineHeight: 1.65, color: "var(--fg-1)", letterSpacing: -0.1,
        }}>{highlight(cur, tab)}</pre>

        {/* Right rail — file targets */}
        <aside style={{ borderLeft: "1px solid var(--line)", background: "var(--bg-1)" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              Affected Files
            </div>
          </div>
          {[
            { path: "src/pages/Today.tsx", issues: ["i01"], lines: "+24 −2" },
            { path: "src/components/Onboarding.tsx", issues: ["i01"], lines: "新建" },
            { path: "src/lib/shortcuts.ts", issues: ["i02"], lines: "+1 −1" },
            { path: "src/components/CommandPalette.tsx", issues: ["i02"], lines: "+3 −0" },
            { path: "src/lib/export.ts", issues: ["i03"], lines: "新建 +89" },
            { path: "src/pages/api/export.ts", issues: ["i03"], lines: "新建 +42" },
            { path: "src/lib/roles.ts", issues: ["i04"], lines: "+14 −3" },
            { path: "src/styles/theme.css", issues: ["i05"], lines: "+2 −2" },
            { path: "src/components/TaskInput.tsx", issues: ["i06"], lines: "+8 −1" },
            { path: "src/components/SyncBtn.tsx", issues: ["i07"], lines: "+12 −4" },
            { path: "src/data/templates.json", issues: ["i08"], lines: "+86" },
            { path: "src/pages/Templates.tsx", issues: ["i08"], lines: "+6 −2" },
          ].map((f) => (
            <div key={f.path} style={{ padding: "8px 18px", borderBottom: "1px solid var(--line)" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--fg-1)", marginBottom: 3 }}>{f.path}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {f.issues.map(id => (
                    <span key={id} className="mono" style={{
                      fontSize: 9, color: "var(--accent)", padding: "1px 5px",
                      background: "var(--accent-dim)", letterSpacing: 0.4,
                    }}>{id}</span>
                  ))}
                </div>
                <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>{f.lines}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

/* Syntax highlight (very light, by token regex) */
function highlight(text, kind) {
  if (kind === "json") {
    // Split into lines, then per-line tokenize
    return text.split("\n").map((line, idx) => {
      // Tokenize the line
      const parts = [];
      let rest = line;
      let key = 0;
      while (rest.length) {
        // string
        const strM = rest.match(/^("(?:\\.|[^"\\])*")(\s*:)?/);
        if (strM) {
          const isKey = !!strM[2];
          parts.push(<span key={key++} style={{ color: isKey ? "var(--accent)" : "oklch(0.82 0.14 75)" }}>{strM[1]}</span>);
          if (isKey) parts.push(<span key={key++}>{strM[2]}</span>);
          rest = rest.slice(strM[0].length);
          continue;
        }
        // number
        const numM = rest.match(/^-?\d+(?:\.\d+)?/);
        if (numM) {
          parts.push(<span key={key++} style={{ color: "oklch(0.82 0.14 155)" }}>{numM[0]}</span>);
          rest = rest.slice(numM[0].length);
          continue;
        }
        // bool/null
        const litM = rest.match(/^(true|false|null)/);
        if (litM) {
          parts.push(<span key={key++} style={{ color: "oklch(0.75 0.04 240)" }}>{litM[0]}</span>);
          rest = rest.slice(litM[0].length);
          continue;
        }
        // anything else
        const charM = rest.match(/^[^"0-9tfn-]+/);
        if (charM) {
          parts.push(<span key={key++}>{charM[0]}</span>);
          rest = rest.slice(charM[0].length);
        } else {
          parts.push(<span key={key++}>{rest[0]}</span>);
          rest = rest.slice(1);
        }
      }
      return <div key={idx}>{parts.length ? parts : "\u200B"}</div>;
    });
  }
  if (kind === "patch") {
    // Highlight headings, code fences, bullets, and severity tags
    return text.split("\n").map((line, idx) => {
      let color = "var(--fg-1)";
      let weight = 400;
      if (/^#{1,3} /.test(line)) { color = "var(--fg)"; weight = 600; }
      else if (/^\s*- /.test(line) || /^\s*\d+\. /.test(line)) color = "var(--fg-1)";
      else if (/^```/.test(line)) color = "var(--fg-3)";
      else if (/^\s*FILE:/.test(line)) color = "var(--accent)";
      else if (/^\s*(HIGH|MED|LOW)/.test(line)) color = "oklch(0.82 0.14 75)";
      else if (line.startsWith("+ ")) color = "var(--good)";
      else if (line.startsWith("- ")) color = "var(--danger)";
      return <div key={idx} style={{ color, fontWeight: weight }}>{line || "\u200B"}</div>;
    });
  }
  // prompt
  return text.split("\n").map((line, idx) => {
    let color = "var(--fg-1)";
    if (/^#{1,3} /.test(line)) color = "var(--accent)";
    else if (/^```/.test(line)) color = "var(--fg-3)";
    else if (/^>/.test(line)) color = "var(--fg-2)";
    return <div key={idx} style={{ color }}>{line || "\u200B"}</div>;
  });
}

function buildPatchDoc() {
  return `# product-predict / run-043 / patch plan
# repo: lumen-labs/pebble-app @ f9c2a1e
# generated: 2026-05-21T14:08:21Z · schema: pp.patch.v1

## SUMMARY
- 8 issues found across 24 agents · 184 evidence events
- Predicted NPS: -14 (achievable: +28 after high-sev fixes)
- Apply in order. Run \`pp run . --verify\` after each high-sev fix.

## ISSUES

### [i01] HIGH · Onboarding — 新用户找不到「创建任务」入口
EVIDENCE: 14 events · 9/24 agents · drop-off at /projects/new = 42%
EXPECTED-IMPACT: NPS +18, Task Success 67% → 88%

FILE: src/pages/Today.tsx (modify, lines 34-58)
INTENT: 当 tasks.length === 0 时，渲染居中的 EmptyState CTA。
+ import { EmptyState } from '@/components/EmptyState';
+ if (tasks.length === 0) return <EmptyState onCreate={openNewTask} />;

FILE: src/components/Onboarding.tsx (CREATE)
INTENT: 3-step coach-mark overlay for first session.
- props: { onDismiss: () => void }
- steps: ["创建第一个任务", "拖到 Today 列", "邀请协作者"]
- persist dismissal to localStorage key 'pebble:onb:v1'

### [i02] HIGH · Keyboard — Cmd+/ 应为 Cmd+K
EVIDENCE: 23 events · 11/24 agents · rage-clicks=11

FILE: src/lib/shortcuts.ts
- export const PALETTE_KEY = '/';
+ export const PALETTE_KEY = 'k';

FILE: src/components/CommandPalette.tsx
+ // also bind legacy '/' for 90 days
+ useHotkey('mod+/', open, { deprecated: true });

### [i03] HIGH · Data — 缺少 CSV / API 导出
EVIDENCE: 9 events · 7/24 agents · 搜索关键词 'export' 命中 0 次

FILE: src/lib/export.ts (CREATE)
INTENT: tasksToCsv(tasks: Task[]): string + downloadBlob helper.

FILE: src/pages/api/export.ts (CREATE)
INTENT: GET /api/export?fmt=csv|json · auth via session · streams.

### [i04] MED · Admin — 权限粒度太粗
FILE: src/lib/roles.ts
+ export type Role = 'owner' | 'admin' | 'member' | 'viewer';

### [i05] MED · A11y — 深色模式次要按钮对比度 2.1:1
FILE: src/styles/theme.css
- --btn-secondary-fg: #6b6b66;
+ --btn-secondary-fg: #a8a89e;  /* contrast 4.6:1, meets WCAG AA */

### [i06] MED · Mobile — 键盘遮挡输入区域
FILE: src/components/TaskInput.tsx
+ useVisualViewport(({ height }) => scrollIntoView(inputRef, { bottom: 0 }));

### [i07] LOW · Feedback — Sync 按钮无加载态
FILE: src/components/SyncBtn.tsx
+ const [pending, start] = useTransition();
+ {pending && <Spinner size={12} />}

### [i08] LOW · Templates — 模板太少且偏开发
FILE: src/data/templates.json
+ marketing-launch · sales-pipeline · ops-runbook · hr-onboarding · finance-close · pm-roadmap

## VERIFICATION
After applying, run:
\`\`\`
pp run . --agents 24 --compare run-043
\`\`\`
Pass criteria: NPS ≥ +12, Task Success ≥ 85%, Rage Clicks ≤ 3.
`;
}

function buildJsonDoc() {
  return `{
  "schema": "pp.patch.v1",
  "run_id": "run-043",
  "repo": "lumen-labs/pebble-app",
  "commit": "f9c2a1e",
  "generated_at": "2026-05-21T14:08:21Z",
  "summary": {
    "issues": 8,
    "agents": 24,
    "evidence_events": 184,
    "predicted_nps": -14,
    "achievable_nps": 28,
    "est_dev_hours": 4.2
  },
  "issues": [
    {
      "id": "i01",
      "severity": "high",
      "category": "onboarding",
      "title": "新用户找不到「创建任务」入口",
      "agents_affected": 9,
      "evidence_count": 14,
      "expected_impact": { "nps_delta": 18, "task_success_delta": 0.21 },
      "patches": [
        {
          "file": "src/pages/Today.tsx",
          "op": "modify",
          "lines": [34, 58],
          "intent": "当 tasks.length === 0 时渲染 EmptyState CTA"
        },
        {
          "file": "src/components/Onboarding.tsx",
          "op": "create",
          "intent": "3-step coach-mark overlay for first session"
        }
      ]
    },
    {
      "id": "i02",
      "severity": "high",
      "category": "keyboard",
      "title": "Cmd+/ 应为 Cmd+K",
      "agents_affected": 11,
      "evidence_count": 23,
      "patches": [
        { "file": "src/lib/shortcuts.ts", "op": "modify", "diff": "PALETTE_KEY = 'k'" }
      ]
    },
    {
      "id": "i03",
      "severity": "high",
      "category": "data",
      "title": "缺少 CSV / API 导出",
      "agents_affected": 7,
      "evidence_count": 9,
      "patches": [
        { "file": "src/lib/export.ts", "op": "create" },
        { "file": "src/pages/api/export.ts", "op": "create" }
      ]
    }
  ],
  "verify": {
    "command": "pp run . --agents 24 --compare run-043",
    "pass": { "nps_min": 12, "task_success_min": 0.85, "rage_clicks_max": 3 }
  }
}`;
}

function buildPromptDoc() {
  return `# Drop-in prompt for Claude Code / Cursor / Codex
# Paste this whole block into your AI coding assistant.

I just ran product-predict on this repo (run #043) and got
8 issues across 24 synthetic users. I want you to apply
the high-severity fixes in order, then re-run to verify.

> Constraints:
> - Touch only the files listed under each issue.
> - Keep existing test suite green; add tests for new logic.
> - After each high-sev issue, run \`pp run . --verify\` and stop if it regresses.

## Issue 1 (HIGH) — Onboarding empty state
File: src/pages/Today.tsx
Add an EmptyState component that renders centered when tasks
is empty, with a primary "+ 新任务" button bound to openNewTask().
Also create src/components/Onboarding.tsx — a 3-step coach-mark
overlay shown on first visit, persisted to localStorage key
'pebble:onb:v1'.

## Issue 2 (HIGH) — Command palette shortcut
File: src/lib/shortcuts.ts
Change PALETTE_KEY from '/' to 'k'. Keep '/' as a deprecated
binding for 90 days.

## Issue 3 (HIGH) — Export
Create src/lib/export.ts with tasksToCsv(tasks) and
downloadBlob helpers. Create src/pages/api/export.ts route
that streams CSV or JSON depending on ?fmt= param.

## Verify
\`\`\`
pp run . --agents 24 --compare run-043
\`\`\`
Pass: NPS ≥ +12, Task Success ≥ 85%, Rage Clicks ≤ 3.

When done, summarize: what was changed, why, and the new
predicted scores.`;
}
