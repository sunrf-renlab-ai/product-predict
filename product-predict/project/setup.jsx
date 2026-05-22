// Setup / New Run screen — git input + repo detection
const { useState, useEffect } = React;

function SetupView({ onStart }) {
  const [url, setUrl] = useState("git@github.com:lumen-labs/pebble-app.git");
  const [phase, setPhase] = useState("idle"); // idle | scanning | detected
  const [scanLog, setScanLog] = useState([]);
  const [sourceTab, setSourceTab] = useState("git"); // git | cli | upload
  const [copiedKey, setCopiedKey] = useState(null);
  const copy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1400);
  };

  const handleScan = () => {
    setPhase("scanning");
    setScanLog([]);
    const lines = [
      "$ git clone --depth 50 " + url.split(":")[1],
      "  Cloning into pebble-app/...",
      "  Receiving objects: 100% (1,247/1,247), 4.2 MiB",
      "$ pp scan ./pebble-app",
      "  → detected: React 18 · Tailwind · Vite",
      "  → routes: 14 · components: 87 · pages: 14",
      "  → entry: src/main.tsx",
      "  → building product graph...",
      "  → graph: 87 nodes, 213 edges",
      "  ✓ ready for simulation",
    ];
    lines.forEach((line, i) => {
      setTimeout(() => {
        setScanLog((prev) => [...prev, line]);
        if (i === lines.length - 1) setPhase("detected");
      }, 280 + i * 240);
    });
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "48px 56px 80px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="mono fade-in-up" style={{ fontSize: 10, letterSpacing: 1.6, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 24 }}>
          New Predict Run · #043
        </div>
        <h1 className="fade-in-up" style={{
          fontSize: 56, lineHeight: 1.05, letterSpacing: -1.4, margin: "0 0 8px",
          fontWeight: 400, textWrap: "balance",
        }}>
          把 <span className="serif" style={{ fontStyle: "italic", fontWeight: 400 }}>内测</span> 这件事
          <br/>压缩到 <span style={{ color: "var(--accent)" }}>三分钟</span>。
        </h1>
        <p className="fade-in-up" style={{ animationDelay: "0.1s", fontSize: 15, color: "var(--fg-2)", maxWidth: 560, lineHeight: 1.6, marginBottom: 48 }}>
          扔一个 git 仓库进来。我们用一组合成用户在沙盒里运行它，
          收集犹豫、误点、抱怨、惊喜。<span className="mono" style={{ fontSize: 12 }}>~3 min</span> 后给你一份带证据链的反馈报告。
        </p>

        {/* Source tabs */}
        <div className="fade-in-up" style={{ animationDelay: "0.15s", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase" }}>Source · 把代码喂给我们</div>
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--line-2)" }}>
              {[
                { id: "git", label: "Git URL", sub: "云端拉取" },
                { id: "cli", label: "CLI · 本地", sub: "pp run ." },
                { id: "upload", label: "上传 zip", sub: "≤ 50 MB" },
              ].map((tab, i) => (
                <button key={tab.id} onClick={() => setSourceTab(tab.id)} style={{
                  padding: "8px 14px", borderRight: i < 2 ? "1px solid var(--line-2)" : 0,
                  background: sourceTab === tab.id ? "var(--bg-2)" : "transparent",
                  color: sourceTab === tab.id ? "var(--fg)" : "var(--fg-2)",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{tab.label}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 2, letterSpacing: 0.4 }}>{tab.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {sourceTab === "git" && (
          <div>
          <div style={{
            display: "flex", alignItems: "stretch",
            border: "1px solid var(--line-2)", background: "var(--bg-1)",
          }}>
            <div style={{ padding: "0 14px", display: "flex", alignItems: "center", color: "var(--fg-3)", borderRight: "1px solid var(--line)" }}>
              {Icon.git}
            </div>
            <input
              className="mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="git@github.com:org/repo.git"
              style={{ flex: 1, padding: "16px 14px", fontSize: 13, color: "var(--fg)", letterSpacing: -0.2 }}
            />
            <Btn variant="primary" onClick={handleScan} disabled={phase === "scanning"} style={{ padding: "0 22px", borderRadius: 0, borderColor: "var(--accent)" }} icon={phase !== "scanning" && Icon.arrow}>
              {phase === "scanning" ? "扫描中…" : phase === "detected" ? "重新扫描" : "扫描仓库"}
            </Btn>
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 8, display: "flex", gap: 16 }}>
            <span>✓ 已授权 GitHub · @ari</span>
            <span>· 仓库须包含 package.json 或 Dockerfile</span>
          </div>
          </div>
          )}

          {sourceTab === "cli" && (
            <CLIPanel copiedKey={copiedKey} copy={copy} onAttach={handleScan} />
          )}

          {sourceTab === "upload" && (
            <div style={{
              border: "1px dashed var(--line-2)", background: "var(--bg-1)",
              padding: "40px 24px", textAlign: "center", color: "var(--fg-2)", fontSize: 13,
            }}>
              <div style={{ marginBottom: 8 }}>拖入 .zip 或点击选择</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>不上传 node_modules / .git / dist</div>
            </div>
          )}
        </div>

        {/* Scan terminal */}
        {scanLog.length > 0 && (
          <div className="mono fade-in-up" style={{
            marginTop: 24, background: "var(--bg-1)", border: "1px solid var(--line)",
            padding: "16px 18px", fontSize: 12, lineHeight: 1.8, color: "var(--fg-1)",
            minHeight: 200, maxHeight: 280, overflow: "auto",
          }}>
            {scanLog.map((line, i) => (
              <div key={i} className="slide-in" style={{ color: line.startsWith("$") ? "var(--accent)" : line.startsWith("  ✓") ? "var(--good)" : "var(--fg-1)" }}>
                {line}
              </div>
            ))}
            {phase === "scanning" && (
              <span className="cursor-blink" style={{ display: "inline-block", width: 7, height: 14, background: "var(--accent)", verticalAlign: "middle", marginLeft: 2 }} />
            )}
          </div>
        )}

        {/* Detected repo card */}
        {phase === "detected" && (
          <div className="fade-in-up" style={{ marginTop: 32 }}>
            <div style={{
              border: "1px solid var(--line-2)", background: "var(--bg-1)",
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: 0,
            }}>
              <KV label="Repo" value="lumen-labs/pebble-app" />
              <KV label="Branch" value="main" />
              <KV label="Commit" value="f9c2a1e" mono />
              <KV label="Stack" value="React · Tailwind · Vite" />
            </div>
            <div style={{
              border: "1px solid var(--line-2)",
              padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center",
              background: "var(--bg-2)",
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Pebble</div>
                <div style={{ fontSize: 13, color: "var(--fg-2)" }}>团队待办 · 异步任务流</div>
              </div>
              <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                <Stat n="14" l="ROUTES" />
                <Stat n="87" l="COMPONENTS" />
                <Stat n="213" l="EDGES" />
              </div>
              <Btn variant="primary" onClick={onStart} icon={Icon.arrow}>配置 Agent 面板</Btn>
            </div>
          </div>
        )}

        {/* What we'll do */}
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
          {[
            { n: "01", t: "构造合成用户", d: "从你提供的真实内测数据中蒸馏画像；或使用我们的人群预设。每个 agent 有完整的认知模型与目标。" },
            { n: "02", t: "沙盒中运行产品", d: "在隔离的浏览器实例里部署你的 build。Agent 实际点击、输入、犹豫、抱怨，过程可回放。" },
            { n: "03", t: "证据链反馈", d: "不只是「用户觉得不好」，每条建议都附带触发事件、agent 引语、屏幕坐标与回放片段。" },
          ].map((step) => (
            <div key={step.n} style={{ background: "var(--bg-1)", padding: "20px 22px" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: 1.4, marginBottom: 10 }}>{step.n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{step.t}</div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.55 }}>{step.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div style={{ padding: "14px 20px", borderRight: "1px solid var(--line)", borderTop: "1px solid var(--line-2)" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div className={mono ? "mono" : ""} style={{ fontSize: 13, color: "var(--fg)" }}>{value}</div>
    </div>
  );
}
function Stat({ n, l }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 22, color: "var(--fg)", fontWeight: 500, lineHeight: 1 }}>{n}</div>
      <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.4, marginTop: 4 }}>{l}</div>
    </div>
  );
}

Object.assign(window, { SetupView });

function CLIPanel({ copiedKey, copy, onAttach }) {
  const [shell, setShell] = useState("brew"); // brew | npm | curl
  const installCmds = {
    brew: "brew install lumen-labs/tap/pp",
    npm:  "npm i -g @lumen-labs/product-predict",
    curl: "curl -fsSL https://pp.dev/install | sh",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Left: install */}
      <div style={{ border: "1px solid var(--line-2)", background: "var(--bg-1)" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)" }}>01 · INSTALL</div>
          <div style={{ display: "flex", gap: 0 }}>
            {Object.keys(installCmds).map((s) => (
              <button key={s} onClick={() => setShell(s)} className="mono" style={{
                fontSize: 10, padding: "3px 10px", letterSpacing: 0.4,
                background: shell === s ? "var(--bg-3)" : "transparent",
                color: shell === s ? "var(--fg)" : "var(--fg-3)",
                borderLeft: "1px solid var(--line-2)",
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--accent)", fontFamily: "JetBrains Mono", fontSize: 12 }}>$</span>
          <code className="mono" style={{ flex: 1, fontSize: 12.5, color: "var(--fg)", letterSpacing: -0.2 }}>{installCmds[shell]}</code>
          <button onClick={() => copy("install", installCmds[shell])} className="mono" style={{
            fontSize: 10, color: copiedKey === "install" ? "var(--accent)" : "var(--fg-3)",
            padding: "3px 8px", border: "1px solid var(--line-2)", letterSpacing: 0.4,
          }}>{copiedKey === "install" ? "✓ COPIED" : "COPY"}</button>
        </div>
        <div className="mono" style={{ padding: "0 16px 14px", fontSize: 10, color: "var(--fg-3)", lineHeight: 1.6 }}>
          安装后 <span style={{ color: "var(--fg-1)" }}>pp</span> 命令将在你的 PATH 中可用。<br/>
          首次运行会让你在浏览器里授权账号。
        </div>
      </div>

      {/* Right: usage */}
      <div style={{ border: "1px solid var(--line-2)", background: "var(--bg-1)" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)" }}>02 · 在项目目录里运行</div>
          <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>~/code/pebble-app</span>
        </div>
        <div className="mono" style={{ padding: "12px 16px", fontSize: 12, lineHeight: 1.8, color: "var(--fg-1)" }}>
          <div><span style={{ color: "var(--accent)" }}>$</span> cd ~/code/pebble-app</div>
          <div><span style={{ color: "var(--accent)" }}>$</span> pp run . <span style={{ color: "var(--fg-3)" }}>--agents 24 --scenario first_session</span></div>
          <div style={{ color: "var(--fg-3)" }}>  ↳ 沙盒中部署本地 build · 24 agents 排队</div>
          <div style={{ color: "var(--fg-3)" }}>  ↳ 实时面板: <span style={{ color: "var(--accent)" }}>https://pp.dev/r/043</span></div>
        </div>
        <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>已检测到本机 pp · v0.4.2</span>
          <button onClick={onAttach} className="mono" style={{
            fontSize: 10, color: "var(--accent)", letterSpacing: 0.6, padding: "3px 8px",
            border: "1px solid var(--accent)",
          }}>挂载本地运行 →</button>
        </div>
      </div>

      {/* Inside Claude Code / Cursor */}
      <div style={{ gridColumn: "1 / -1", border: "1px solid var(--line-2)", background: "var(--bg-1)" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)" }}>03 · 在 Claude Code / Cursor / Codex 里直接调用</div>
          <Pill color="var(--accent)" style={{ background: "var(--accent-dim)" }}>MCP READY</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div style={{ padding: "12px 16px", borderRight: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 6 }}>~/.claude/mcp.json</div>
            <pre className="mono" style={{ margin: 0, fontSize: 11.5, color: "var(--fg-1)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{`{
  "product-predict": {
    "command": "pp",
    "args": ["mcp"]
  }
}`}</pre>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: 1.2, marginBottom: 6 }}>在对话里这样说</div>
            <div style={{ fontSize: 12.5, color: "var(--fg)", lineHeight: 1.6, fontStyle: "italic" }}>
              “帮我用 product-predict 跑一遍当前分支，<br/>
              用 24 个 agent 重点测 onboarding 流程，<br/>
              拿到报告后直接修 high severity 的问题。”
            </div>
            <div className="mono" style={{ marginTop: 10, fontSize: 10, color: "var(--accent)" }}>
              → Claude 调用 pp.run() → 等 ~3 分钟 → 拿到 AI 修复包 → 直接 apply
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
