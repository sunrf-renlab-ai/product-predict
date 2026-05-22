// Agents view (replaces the prototype's AgentsView) — shows the personas that
// actually ran. New schema: preferences + knownContext + weight. No "goal".

function AgentsView({ onStart, onBack, agentCount }) {
  const agents = window.AGENTS || [];
  const meta = window.RUN_META;
  const personaSetName = meta?.personaSetId || "(unsaved)";

  // Derive distinct archetypes from the agent list (some may be replicated
  // with suffixed ids like a01-1 / a01-2 from weight allocation).
  const archetypes = [];
  const seen = new Set();
  for (const a of agents) {
    const baseId = String(a.id).split("-").slice(0, 1)[0];
    const key = `${baseId}-${a.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    archetypes.push({ ...a, instanceCount: agents.filter((x) => String(x.id).startsWith(baseId)).length });
  }

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
      <div style={{ overflow: "auto", padding: "32px 40px 80px" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
          Agent Panel · 这次 run 用的合成用户
        </div>
        <h2 style={{ fontSize: 28, letterSpacing: -0.6, margin: 0, fontWeight: 400 }}>
          <span style={{ color: "var(--accent)" }}>{archetypes.length}</span> 个画像 ·
          总共 <span style={{ color: "var(--accent)" }}>{agents.length}</span> 个 agent 跑了一遍
        </h2>
        <p style={{ color: "var(--fg-2)", fontSize: 13, marginTop: 10, marginBottom: 24, maxWidth: 620 }}>
          每个画像有自己的偏好和已知背景。多个 agent 共享同一画像时，他们都按这个偏好探索 —— 复制数由权重决定。
          编辑 persona set: <span className="mono" style={{ color: "var(--fg-1)" }}>pp personas edit {personaSetName}</span>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
          {archetypes.map((a, idx) => (
            <div key={a.id} className="fade-in-up" style={{
              background: "var(--bg-1)", padding: "16px 18px 14px",
              animationDelay: `${idx * 0.03}s`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <AgentAvatar agent={a} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{a.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>
                    {a.age} · {a.role}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: 0.4 }}>
                    {Math.round((a.weight || 0) * 100)}%
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 2 }}>
                    {a.instanceCount} 个实例
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2 }}>TECH</span>
                <MiniBar value={a.tech} width={80} />
              </div>

              {a.preferences && a.preferences.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 4 }}>PREFERENCES</div>
                  {a.preferences.map((p, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: "var(--fg-1)", lineHeight: 1.45, marginBottom: 2 }}>
                      <span style={{ color: "var(--accent)" }}>·</span> {p}
                    </div>
                  ))}
                </div>
              )}

              {a.knownContext && a.knownContext.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 4 }}>已知背景</div>
                  {a.knownContext.map((c, i) => (
                    <div key={i} style={{ fontSize: 11, color: "var(--fg-2)", lineHeight: 1.45, marginBottom: 2 }}>
                      <span style={{ color: "var(--fg-3)" }}>·</span> {c}
                    </div>
                  ))}
                </div>
              )}

              {a.traits && a.traits.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.traits.map((t) => (
                    <span key={t} className="mono" style={{
                      fontSize: 9, color: "var(--fg-2)", letterSpacing: 0.3,
                      padding: "2px 6px", background: "var(--bg-3)",
                    }}>{t}</span>
                  ))}
                  <span className="mono" style={{
                    fontSize: 9, color: a.tone === "急躁" || a.tone === "挑剔" ? "var(--warn)" : "var(--fg-2)",
                    padding: "2px 6px", background: "var(--bg-3)",
                  }}>{a.tone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside style={{ borderLeft: "1px solid var(--line)", background: "var(--bg-1)", display: "flex", flexDirection: "column" }}>
        <Section label="Persona Set">
          <div style={{ padding: "14px 20px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 4 }}>ID</div>
            <div style={{ fontSize: 13, color: "var(--fg-1)", marginBottom: 12 }}>{personaSetName}</div>
            {meta && (
              <>
                <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 4 }}>RAN AGAINST</div>
                <div style={{ fontSize: 12, color: "var(--fg-1)", marginBottom: 12, wordBreak: "break-all" }}>
                  {meta.target?.url}
                </div>
              </>
            )}
          </div>
        </Section>

        <Section label="Distribution">
          <div style={{ padding: "14px 20px" }}>
            {archetypes.map((a) => (
              <div key={a.id} style={{ marginBottom: 8, display: "grid", gridTemplateColumns: "100px 1fr 30px", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--fg-1)" }}>{a.name}</span>
                <div style={{ height: 6, background: "var(--bg-3)" }}>
                  <div style={{ width: `${(a.weight || 0) * 100}%`, height: "100%", background: a.color }} />
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-2)", textAlign: "right" }}>
                  {Math.round((a.weight || 0) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Section>

        {meta?.cost && (
          <Section label="Run Cost">
            <div style={{ padding: "14px 20px" }}>
              <div className="mono" style={{ fontSize: 14, color: "var(--accent)" }}>
                ${meta.cost.usd?.toFixed(2) ?? "0.00"}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 4 }}>
                {Math.round((meta.cost.tokensIn || 0) / 1000)}k in · {Math.round((meta.cost.tokensOut || 0) / 1000)}k out
              </div>
            </div>
          </Section>
        )}
      </aside>
    </div>
  );
}

Object.assign(window, { AgentsView });
