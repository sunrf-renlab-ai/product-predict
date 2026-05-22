// Shared UI primitives

const sevColor = (sev) => sev === "high" ? "var(--danger)" : sev === "med" ? "var(--warn)" : "var(--neutral)";
const sentColor = (s) => s >= 2 ? "var(--good)" : s >= 1 ? "var(--good)" : s === 0 ? "var(--neutral)" : s >= -1 ? "var(--warn)" : "var(--danger)";

function Pill({ children, color, style }) {
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px", border: `1px solid ${color || "var(--line-2)"}`,
      color: color || "var(--fg-2)", borderRadius: 2, fontSize: 10,
      letterSpacing: 0.4, textTransform: "uppercase",
      ...style,
    }}>{children}</span>
  );
}

function Dot({ color, size = 6, pulse = false }) {
  return (
    <span style={{
      position: "relative", display: "inline-block", width: size, height: size,
      borderRadius: "50%", background: color, flexShrink: 0,
    }}>
      {pulse && <span className="pulse-ring" style={{
        position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${color}`,
      }}/>}
    </span>
  );
}

function AgentAvatar({ agent, size = 28, ring = false }) {
  if (!agent) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 2, flexShrink: 0,
      background: agent.color, color: "#0d0d0c",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "JetBrains Mono, monospace", fontWeight: 600,
      fontSize: size * 0.42, letterSpacing: -0.3,
      boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 3px ${agent.color}` : "none",
    }}>{agent.glyph}</div>
  );
}

function MiniBar({ value, max = 5, width = 60 }) {
  return (
    <div style={{ display: "flex", gap: 2, width }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 6,
          background: i < value ? "var(--accent)" : "var(--line)",
        }} />
      ))}
    </div>
  );
}

function Section({ label, right, children, style }) {
  return (
    <section style={{ ...style }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid var(--line)",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4, color: "var(--fg-2)", textTransform: "uppercase" }}>{label}</div>
        {right}
      </header>
      {children}
    </section>
  );
}

function Btn({ children, variant = "ghost", onClick, style, icon, disabled }) {
  const styles = {
    primary: { background: "var(--accent)", color: "var(--accent-fg)", border: "1px solid var(--accent)" },
    ghost: { background: "transparent", color: "var(--fg)", border: "1px solid var(--line-2)" },
    solid: { background: "var(--bg-3)", color: "var(--fg)", border: "1px solid var(--line-2)" },
    bare:  { background: "transparent", color: "var(--fg-2)", border: "1px solid transparent" },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles, padding: "8px 14px", fontSize: 12, fontWeight: 500, letterSpacing: 0.2,
      display: "inline-flex", alignItems: "center", gap: 8,
      borderRadius: 2, opacity: disabled ? 0.4 : 1,
      transition: "all .15s ease",
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

// Tiny vector icons (no library)
const Icon = {
  arrow: <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>,
  git:  <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="3" cy="3" r="1.5" stroke="currentColor" fill="none"/><circle cx="9" cy="9" r="1.5" stroke="currentColor" fill="none"/><circle cx="3" cy="9" r="1.5" stroke="currentColor" fill="none"/><path d="M3 4.5v3M4.5 9h3M4 4l5 5" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
  play: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1.5v7L8.5 5z" fill="currentColor"/></svg>,
  pause: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2.5 1.5h2v7h-2zM5.5 1.5h2v7h-2z" fill="currentColor"/></svg>,
  plus: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2"/></svg>,
  check: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5.5l2.5 2.5L9 2" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>,
  close: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2"/></svg>,
  search: <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.5" stroke="currentColor" fill="none"/><path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.2"/></svg>,
};

Object.assign(window, { Pill, Dot, AgentAvatar, MiniBar, Section, Btn, Icon, sevColor, sentColor });
