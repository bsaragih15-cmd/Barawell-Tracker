import React from "react";

const DEFAULT_ITEMS = [
  "Obat terdaftar BPOM",
  "Dokter berlisensi (STR aktif)",
  "Pengiriman diskret",
  "Bermitra dengan klinik berizin",
];

/* Quiet horizontal trust strip — text separated by dots, no icon circus. */
export function TrustBar({ items = DEFAULT_ITEMS, style }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 12,
        rowGap: 6,
        padding: "14px 16px",
        borderTop: "var(--border-hairline)",
        borderBottom: "var(--border-hairline)",
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" style={{ color: "var(--dara-line)", fontSize: 10 }}>●</span>
          )}
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
