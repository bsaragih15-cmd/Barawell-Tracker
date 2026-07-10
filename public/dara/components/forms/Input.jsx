import React from "react";

/* Single-column form field. Errors are inline, in words — never color alone. */
export function Input({
  label,
  hint,
  error,
  type = "text",
  suffix,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const fieldId = id || autoId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-ui)", ...style }}>
      <label htmlFor={fieldId} style={{ fontSize: "var(--text-small)", fontWeight: 600, color: "var(--text-primary)" }}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          id={fieldId}
          type={type}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-invalid={!!error}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "var(--font-ui)",
            fontSize: 16,
            color: "var(--text-primary)",
            background: "var(--surface-card)",
            border: `1px solid ${error ? "var(--color-error)" : focus ? "var(--dara-terracotta)" : "var(--dara-line)"}`,
            boxShadow: focus ? "0 0 0 3px var(--dara-terracotta-tint)" : "none",
            borderRadius: "var(--radius-control)",
            padding: suffix ? "13px 56px 13px 16px" : "13px 16px",
            minHeight: 48,
            outline: "none",
            transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}
          {...rest}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 16, fontSize: "var(--text-small)", color: "var(--text-meta)", pointerEvents: "none" }}>
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p role="alert" style={{ margin: 0, fontSize: "var(--text-caption)", color: "var(--color-error)" }}>{error}</p>
      ) : hint ? (
        <p style={{ margin: 0, fontSize: "var(--text-caption)", color: "var(--text-meta)" }}>{hint}</p>
      ) : null}
    </div>
  );
}
