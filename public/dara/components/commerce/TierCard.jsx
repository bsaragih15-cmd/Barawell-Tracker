import React from "react";
import { Button } from "../actions/Button.jsx";
import { Icon } from "../icons/Icon.jsx";

/* Weight two-tier card: GLP-1 (injection) and Oral, side by side, EQUAL
   design weight — the oral tier is a product, never a "basic/lite" fallback.
   `recommended` adds a quiet marker without diminishing the sibling. */
export function TierCard({ eyebrow, name, description, priceFrom, delivery, deliveryIcon = "map-pin", features = [], recommended = false, ctaLabel = "Mulai kuis", onCta, style }) {
  return (
    <div
      className="dara-lift"
      style={{
        position: "relative", background: "var(--surface-card)",
        border: "1px solid " + (recommended ? "var(--dara-terracotta)" : "var(--dara-line)"),
        borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)",
        padding: "var(--space-3)", fontFamily: "var(--font-ui)",
        display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box",
        ...style,
      }}
    >
      {recommended && (
        <span style={{ position: "absolute", top: -10, left: "var(--space-3)", fontSize: 11.5, fontWeight: 700, color: "var(--text-on-accent)", background: "var(--dara-terracotta)", padding: "3px 10px", borderRadius: "var(--radius-pill)" }}>
          Disarankan untukmu
        </span>
      )}
      <div>
        <p style={{ margin: 0, fontSize: "var(--text-caption)", fontWeight: 600, letterSpacing: "0.02em", textTransform: "none", color: "var(--text-meta)" }}>{eyebrow}</p>
        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)" }}>{name}</p>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-small)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{description}</p>
      </div>

      {features.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6 9 17l-5-5" /></svg>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", borderTop: "var(--border-hairline)", paddingTop: 14 }}>
        <span style={{ fontSize: "var(--text-small)", color: "var(--text-meta)" }}>mulai</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", fontFeatureSettings: "var(--numeric-tabular)" }}>{priceFrom}</span>
        <span style={{ fontSize: "var(--text-small)", color: "var(--text-meta)" }}>/bln</span>
      </div>

      {delivery && (
        <p style={{ margin: 0, display: "flex", gap: 8, alignItems: "center", fontSize: "var(--text-caption)", color: "var(--text-meta)" }}>
          {deliveryIcon && <span style={{ display: "flex", color: "var(--text-secondary)" }}><Icon name={deliveryIcon} size={15} /></span>}
          {delivery}
        </p>
      )}

      <Button size="lg" fullWidth variant={recommended ? "primary" : "secondary"} onClick={onCta}>{ctaLabel}</Button>
    </div>
  );
}
