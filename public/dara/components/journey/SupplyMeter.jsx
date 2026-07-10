import React from "react";

/* Supply meter for the pil KB portal — a quiet pill-strip of days,
   sage-filled for what remains. Refill notice appears at ≤6 days. */
export function SupplyMeter({ totalDays = 28, remainingDays = 0, refillDate, style }) {
  const total = Math.max(1, totalDays);
  const remaining = Math.max(0, Math.min(total, remainingDays));
  const needsRefill = remaining <= 6;

  return (
    <div style={{ fontFamily: "var(--font-ui)", ...style }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "var(--text-small)", fontWeight: 600, color: "var(--text-primary)" }}>Persediaan pil</span>
        <span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", fontFeatureSettings: "var(--numeric-tabular)" }}>
          <strong style={{ color: "var(--dara-sage-deep)", fontWeight: 700 }}>{remaining}</strong> dari {total} hari
        </span>
      </div>
      <div
        role="img"
        aria-label={`Persediaan pil tersisa ${remaining} dari ${total} hari`}
        style={{ display: "flex", gap: 3 }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 14,
              borderRadius: "var(--radius-pill)",
              background: i < remaining ? "var(--dara-sage)" : "var(--dara-line)",
              transition: "background var(--dur-base) var(--ease-out)",
            }}
          />
        ))}
      </div>
      {needsRefill && (
        <p style={{ margin: "12px 0 0", fontSize: "var(--text-small)", lineHeight: 1.55, color: "var(--text-secondary)", padding: "10px 12px", background: "var(--dara-sage-tint)", borderRadius: "var(--radius-control)" }}>
          Waktunya isi ulang. {refillDate ? `Pesan sebelum ${refillDate} supaya tidak ada jeda.` : "Pesan sekarang supaya tidak ada jeda."}
        </p>
      )}
    </div>
  );
}
