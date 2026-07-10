import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { Input } from "../../components/forms/Input.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { SupplyMeter } from "../../components/journey/SupplyMeter.jsx";
import { TrendChart } from "../../components/journey/TrendChart.jsx";
import { MessageBubble } from "../../components/messaging/MessageBubble.jsx";
import { OrderCard } from "../../components/commerce/OrderCard.jsx";

/* Dara — portal dashboard (mobile). Density closer to an instrument
   than a feed: plan first, then check-in, titration, supply, messages, order. */
export function PortalDashboard({ onTriage, onInjectionGuide }) {
  const [weight, setWeight] = React.useState("");
  const [logged, setLogged] = React.useState(false);

  const card = (children) => (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Halo, Sari</span>
      </div>

      {/* Plan card first */}
      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 550 }}>Program Berat Badan</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Semaglutide 0,5 mg · bulan ke-2</p>
            </div>
            <StatusChip status="approved" label="Aktif" />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)", borderTop: "var(--border-hairline)", paddingTop: 12 }}>
            Perpanjangan berikutnya: <strong style={{ color: "var(--text-secondary)" }}>9 Agustus 2026</strong> · Rp 3.900.000
          </p>
        </>
      )}

      {/* Weekly check-in */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Check-in minggu ini</p>
          {logged ? (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "10px 12px", borderRadius: "var(--radius-control)" }}>
              Tercatat: {weight.replace(".", ",")} kg. Konsisten begini sudah bagus — dokter melihat trennya, bukan angka harian.
            </p>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <Input label="Berat badan" type="number" suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ flex: 1 }} />
              <Button disabled={!weight} onClick={() => setLogged(true)} style={{ minHeight: 48 }}>Catat</Button>
            </div>
          )}
        </>
      )}

      {/* Trend — trajectory, not daily judgment */}
      {card(
        <TrendChart
          points={[
            { value: 82, label: "M1" },
            { value: 81.6 },
            { value: 81.9 },
            { value: 80.8, label: "M4" },
            { value: 80.2 },
            { value: 79.5 },
            { value: 79.6 },
            { value: 78.8, label: "M8" },
          ]}
          goalNote="−3,2 kg sejak mulai. Banyak orang turun 5–10% dalam 3 bulan — dokter melihat trennya, bukan angka harian."
        />
      )}

      {/* Symptom triage entry */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Ada keluhan?</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            Mual, pusing, atau hal lain — cek gejala 1 menit. Dokter langsung meninjau bila perlu.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={onTriage}>Cek gejala</Button>
            <Button variant="secondary" style={{ flex: 1 }} onClick={onInjectionGuide}>Cara suntik</Button>
          </div>
        </>
      )}

      {/* Titration */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Jadwal dosismu</p>
          <StepTimeline
            steps={[
              { title: "0,25 mg / minggu", meta: "Bulan 1 · selesai", state: "done" },
              { title: "0,5 mg / minggu", meta: "Bulan 2 · sekarang", state: "current" },
              { title: "1 mg / minggu", meta: "Bulan 3 · bila cocok, diputuskan dokter", state: "upcoming" },
            ]}
          />
        </>
      )}

      {/* Supply (pil KB pattern, shown for completeness) */}
      {card(<SupplyMeter totalDays={28} remainingDays={5} refillDate="15 Juli 2026" />)}

      {/* Messages */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesan dengan doktermu</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MessageBubble from="doctor" author="dr. Ratna Wijaya" text="Mual di minggu pertama dosis baru itu umum. Makan porsi kecil dulu ya — kabari aku kalau berlanjut lebih dari 3 hari." time="Kemarin, 16.02" />
            <MessageBubble from="patient" text="Siap dok, sudah mendingan hari ini." time="Kemarin, 18.40" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }}>Tulis pesan</Button>
            <Button variant="secondary" style={{ flex: 1 }}>Lanjut di WhatsApp</Button>
          </div>
        </>
      )}

      <OrderCard
        orderNumber="Pesanan #DR-20260709-114"
        title="Program Berat Badan — bulan ke-2"
        statusLabel="Dalam perjalanan"
        eta="Tiba diperkirakan 11 Juli 2026"
        address="Jl. Kemang Raya No. 8, Jakarta Selatan"
      />
    </div>
  );
}
