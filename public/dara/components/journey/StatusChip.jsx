import React from "react";

/* Consultation status chip. Statuses map to PRD states —
   in_review: sage outline · approved: sage solid · needs_info: info blue. */
const STATUS = {
  in_review: {
    label: "Sedang ditinjau dokter",
    bg: "transparent",
    border: "var(--dara-sage)",
    color: "var(--dara-sage-deep)",
    dot: "var(--dara-sage)",
  },
  approved: {
    label: "Disetujui",
    bg: "var(--dara-sage)",
    border: "var(--dara-sage)",
    color: "#FFFFFF",
    dot: "#FFFFFF",
  },
  needs_info: {
    label: "Dokter butuh info tambahan",
    bg: "var(--dara-info-tint)",
    border: "var(--dara-info)",
    color: "var(--dara-info)",
    dot: "var(--dara-info)",
  },
  rejected: {
    label: "Tidak dapat dilanjutkan",
    bg: "transparent",
    border: "var(--dara-ink-faint)",
    color: "var(--text-secondary)",
    dot: "var(--dara-ink-faint)",
  },
};

export function StatusChip({ status = "in_review", label, style }) {
  const s = STATUS[status] || STATUS.in_review;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        borderRadius: "var(--radius-pill)",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontFamily: "var(--font-ui)",
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label || s.label}
    </span>
  );
}
