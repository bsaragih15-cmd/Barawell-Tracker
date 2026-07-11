import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { ConsentCheckbox } from "../../components/forms/ConsentCheckbox.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { SupplyMeter } from "../../components/journey/SupplyMeter.jsx";

/* Dara — plan reveal, Pil KB (mobile). Doctor picks the pill and says why;
   discretion + never-run-out promise made concrete; consent before pay. */
export function PlanRevealKB({ onCheckout }) {
  const [consent, setConsent] = React.useState(false);
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <StatusChip status="approved" />
      </div>

      <DoctorCard compact name="dr. Ayu Lestari" specialty="Memilih pilmu" str="31.2.1.517.008" />

      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 550, lineHeight: 1.12 }}>Pilihan dokter untukmu: pil kombinasi dosis rendah.</h1>
      <p style={{ margin: "-6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
        dr. Ayu meninjau jawabanmu. Estrogen-progestin dosis rendah — efektif dengan efek samping minimal untuk profilmu. Diminum tiap hari di jam yang sama.
      </p>

      {/* Never run out */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tidak akan kehabisan di hari ke-28.</p>
        <SupplyMeter totalDays={28} remainingDays={28} />
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Strip berikutnya dikirim otomatis 6 hari sebelum habis. Portalmu menghitung sisanya — kamu tinggal melanjutkan, atau jeda kapan saja.
        </p>
      </div>

      {/* All-inclusive price */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Semua termasuk</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>
            Rp 135.000<span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 400, color: "var(--text-meta)" }}>/bln</span>
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Pil + konsultasi & ganti merek kapan saja + kiriman diskret bulanan. Hemat hingga 15% dengan prabayar 3/6 bulan — pilih di pembayaran.
        </p>
      </div>

      <ConsentCheckbox checked={consent} onChange={setConsent}>
        Saya memahami cara pakai pil ini dan setuju dengan <a href="#">syarat layanan telemedisin</a>. Perpanjangan otomatis bisa dihentikan kapan saja.
      </ConsentCheckbox>

      <Button size="lg" fullWidth disabled={!consent} onClick={onCheckout}>Mulai langgananku</Button>
      <Button variant="quiet" fullWidth>Tanya dr. Ayu dulu</Button>
    </div>
  );
}
