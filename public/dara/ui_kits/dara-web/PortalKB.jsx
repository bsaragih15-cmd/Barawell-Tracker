import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { SupplyMeter } from "../../components/journey/SupplyMeter.jsx";
import { MessageBubble } from "../../components/messaging/MessageBubble.jsx";
import { OrderCard } from "../../components/commerce/OrderCard.jsx";

/* Dara — portal dashboard, Pil KB (mobile). Supply-centric: never run out
   is the whole promise, so the supply meter and refill lead. */
export function PortalKB() {
  const [reminder, setReminder] = React.useState(true);
  const [shipped, setShipped] = React.useState(false);

  const card = (children) => (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Halo, Maya</span>
      </div>

      {/* Plan card first */}
      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 550 }}>Langganan Pil KB</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Pil kombinasi dosis rendah · bulanan</p>
            </div>
            <StatusChip status="approved" label="Aktif" />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)", borderTop: "var(--border-hairline)", paddingTop: 12 }}>
            Perpanjangan berikutnya: <strong style={{ color: "var(--text-secondary)" }}>9 Agustus 2026</strong> · Rp 135.000
          </p>
        </>
      )}

      {/* Supply — the whole promise, refill due */}
      {card(
        <>
          <SupplyMeter totalDays={28} remainingDays={5} refillDate="15 Juli 2026" />
          <div style={{ display: "flex", gap: 10 }}>
            <Button style={{ flex: 1 }} disabled={shipped} onClick={() => setShipped(true)}>
              {shipped ? "Strip berikutnya dikirim" : "Kirim strip berikutnya"}
            </Button>
            <Button variant="secondary" style={{ flex: 1 }}>Jeda bulan ini</Button>
          </div>
          {shipped && (
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "10px 12px", borderRadius: "var(--radius-control)" }}>
              Beres. Kiriman berikutnya jalan hari ini — kamu tidak akan kehabisan.
            </p>
          )}
        </>
      )}

      {/* Daily reminder */}
      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pengingat harian</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-secondary)", fontFeatureSettings: "var(--numeric-tabular)" }}>Tiap hari 21.00 lewat WhatsApp</p>
            </div>
            <button
              role="switch"
              aria-checked={reminder}
              onClick={() => setReminder((v) => !v)}
              style={{ width: 46, height: 28, flexShrink: 0, borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer", padding: 3, background: reminder ? "var(--dara-sage)" : "var(--dara-line)", transition: "background var(--dur-base) var(--ease-out)" }}
            >
              <span style={{ display: "block", width: 22, height: 22, borderRadius: "50%", background: "#fff", transform: reminder ? "translateX(18px)" : "translateX(0)", transition: "transform var(--dur-base) var(--ease-out)" }} />
            </button>
          </div>
        </>
      )}

      {/* Missed a pill — kind, jenis-aware */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Telat atau lupa minum?</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            Panduan langkah demi langkah sesuai jenis pilmu — dan kapan perlu proteksi tambahan. Tidak perlu panik.
          </p>
          <Button variant="secondary" style={{ alignSelf: "flex-start" }}>Buka panduan pil terlewat</Button>
        </>
      )}

      {/* Messages */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesan dengan doktermu</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MessageBubble from="doctor" author="dr. Ayu Lestari" text="Flek ringan di 1–2 bulan pertama itu umum dan biasanya reda sendiri. Kabari aku kalau lebih dari 3 bulan ya." time="2 hari lalu, 10.12" />
            <MessageBubble from="patient" text="Oke dok, makasih. Sejauh ini aman." time="2 hari lalu, 12.30" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }}>Tulis pesan</Button>
            <Button variant="secondary" style={{ flex: 1 }}>Lanjut di WhatsApp</Button>
          </div>
        </>
      )}

      <OrderCard
        orderNumber="Pesanan #DR-20260709-238"
        title="Pil KB — kiriman bulan ini"
        statusLabel="Dalam perjalanan"
        eta="Tiba diperkirakan 11 Juli 2026"
        address="Jl. Cikini Raya No. 21, Jakarta Pusat"
      />
    </div>
  );
}
