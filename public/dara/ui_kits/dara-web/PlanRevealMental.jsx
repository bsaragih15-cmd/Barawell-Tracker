import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { ConsentCheckbox } from "../../components/forms/ConsentCheckbox.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";

/* Dara — plan reveal, Kesehatan Mental (mobile). Calmest plan in the brand:
   counseling-led, treatment only if the doctor suggests it and you agree.
   Stays within "membantu mengelola"; no diagnosis, no emergency framing. */
export function PlanRevealMental({ onCheckout }) {
  const [consent, setConsent] = React.useState(false);
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <StatusChip status="approved" label="Cocok untukmu" />
      </div>

      <DoctorCard compact name="Kirana, M.Psi." specialty="Psikolog · meninjau ceritamu" />

      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 550, lineHeight: 1.15 }}>Rencana lembut untuk mengelola cemas.</h1>
      <p style={{ margin: "-6px 0 0", fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)" }}>
        Mulai dari konseling dengan psikolog, sesuai kecepatanmu. Kalau perawatan dari dokter cocok untukmu nanti, itu dibicarakan dulu — kamu yang memutuskan.
      </p>

      {/* What's included */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Yang kamu dapat tiap bulan</p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {["Sesi konseling video 45 menit dengan psikolog", "Pesan kapan kamu butuh, dibalas tim", "Latihan mingguan tanpa target, tanpa skor", "Perawatan dari dokter bila tepat — atas persetujuanmu"].map((s, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6 9 17l-5-5" /></svg>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Semua termasuk</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>
            Rp 149.000<span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 400, color: "var(--text-meta)" }}>/bln</span>
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Konseling + pendampingan pesan + latihan. Biaya perawatan (bila ada) dibicarakan terpisah. Hemat hingga 13% dengan prabayar — pilih di pembayaran.
        </p>
      </div>

      <ConsentCheckbox checked={consent} onChange={setConsent}>
        Saya memahami ini layanan pendampingan kesehatan mental dan setuju dengan <a href="#">syarat layanan</a>. Bisa dijeda atau dihentikan kapan saja.
      </ConsentCheckbox>

      <Button size="lg" fullWidth disabled={!consent} onClick={onCheckout}>Mulai pendampinganku</Button>
      <Button variant="quiet" fullWidth>Tanya dulu sebelum mulai</Button>
    </div>
  );
}
