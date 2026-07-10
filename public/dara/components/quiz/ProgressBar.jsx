import React from "react";

/* Quiz progress: a thin terracotta line. No percentages, no step dots. */
export function ProgressBar({ value = 0, label = "Kemajuan kuis", style }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        height: 3,
        width: "100%",
        background: "var(--dara-line)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          width: pct + "%",
          background: "var(--dara-terracotta)",
          borderRadius: "var(--radius-pill)",
          transition: "width var(--dur-slow) var(--ease-out)",
        }}
      />
    </div>
  );
}
