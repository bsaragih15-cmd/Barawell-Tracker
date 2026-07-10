import React from "react";

/* Doctor identity card — the plan should feel like a letter from a doctor.
   Photo is a striped placeholder until a real photo is provided. */
export function DoctorCard({ name, str, specialty, photoUrl, compact = false, style }) {
  const size = compact ? 44 : 56;
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: "var(--font-ui)",
        ...(compact
          ? {}
          : {
              background: "var(--surface-card)",
              border: "var(--border-hairline)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
              padding: "var(--space-25)",
              boxSizing: "border-box",
            }),
        ...style,
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <span
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: "50%",
            flexShrink: 0,
            overflow: "hidden",
            border: "var(--border-hairline)",
            background:
              "repeating-linear-gradient(45deg, var(--dara-oat) 0 6px, var(--dara-blush) 6px 12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 9,
            color: "var(--text-meta)",
          }}
        >
          foto
          <image-slot
            id={"doctor-" + String(name || "dokter").toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            shape="circle"
            placeholder=""
            style={{ position: "absolute", inset: 0 }}
          ></image-slot>
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: compact ? 16 : "var(--text-h3)", fontWeight: 550, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {name}
        </p>
        {specialty && (
          <p style={{ margin: "2px 0 0", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>{specialty}</p>
        )}
        {str && (
          <p style={{ margin: "2px 0 0", fontSize: "var(--text-caption)", color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>
            STR {str}
          </p>
        )}
      </div>
    </div>
  );
}
