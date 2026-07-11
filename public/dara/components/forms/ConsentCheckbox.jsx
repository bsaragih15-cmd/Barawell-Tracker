import React from "react";

/* Consent is a real decision: never pre-checked, label is plain language,
   whole row is tappable. */
export function ConsentCheckbox({ checked = false, onChange, children, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        background: "var(--surface-card)",
        border: `1px solid ${checked ? "var(--dara-terracotta)" : "var(--dara-line)"}`,
        borderRadius: "var(--radius-control)",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        transition: "border-color var(--dur-fast) var(--ease-out)",
        outline: focus ? "var(--focus-ring)" : "none",
        outlineOffset: "var(--focus-offset)",
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
      />
      <span
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          marginTop: 1,
          borderRadius: 6,
          border: `1.5px solid ${checked ? "var(--dara-terracotta)" : "var(--dara-ink-faint)"}`,
          background: checked ? "var(--dara-terracotta)" : "var(--surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: "var(--text-small)", lineHeight: 1.55, color: "var(--text-secondary)" }}>
        {children}
      </span>
    </label>
  );
}
