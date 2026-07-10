import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { ConsentCheckbox } from "../../components/forms/ConsentCheckbox.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";

/* Dara — plan reveal (mobile, dir. 3b): the plan as a 3-month journey.
   Doctor first, process before price, price all-inclusive, consent gate. */
export function PlanReveal({ onCheckout }) {
  const [consent, setConsent] = React.useState(false);
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <StatusChip status="approved" />
      </div>

      <DoctorCard compact name="dr. Ratna Wijaya" specialty="Menyusun rencanamu" str="31.2.1.404.221" />

      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 550, lineHeight: 1.12 }}>Beginilah 3 bulan pertamamu.</h1>
      <p style={{ margin: "-6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
        dr. Ratna sudah meninjau jawabanmu. Semaglutide pen mingguan, mulai dari dosis terendah.
      </p>

      <StepTimeline
        steps={[
          { title: "Minggu 1–4: 0,25 mg", description: "Tubuh beradaptasi. Cek gejala kapan saja, dokter membalas 1×24 jam.", state: "current" },
          { title: "Bulan 2: 0,5 mg bila cocok", description: "dr. Ratna meninjau check-in mingguanmu sebelum menaikkan dosis.", state: "upcoming" },
          { title: "Bulan 3: evaluasi bersama", description: "Lanjut, tahan, atau turunkan — keputusan berdua, bukan otomatis.", state: "upcoming" },
        ]}
      />

      {/* All-inclusive price */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Semua termasuk</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>
            Rp 3.900.000<span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 400, color: "var(--text-meta)" }}>/bln</span>
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Obat terdaftar BPOM + dokter + pendampingan + kiriman dingin & diskret. Hemat hingga 18% dengan prabayar 3/6 bulan — pilih di pembayaran.
        </p>
      </div>

      <ConsentCheckbox checked={consent} onChange={setConsent}>
        Saya memahami cara pakai obat ini dan setuju dengan <a href="#">syarat layanan telemedisin</a>. Perpanjangan otomatis bisa dihentikan kapan saja.
      </ConsentCheckbox>

      <Button size="lg" fullWidth disabled={!consent} onClick={onCheckout}>Mulai bulan pertamaku</Button>
      <Button variant="quiet" fullWidth>Tanya dr. Ratna dulu</Button>
    </div>
  );
}
