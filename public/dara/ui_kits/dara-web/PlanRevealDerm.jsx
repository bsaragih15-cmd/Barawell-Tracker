import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { ConsentCheckbox } from "../../components/forms/ConsentCheckbox.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";

/* Dara — plan reveal, Kulit/Rambut (mobile). Feels like a formula the
   doctor mixed for you: value stack before price, consent before pay. */
const CFG = {
  kulit: {
    doctor: "dr. Sinta Halim", str: "31.2.1.620.114", role: "Meracik formulamu",
    title: "Formula kulit racikan dr. Sinta.",
    lede: "Diracik untuk jerawat dan warna kulit tidak merata. Dipakai malam hari, dinaikkan kekuatannya bertahap sesuai reaksi kulitmu.",
    stack: ["Tretinoin 0,025% — memperbarui sel & tekstur", "Niacinamide — meratakan warna & flek", "Pelembap penguat skin barrier"],
    price: "Rp 189.000", save: "hingga 15%",
  },
  rambut: {
    doctor: "dr. Sinta Halim", str: "31.2.1.620.114", role: "Menyusun perawatanmu",
    title: "Perawatan rambut racikan dokter.",
    lede: "Dipilih untuk menahan penipisan dan mendorong pertumbuhan. Dipakai rutin, dengan foto bulanan yang ditinjau dokter.",
    stack: ["Minoxidil 5% topikal — merangsang folikel", "Serum penguat akar rambut", "Panduan pemakaian & tinjauan foto bulanan"],
    price: "Rp 165.000", save: "hingga 15%",
  },
};

export function PlanRevealDerm({ category = "kulit", onCheckout }) {
  const c = CFG[category] || CFG.kulit;
  const [consent, setConsent] = React.useState(false);
  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <StatusChip status="approved" />
      </div>

      <DoctorCard compact name={c.doctor} specialty={c.role} str={c.str} />

      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 550, lineHeight: 1.12 }}>{c.title}</h1>
      <p style={{ margin: "-6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>{c.lede}</p>

      {/* What's inside — value stack */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Yang ada di dalamnya</p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {c.stack.map((s, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6 9 17l-5-5" /></svg>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* All-inclusive price */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Semua termasuk</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>
            {c.price}<span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 400, color: "var(--text-meta)" }}>/bln</span>
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
          Formula + konsultasi & penyesuaian tiap bulan + kiriman diskret. Hemat {c.save} dengan prabayar 3/6 bulan — pilih di pembayaran.
        </p>
      </div>

      <ConsentCheckbox checked={consent} onChange={setConsent}>
        Saya memahami cara pakai dan setuju dengan <a href="#">syarat layanan telemedisin</a>. Perpanjangan otomatis bisa dihentikan kapan saja.
      </ConsentCheckbox>

      <Button size="lg" fullWidth disabled={!consent} onClick={onCheckout}>Mulai rutinku</Button>
      <Button variant="quiet" fullWidth>Tanya dokter dulu</Button>
    </div>
  );
}
