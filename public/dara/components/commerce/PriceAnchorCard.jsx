import React from "react";

/* Landing-page price anchor: apotek DIY on the left,
   Dara program on the right (terracotta border = the considered choice). */
export function PriceAnchorCard({ left, right, style }) {
  const cell = (side, accent) => (
    <div
      style={{
        background: accent ? "var(--surface-card)" : "var(--surface-card-tint)",
        border: accent ? "1.5px solid var(--dara-terracotta)" : "var(--border-hairline)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",
      }}
    >
      <p style={{ margin: 0, fontSize: "var(--text-caption)", fontWeight: 600, letterSpacing: "0.01em", color: accent ? "var(--dara-terracotta)" : "var(--text-meta)" }}>
        {side.eyebrow}
      </p>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.25, fontFeatureSettings: "var(--numeric-tabular)" }}>
        {side.price}
      </p>
      <p style={{ margin: 0, fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.55 }}>
        {side.note}
      </p>
    </div>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: 12,
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      {cell(left, false)}
      {cell(right, true)}
    </div>
  );
}
