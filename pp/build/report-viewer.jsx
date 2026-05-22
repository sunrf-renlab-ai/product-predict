// Report — synthesized feedback, driven by window.RUN_META (a real run.json).
// Replaces the prototype's report.jsx so hero copy / big scores / issue counts
// / AI patch plan are all computed from actual run data.
// (useStateR is already declared in the prototype's report.jsx earlier in the bundle.)

function ReportView({ onRerun }) {
  const meta = window.RUN_META;
  const issues = window.ISSUES || [];
  const delights = window.DELIGHTS || [];
  const agents = window.AGENTS || [];

  const [activeIssue, setActiveIssue] = useStateR(issues[0]?.id || null);
  const [mode, setMode] = useStateR("human");

  if (mode === "ai") return <AIReport onSwitch={() => setMode("human")} />;

  const issue = issues.find((i) => i.id === activeIssue) || issues[0];
  const issueAgent = issue ? agents.find((a) => a.id === issue.agentRef) : null;
  const totalAgents = agents.length || 1;
  const duration = meta ? humanDuration(new Date(meta.startedAt), new Date(meta.finishedAt)) : "—";
  const m = meta?.metrics || {};

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <ModeToggleBar mode={mode} setMode={setMode} runId={meta?.id} />

      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "36px 40px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginBottom: 28 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
              Report · {meta?.id || "—"} · {meta?.target?.title || meta?.target?.url || "—"}
            </div>
            <h1 style={{ fontSize: 36, letterSpacing: -0.8, margin: 0, fontWeight: 400, lineHeight: 1.15 }}>
              <span className="serif" style={{ fontStyle: "italic" }}>{totalAgents} 位</span> 合成用户花了 {duration} 用你的产品。
              <br/>这是他们对它的<span style={{ color: "var(--accent)" }}>真实感受</span>。
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Btn variant="ghost" onClick={() => window.open(window.location.pathname.replace(/report\.html$/, "report.md"), "_blank")}>下载 report.md</Btn>
            <Btn variant="ghost" onClick={() => window.open(window.location.pathname.replace(/report\.html$/, "run.json"), "_blank")}>查看 run.json</Btn>
            <Btn variant="primary" onClick={onRerun} icon={Icon.arrow}>修复后重跑</Btn>
          </div>
        </div>

        {/* Score row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
          <BigScore label="Predicted NPS"
            value={fmtSigned(m.predictedNps)}
            delta={m.predictedNps != null ? `可改进至 ${fmtSigned(m.achievableNps)}` : "—"}
            tone={npsTone(m.predictedNps)} big />
          <BigScore label="Task Success"
            value={`${Math.round((m.taskSuccess || 0) * 100)}%`}
            delta={`${Math.round((m.taskSuccess || 0) * totalAgents)} / ${totalAgents} 完成`}
            tone={m.taskSuccess >= 0.8 ? "good" : m.taskSuccess >= 0.5 ? "warn" : "bad"} />
          <BigScore label="Time-to-Value"
            value={m.timeToValueSec != null ? fmtSec(m.timeToValueSec) : "—"}
            delta={m.timeToValueSec != null && m.timeToValueSec < 30 ? "首次惊喜很快" : "用户花了一段时间才感到价值"}
            tone={m.timeToValueSec != null && m.timeToValueSec < 30 ? "good" : "warn"} />
          <BigScore label="Rage Clicks"
            value={String(m.rageClicks ?? 0)}
            delta={topRageContext(window.ACTIVITY || [])}
            tone={(m.rageClicks || 0) > 3 ? "bad" : (m.rageClicks || 0) > 0 ? "warn" : "good"} />
          <BigScore label="Delight Moments"
            value={String(m.delightCount ?? 0)}
            delta={delights[0]?.title || "—"}
            tone={(m.delightCount || 0) > 0 ? "good" : "warn"} />
        </div>
      </div>

      {/* Body: issues + detail */}
      <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 600 }}>
        {/* Issues list */}
        <div style={{ borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>
              {issues.length} 条观察 · 这是用户的"感受"，不是 bug 列表
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>HIGH · MED · LOW</span>
          </div>
          {issues.length === 0 && (
            <div style={{ padding: "40px 24px", color: "var(--fg-3)", fontSize: 13 }}>
              没有 agent 报告问题。要么产品已经很好，要么 agent 都太宽容。
            </div>
          )}
          {issues.map((iss, idx) => (
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 34 }}>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                  padding: "3px 9px", textTransform: "uppercase",
                  color: sevColor(iss.severity),
                  background: `color-mix(in oklch, ${sevColor(iss.severity)} 14%, transparent)`,
                  border: `1px solid color-mix(in oklch, ${sevColor(iss.severity)} 40%, transparent)`,
                  borderRadius: 2,
                }}>{iss.severity}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-2)" }}>{iss.category}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>· {iss.agents}/{totalAgents} agents · {iss.evidence} evidence</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div style={{ padding: "28px 36px", overflow: "auto" }}>
          {issue && issueAgent && (
            <div className="fade-in-up" key={activeIssue}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Pill color={sevColor(issue.severity)} style={{ background: `color-mix(in oklch, ${sevColor(issue.severity)} 12%, transparent)` }}>
                  {issue.severity} severity
                </Pill>
                <Pill>{issue.category}</Pill>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>impact · {issue.agents}/{totalAgents} agents</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.25, margin: "0 0 24px" }}>{issue.title}</h2>

              <div style={{
                padding: "20px 24px", background: "var(--bg-1)",
                borderLeft: `2px solid ${issueAgent.color}`, marginBottom: 28,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <AgentAvatar agent={issueAgent} size={26} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{issueAgent.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 1 }}>{issueAgent.age} · {issueAgent.role} · tech {issueAgent.tech}/5</div>
                  </div>
                </div>
                <div className="serif" style={{ fontSize: 20, lineHeight: 1.45, color: "var(--fg)", letterSpacing: -0.1 }}>
                  <span style={{ color: "var(--fg-3)" }}>“</span>{issue.quote}<span style={{ color: "var(--fg-3)" }}>”</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 12, letterSpacing: 0.4 }}>
                  {issue.journey} · {issue.evidence} 事件
                </div>
              </div>

              {/* Evidence — pull negative-sentiment events from the same agent or category */}
              <div style={{ marginBottom: 28 }}>
                <h3 className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase", marginBottom: 12 }}>
                  Evidence · 触发该问题的事件链
                </h3>
                <div style={{ border: "1px solid var(--line)", background: "var(--bg-1)" }}>
                  {evidenceFor(issue).map((a, i, arr) => {
                    const ag = agents.find((x) => x.id === a.agent);
                    return (
                      <div key={i} style={{
                        padding: "10px 14px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : 0,
                        display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 10, alignItems: "center",
                      }}>
                        <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{a.t}</span>
                        <AgentAvatar agent={ag} size={18} />
                        <span style={{ fontSize: 12, color: "var(--fg-1)" }}>{a.text}</span>
                        <span className="mono" style={{ fontSize: 10, color: sentColor(a.sentiment) }}>s={a.sentiment > 0 ? "+" : ""}{a.sentiment}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature usage frequency */}
      {(window.FEATURES || []).length > 0 && (
        <Section label="功能使用频率 · 这次会话里被真正使用的功能">
          <div style={{ padding: "16px 24px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 90px 100px 70px",
              gap: 10,
              alignItems: "center",
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: "1px solid var(--line)",
            }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, textTransform: "uppercase" }}>功能</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, textTransform: "uppercase" }}>HIT RATE</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, textTransform: "uppercase", textAlign: "right" }}>完成率</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, textTransform: "uppercase", textAlign: "right" }}>SENTIMENT</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, textTransform: "uppercase", textAlign: "right" }}>尝试</span>
            </div>
            {(window.FEATURES || []).map((f, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 90px 100px 70px",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: i < window.FEATURES.length - 1 ? "1px solid var(--line)" : "0",
              }}>
                <span style={{ fontSize: 13, color: "var(--fg-1)" }}>{f.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 8, background: "var(--bg-2)", position: "relative" }}>
                    <div style={{
                      width: `${(f.hitRate || 0) * 100}%`,
                      height: "100%",
                      background: "var(--accent)",
                    }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)", minWidth: 60 }}>
                    {(f.hitRate * 100).toFixed(0)}% ({f.hitCount})
                  </span>
                </div>
                <span className="mono" style={{
                  fontSize: 11,
                  color: f.completionRate >= 0.7 ? "var(--good)" : f.completionRate >= 0.4 ? "var(--warn)" : "var(--danger)",
                  textAlign: "right",
                }}>
                  {(f.completionRate * 100).toFixed(0)}%
                </span>
                <span className="mono" style={{
                  fontSize: 11,
                  color: f.avgSentiment >= 1 ? "var(--good)" : f.avgSentiment >= -0.5 ? "var(--fg-2)" : "var(--danger)",
                  textAlign: "right",
                }}>
                  {f.avgSentiment >= 0 ? "+" : ""}{f.avgSentiment.toFixed(1)}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "right" }}>
                  {f.totalAttempts}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Bottom row — Delights + Heatmap */}
      <div style={{ borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <Section label="Delights · 用户喜欢的">
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {delights.length === 0 && (
              <div style={{ color: "var(--fg-3)", fontSize: 12 }}>没有亮点记录。值得反思。</div>
            )}
            {delights.map((d) => {
              const ag = agents.find((x) => x.id === d.agent);
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
            {(window.ROUTES_HEAT || []).length === 0 && (
              <div style={{ color: "var(--fg-3)", fontSize: 12 }}>没有同源跳转记录。</div>
            )}
            {(window.ROUTES_HEAT || []).map((r) => (
              <div key={r.path} style={{ marginBottom: 14, display: "grid", gridTemplateColumns: "180px 1fr 60px 60px", gap: 12, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-1)" }}>{r.path}</span>
                <div style={{ height: 10, background: "var(--bg-2)", position: "relative" }}>
                  <div style={{ width: `${Math.min(1, r.visits / Math.max(1, totalAgents)) * 100}%`, height: "100%", background: "var(--accent)" }} />
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

function ModeToggleBar({ mode, setMode, runId }) {
  return (
    <div style={{
      borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
      padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
        Report {runId ? "· " + runId : ""} · 两种视图
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
  );
}

function BigScore({ label, value, delta, tone, big }) {
  const toneColor = tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--danger)" : "var(--fg)";
  return (
    <div style={{ background: "var(--bg-1)", padding: "22px 24px" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: big ? 44 : 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1, color: toneColor, fontFamily: "Geist", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div className="mono" style={{
        fontSize: 10, color: "var(--fg-3)", marginTop: 10, lineHeight: 1.5,
        // Clamp delta to a single line — preserves layout when a long quote
        // sneaks in (e.g. topRageContext returning a 30-char string).
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }} title={delta}>{delta}</div>
    </div>
  );
}

// ── AI Report ───────────────────────────────────────────────────────────────

function AIReport({ onSwitch }) {
  const meta = window.RUN_META;
  const issues = window.ISSUES || [];
  const agents = window.AGENTS || [];
  const [tab, setTab] = useStateR("patch");
  const [copied, setCopied] = useStateR(null);
  const copy = (key, text) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  const counts = {
    high: issues.filter((i) => i.severity === "high").length,
    med: issues.filter((i) => i.severity === "med").length,
    low: issues.filter((i) => i.severity === "low").length,
  };

  const patchDoc = buildPatchFromRun(meta, issues, agents);
  const jsonDoc = buildJsonFromRun(meta, issues);
  const promptDoc = buildPromptFromRun(meta, issues);

  const cur = { patch: patchDoc, json: jsonDoc, prompt: promptDoc }[tab];

  return (
    <div style={{ height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{
        borderBottom: "1px solid var(--line)", background: "var(--bg-1)",
        padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>
          Report {meta ? "· " + meta.id : ""} · 两种视图
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

      <div style={{ padding: "32px 40px 28px", borderBottom: "1px solid var(--line)" }}>
        <h1 style={{ fontSize: 32, letterSpacing: -0.6, margin: "0 0 8px", fontWeight: 400, lineHeight: 1.2 }}>
          一份 <span style={{ color: "var(--accent)" }}>可执行</span> 的修复包。
        </h1>
        <p style={{ color: "var(--fg-2)", fontSize: 14, maxWidth: 680, lineHeight: 1.55, marginBottom: 20 }}>
          这一份是给 Claude Code / Cursor / Codex 读的。把下面任一格式喂给它，它就能按优先级落地修复，并在完成后调用 <span className="mono" style={{ color: "var(--fg-1)" }}>pp run</span> 验证。
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Pill color="var(--accent)" style={{ background: "var(--accent-dim)" }}>{issues.length} issues</Pill>
          <Pill>{counts.high} high · {counts.med} med · {counts.low} low</Pill>
          <Pill>{(meta?.activity || []).length} events</Pill>
          <Pill>cost · ${meta?.cost?.usd?.toFixed(2) ?? "0.00"}</Pill>
        </div>
      </div>

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
          <a href={window.location.pathname.replace(/report\.html$/, "report.md")} download className="mono" style={{
            fontSize: 10, padding: "5px 12px", border: "1px solid var(--line-2)",
            color: "var(--fg-2)", letterSpacing: 0.6, textDecoration: "none",
          }}>DOWNLOAD</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", flex: 1, minHeight: 600 }}>
        <div className="mono" style={{
          background: "var(--bg-1)", borderRight: "1px solid var(--line)",
          padding: "16px 0", textAlign: "right", color: "var(--fg-3)", fontSize: 10.5,
          lineHeight: 1.65, userSelect: "none",
        }}>
          {cur.split("\n").map((_, i) => (
            <div key={i} style={{ padding: "0 12px" }}>{i + 1}</div>
          ))}
        </div>

        <pre className="mono" style={{
          margin: 0, padding: "16px 20px", overflow: "auto", background: "var(--bg)",
          fontSize: 11.5, lineHeight: 1.65, color: "var(--fg-1)", letterSpacing: -0.1,
        }}>{highlight(cur, tab)}</pre>
      </div>
    </div>
  );
}

// Reuse the prototype's `highlight()` — it's already declared earlier in the
// concatenated bundle (in the prototype's report.jsx, which we did NOT skip);
// we override the doc *builders* below.

function buildPatchFromRun(meta, issues, agents) {
  if (!meta) return "# no run loaded";
  const L = [];
  L.push(`# product-predict / ${meta.id} / patch plan`);
  L.push(`# target: ${meta.target?.url}`);
  L.push(`# generated: ${meta.finishedAt} · schema: pp.patch.v1`);
  L.push("");
  L.push(`## SUMMARY`);
  L.push(`- ${issues.length} issues across ${agents.length} agents · ${(meta.activity || []).length} events`);
  L.push(`- Predicted NPS: ${meta.metrics?.predictedNps} (achievable: ${meta.metrics?.achievableNps})`);
  L.push(`- Apply in order. Run \`pp run ${meta.target?.url} --compare ${meta.id}\` after each high-sev fix.`);
  L.push("");
  L.push(`## ISSUES`);
  for (const iss of issues) {
    const ag = agents.find((a) => a.id === iss.agentRef);
    L.push("");
    L.push(`### [${iss.id}] ${iss.severity.toUpperCase()} · ${iss.category} — ${iss.title}`);
    L.push(`EVIDENCE: ${iss.evidence} events · ${iss.agents}/${agents.length} agents · journey: ${iss.journey}`);
    if (iss.quote) L.push(`QUOTE (${ag?.name || iss.agentRef}): "${iss.quote}"`);
  }
  L.push("");
  L.push(`## VERIFICATION`);
  L.push("```");
  L.push(`pp run ${meta.target?.url} --agents ${agents.length} --compare ${meta.id}`);
  L.push("```");
  return L.join("\n");
}

function buildJsonFromRun(meta, issues) {
  if (!meta) return "{}";
  return JSON.stringify({
    schema: "pp.patch.v1",
    run_id: meta.id,
    target: meta.target?.url,
    generated_at: meta.finishedAt,
    summary: {
      issues: issues.length,
      agents: (meta.agents || []).length,
      evidence_events: (meta.activity || []).length,
      predicted_nps: meta.metrics?.predictedNps,
      achievable_nps: meta.metrics?.achievableNps,
      task_success: meta.metrics?.taskSuccess,
    },
    issues: issues.map((iss) => ({
      id: iss.id,
      severity: iss.severity,
      category: iss.category,
      title: iss.title,
      agents_affected: iss.agents,
      evidence_count: iss.evidence,
      journey: iss.journey,
      quote: iss.quote,
    })),
    verify: { command: `pp run ${meta.target?.url} --compare ${meta.id}` },
  }, null, 2);
}

function buildPromptFromRun(meta, issues) {
  if (!meta) return "# no run loaded";
  const L = [];
  L.push(`# Drop-in prompt for Claude Code / Cursor / Codex`);
  L.push(`# Paste this whole block into your AI coding assistant.`);
  L.push("");
  L.push(`I just ran product-predict on ${meta.target?.url} (${meta.id}) and got`);
  L.push(`${issues.length} issues across ${(meta.agents || []).length} synthetic users.`);
  L.push(`Apply the high-severity fixes first, then re-run to verify.`);
  L.push("");
  L.push(`> Constraints:`);
  L.push(`> - Touch only files clearly implicated by each issue.`);
  L.push(`> - Keep existing tests green; add tests for new logic.`);
  L.push(`> - After each high-sev issue, run \`pp run ${meta.target?.url} --compare ${meta.id}\` and stop if it regresses.`);
  L.push("");
  const high = issues.filter((i) => i.severity === "high");
  high.forEach((iss, i) => {
    L.push(`## Issue ${i + 1} (HIGH) — ${iss.title}`);
    L.push(`Category: ${iss.category}`);
    L.push(`User quote: "${iss.quote}"`);
    L.push(`Where they got stuck: ${iss.journey}`);
    L.push("");
  });
  return L.join("\n");
}

// ── helpers ─────────────────────────────────────────────────────────────────

function evidenceFor(issue) {
  if (!issue) return [];
  const acts = window.ACTIVITY || [];
  // Prefer negative events from the same agent.
  const sameAgent = acts.filter((a) => a.agent === issue.agentRef && a.sentiment < 0);
  if (sameAgent.length) return sameAgent.slice(0, 5);
  return acts.filter((a) => a.sentiment < 0).slice(0, 5);
}

function fmtSigned(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
}
function fmtSec(s) {
  if (s == null) return "—";
  if (s < 60) return `${s.toFixed(0)}s`;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}
function npsTone(n) {
  if (n == null) return "neutral";
  if (n >= 30) return "good";
  if (n >= 0) return "warn";
  return "bad";
}
function topRageContext(activity) {
  const rages = activity.filter((e) => e.kind === "rage");
  if (rages.length === 0) return "没有愤怒点击";
  // Show the kind of trigger, not the quote — quotes overflow the cell.
  return `首次在第 ${rages[0].t} 触发`;
}
function shortText(s, n) {
  return !s ? "—" : s.length <= n ? s : s.slice(0, n - 1) + "…";
}
function humanDuration(start, end) {
  const ms = Math.max(0, end.getTime() - start.getTime());
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} 秒`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m} 分 ${rs} 秒` : `${m} 分钟`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} 小时 ${rm} 分`;
}

// Export new ReportView/AIReport/BigScore so app-viewer's <ReportView /> picks them up.
// (In the concatenated single-script bundle, last declaration wins for `function` decls.)
Object.assign(window, { ReportView, AIReport, BigScore });
