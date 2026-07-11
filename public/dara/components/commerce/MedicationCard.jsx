import React from "react";

/* Weight GLP-1 medication comparison card (Wegovy / Mounjaro).
   The user marks a PREFERENCE — styled as a chip, never add-to-cart.
   Final choice is the doctor's (caption lives in the module). Config-driven
   so meds can be added/removed. Ozempic never appears here (T2D-only). */
export function MedicationCard({ name, molecule, cadence, results, priceLabel, selected = false, onSelect, style }) {
  const [hover, setHover] = React.useState(false);
  const row = (label, value) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: "var(--text-meta)" }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", textAlign: "right", fontFeatureSettings: "var(--numeric-tabular)" }}>{value}</span>
    </div>
  );
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left", cursor: "pointer", fontFamily: "var(--font-ui)",
        background: "var(--surface-card)",
        border: "1px solid " + (selected ? "var(--dara-terracotta)" : hover ? "var(--dara-ink-faint)" : "var(--dara-line)"),
        boxShadow: selected ? "inset 0 0 0 1px var(--dara-terracotta)" : "var(--shadow-card)",
        borderRadius: "var(--radius-card)", padding: "var(--space-25)",
        display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box",
        transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>{name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{molecule}</p>
        </div>
        {selected ? (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--dara-terracotta)", background: "var(--dara-terracotta-tint)", padding: "4px 10px", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap" }}>Pilihanmu</span>
        ) : (
          <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid var(--dara-ink-faint)", flexShrink: 0 }} />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, borderTop: "var(--border-hairline)", paddingTop: 12 }}>
        {row("Ritme", cadence)}
        {row("Hasil (uji klinis)", results)}
        {row("Harga program", priceLabel)}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "3px 9px", borderRadius: "var(--radius-pill)", alignSelf: "flex-start" }}>
        Indikasi berat badan · terdaftar BPOM
      </span>
    </button>
  );
}
