import React from "react";
import { StatusChip } from "../journey/StatusChip.jsx";
import { Icon } from "../icons/Icon.jsx";

/* Order / pickup card. Discretion is a feature: repeat the neutral-sender cue. */
export function OrderCard({
  orderNumber,
  title,
  type = "delivery",
  statusLabel,
  eta,
  address,
  discreet = true,
  style,
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "var(--border-hairline)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "var(--space-25)",
        fontFamily: "var(--font-ui)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{title}</p>
          <p style={{ margin: "3px 0 0", fontSize: "var(--text-caption)", color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>
            {orderNumber}
          </p>
        </div>
        {statusLabel && <StatusChip status="in_review" label={statusLabel} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "var(--border-hairline)" }}>
        {eta && (
          <p style={{ margin: 0, display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text-meta)", display: "flex", marginTop: 1 }}><Icon name="clock" size={17} /></span>
            {eta}
          </p>
        )}
        {address && (
          <p style={{ margin: 0, display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--text-meta)", display: "flex", marginTop: 1 }}><Icon name="map-pin" size={17} /></span>
            <span>
              {type === "pickup" && <strong style={{ fontWeight: 600, color: "var(--text-primary)" }}>Ambil di klinik partner · </strong>}
              {address}
            </span>
          </p>
        )}
      </div>

      {discreet && (
        <p style={{ margin: 0, fontSize: "var(--text-caption)", color: "var(--text-meta)", lineHeight: 1.5 }}>
          Dikirim dengan nama pengirim netral — tidak ada label kesehatan di paket.
        </p>
      )}
    </div>
  );
}
