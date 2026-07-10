import React from "react";
import { Button } from "../actions/Button.jsx";

/* Plan card with prepay-savings toggle (1/3/6 bln).
   Order matters: value stack FIRST, price after — a letter, not a pricing table. */
export function PlanCard({
  planName,
  medication,
  bpom = true,
  features = [],
  prices = {},
  defaultTerm = 1,
  ctaLabel = "Lanjutkan",
  onCta,
  style,
}) {
  const [term, setTerm] = React.useState(defaultTerm);
  const terms = [1, 3, 6].filter((t) => prices[t]);
  const current = prices[term] || {};

  const fmt = (n) =>
    "Rp " + Number(n).toLocaleString("id-ID");

  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "var(--border-hairline)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "var(--space-3)",
        fontFamily: "var(--font-ui)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: 550, color: "var(--text-primary)" }}>{planName}</p>
        <p style={{ margin: "6px 0 0", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
          {medication}
          {bpom && (
            <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>
              Terdaftar BPOM
            </span>
          )}
        </p>
      </div>

      {features.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      )}

      {terms.length > 1 && (
        <div role="radiogroup" aria-label="Pilih durasi prabayar" style={{ display: "grid", gridTemplateColumns: `repeat(${terms.length}, 1fr)`, gap: 4, background: "var(--dara-oat)", borderRadius: "var(--radius-control)", padding: 4 }}>
          {terms.map((t) => {
            const active = t === term;
            return (
              <button
                key={t}
                role="radio"
                aria-checked={active}
                onClick={() => setTerm(t)}
                style={{
                  border: "1px solid " + (active ? "var(--dara-line)" : "transparent"),
                  background: active ? "var(--surface-card)" : "transparent",
                  borderRadius: 9,
                  padding: "9px 4px",
                  minHeight: 44,
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--text-small)",
                  fontWeight: 600,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
              >
                {t} bln
                {prices[t] && prices[t].savings ? (
                  <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--dara-sage-deep)" }}>{prices[t].savings}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--text-primary)", fontFeatureSettings: "var(--numeric-tabular)" }}>
          {current.perMonth != null ? fmt(current.perMonth) : ""}
        </span>
        <span style={{ fontSize: "var(--text-small)", color: "var(--text-meta)" }}>/bulan</span>
        {term > 1 && current.total != null && (
          <span style={{ width: "100%", fontSize: "var(--text-caption)", color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>
            Dibayar {fmt(current.total)} sekali untuk {term} bulan
          </span>
        )}
      </div>

      {onCta && (
        <Button size="lg" fullWidth onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
