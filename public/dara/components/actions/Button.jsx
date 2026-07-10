import React from "react";

/* Primary = terracotta (one per screen, the action that matters).
   Secondary = quiet outline. Quiet = text-only. Min tap target 44px. */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const sizes = {
    md: { padding: "11px 20px", fontSize: 15, minHeight: 44 },
    lg: { padding: "15px 28px", fontSize: 17, minHeight: 52 },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: disabled
        ? "var(--dara-line)"
        : hover
        ? "var(--accent-action-hover)"
        : "var(--accent-action)",
      color: disabled ? "var(--text-meta)" : "var(--text-on-accent)",
      border: "1px solid transparent",
    },
    secondary: {
      background: hover && !disabled ? "rgba(33,26,20,0.05)" : "transparent",
      color: disabled ? "var(--text-meta)" : "var(--text-primary)",
      border: `1px solid ${disabled ? "var(--dara-line)" : "var(--dara-ink-faint)"}`,
    },
    quiet: {
      background: "transparent",
      color: disabled
        ? "var(--text-meta)"
        : hover
        ? "var(--accent-action-hover)"
        : "var(--accent-action)",
      border: "1px solid transparent",
      textDecoration: hover && !disabled ? "underline" : "none",
      textUnderlineOffset: 3,
    },
  };

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1.2,
        padding: s.padding,
        minHeight: s.minHeight,
        borderRadius: "var(--radius-control)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
        transform: press && !disabled ? "scale(0.985)" : "none",
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
