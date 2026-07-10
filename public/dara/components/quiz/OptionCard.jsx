import React from "react";

/* Quiz answer card: full-width, huge tap target, keyboard operable.
   Selected = terracotta intent; auto-advance handled by the parent. */
export function OptionCard({ label, description, selected = false, multi = false, onSelect, style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        padding: "18px 20px",
        minHeight: 60,
        fontFamily: "var(--font-ui)",
        background: selected ? "var(--dara-terracotta-tint)" : "var(--surface-card)",
        border: "1px solid " + (selected ? "var(--dara-terracotta)" : hover ? "var(--dara-ink-faint)" : "var(--dara-line)"),
        boxShadow: selected ? "inset 0 0 0 1px var(--dara-terracotta)" : "var(--shadow-card)",
        borderRadius: "var(--radius-control)",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          borderRadius: multi ? 6 : "50%",
          border: "1.5px solid " + (selected ? "var(--dara-terracotta)" : "var(--dara-ink-faint)"),
          background: selected ? "var(--dara-terracotta)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background var(--dur-fast) var(--ease-out)",
        }}
      >
        {selected && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 550, color: "var(--text-primary)", lineHeight: 1.4 }}>{label}</span>
        {description && (
          <span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.5 }}>{description}</span>
        )}
      </span>
    </button>
  );
}
