import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { OptionCard } from "../../components/quiz/OptionCard.jsx";
import { ConsentCheckbox } from "../../components/forms/ConsentCheckbox.jsx";

/* Dara — checkout (mobile). Single column, summary pinned first,
   renewal date in bold BEFORE the pay button. Honesty is a design feature.
   Billing cadence is the user's choice: monthly is the default (least
   commitment) — prepay savings are opt-in, never a pre-selected upsell.
   `category` ("bb" | "kb" | "kulit" | "rambut" | "mental") keeps one checkout across funnels. */

const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

const PLANS = {
  bb: {
    title: "Program Berat Badan",
    unit: "Semaglutide pen mingguan + konsultasi dokter, pendampingan & titrasi.",
    tiers: [
      { id: 1, label: "Bulanan", months: 1, total: 3900000, perMonth: 3900000, save: null, renew: "9 Agustus 2026", note: "Fleksibel — jeda atau berhenti kapan saja" },
      { id: 3, label: "3 bulan prabayar", months: 3, total: 10500000, perMonth: 3500000, save: "hemat 10%", renew: "9 Oktober 2026", note: "Setara Rp 3.500.000/bln" },
      { id: 6, label: "6 bulan prabayar", months: 6, total: 19200000, perMonth: 3200000, save: "hemat 18%", renew: "9 Januari 2027", note: "Setara Rp 3.200.000/bln" },
    ],
    payNote: "Belum bisa BPJS atau asuransi swasta — pembayaran mandiri. Pengiriman gratis, nama pengirim netral.",
  },
  kb: {
    title: "Langganan Pil KB",
    unit: "Pil kombinasi atau progestin pilihan dokter + konsultasi & ganti merek kapan saja.",
    tiers: [
      { id: 1, label: "Bulanan", months: 1, total: 135000, perMonth: 135000, save: null, renew: "9 Agustus 2026", note: "Fleksibel — jeda atau berhenti kapan saja" },
      { id: 3, label: "3 bulan prabayar", months: 3, total: 375000, perMonth: 125000, save: "hemat 7%", renew: "9 Oktober 2026", note: "Setara Rp 125.000/bln" },
      { id: 6, label: "6 bulan prabayar", months: 6, total: 690000, perMonth: 115000, save: "hemat 15%", renew: "9 Januari 2027", note: "Setara Rp 115.000/bln" },
    ],
    payNote: "Belum bisa BPJS atau asuransi swasta — pembayaran mandiri. Pengiriman gratis, nama pengirim netral.",
  },
  kulit: {
    title: "Rutin Kulit Kustom",
    unit: "Formula kulit resep diracik dokter + konsultasi & penyesuaian tiap bulan.",
    tiers: [
      { id: 1, label: "Bulanan", months: 1, total: 189000, perMonth: 189000, save: null, renew: "9 Agustus 2026", note: "Fleksibel — jeda atau berhenti kapan saja" },
      { id: 3, label: "3 bulan prabayar", months: 3, total: 525000, perMonth: 175000, save: "hemat 7%", renew: "9 Oktober 2026", note: "Setara Rp 175.000/bln" },
      { id: 6, label: "6 bulan prabayar", months: 6, total: 960000, perMonth: 160000, save: "hemat 15%", renew: "9 Januari 2027", note: "Setara Rp 160.000/bln" },
    ],
    payNote: "Belum bisa BPJS atau asuransi swasta — pembayaran mandiri. Pengiriman gratis, nama pengirim netral.",
  },
  rambut: {
    title: "Rutin Rambut Kustom",
    unit: "Perawatan rambut resep diracik dokter + konsultasi & penyesuaian tiap bulan.",
    tiers: [
      { id: 1, label: "Bulanan", months: 1, total: 165000, perMonth: 165000, save: null, renew: "9 Agustus 2026", note: "Fleksibel — jeda atau berhenti kapan saja" },
      { id: 3, label: "3 bulan prabayar", months: 3, total: 456000, perMonth: 152000, save: "hemat 8%", renew: "9 Oktober 2026", note: "Setara Rp 152.000/bln" },
      { id: 6, label: "6 bulan prabayar", months: 6, total: 840000, perMonth: 140000, save: "hemat 15%", renew: "9 Januari 2027", note: "Setara Rp 140.000/bln" },
    ],
    payNote: "Belum bisa BPJS atau asuransi swasta — pembayaran mandiri. Pengiriman gratis, nama pengirim netral.",
  },
  mental: {
    title: "Kesehatan Mental",
    unit: "Konseling dengan psikolog + pendampingan, dan perawatan dokter bila tepat.",
    tiers: [
      { id: 1, label: "Bulanan", months: 1, total: 149000, perMonth: 149000, save: null, renew: "9 Agustus 2026", note: "Fleksibel — jeda atau berhenti kapan saja" },
      { id: 3, label: "3 bulan prabayar", months: 3, total: 420000, perMonth: 140000, save: "hemat 6%", renew: "9 Oktober 2026", note: "Setara Rp 140.000/bln" },
      { id: 6, label: "6 bulan prabayar", months: 6, total: 780000, perMonth: 130000, save: "hemat 13%", renew: "9 Januari 2027", note: "Setara Rp 130.000/bln" },
    ],
    payNote: "Sesi konseling online, rahasia. Bisa dijeda kapan saja — tidak ada tagihan saat dijeda.",
  },
};

export function CheckoutScreen({ onPaid, category = "bb" }) {
  const plan = PLANS[category] || PLANS.bb;
  const [term, setTerm] = React.useState(1); // monthly default — no pre-selected upsell
  const [method, setMethod] = React.useState("qris");
  const [wa, setWa] = React.useState(false);
  const tier = plan.tiers.find((t) => t.id === term) || plan.tiers[0];

  const METHODS = [
    ["qris", "QRIS", "Scan dari aplikasi bank atau e-wallet apa pun"],
    ["gopay", "GoPay", null],
    ["ovo", "OVO", null],
    ["va", "Transfer bank (Virtual Account)", "BCA, Mandiri, BNI, BRI"],
    ["card", "Kartu kredit / debit", null],
  ];

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 550, lineHeight: 1.15 }}>Pembayaran</h1>

      {/* Order summary — pinned first, reflects the chosen cadence */}
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{plan.title} · {tier.label.toLowerCase()}</span>
          <span style={{ fontSize: 15, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>{rupiah(tier.total)}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          {plan.unit}{tier.months > 1 ? ` ${tier.note}.` : ""}
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-meta)", lineHeight: 1.55, borderTop: "var(--border-hairline)", paddingTop: 10 }}>
          {plan.payNote}
        </p>
      </div>

      {/* Billing cadence — monthly first & pre-selected; savings are opt-in */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pilih ritme pembayaran</p>
        {plan.tiers.map((t) => (
          <OptionCard
            key={t.id}
            label={t.save ? `${t.label} · ${t.save}` : t.label}
            description={`${rupiah(t.total)}${t.months > 1 ? ` · ${t.note}` : " · " + t.note}`}
            selected={term === t.id}
            onSelect={() => setTerm(t.id)}
          />
        ))}
        <p style={{ margin: "2px 2px 0", fontSize: 12.5, color: "var(--text-meta)", lineHeight: 1.5 }}>
          Mulai dari bulanan tanpa komitmen. Naik ke prabayar kapan pun kamu yakin — tidak ada yang dipilih otomatis untukmu.
        </p>
      </div>

      {/* Payment methods */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Metode pembayaran</p>
        {METHODS.map(([id, label, desc]) => (
          <OptionCard key={id} label={label} description={desc || undefined} selected={method === id} onSelect={() => setMethod(id)} />
        ))}
      </div>

      <ConsentCheckbox checked={wa} onChange={setWa}>
        Kirim pembaruan pesanan dan pengingat dosis lewat WhatsApp. Bisa dimatikan kapan saja.
      </ConsentCheckbox>

      {/* Renewal honesty — bold, BEFORE the button, reflects the chosen cadence */}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", fontFeatureSettings: "var(--numeric-tabular)" }}>
        <strong>Perpanjangan otomatis: {rupiah(tier.total)} pada {tier.renew}.</strong>{" "}
        <span style={{ color: "var(--text-secondary)" }}>Jeda atau berhenti kapan saja dari halaman akunmu — jeda menahan pengiriman & tagihan, berhenti mengakhirinya. Kami ingatkan lewat email 7 hari sebelumnya.</span>
      </p>

      <Button size="lg" fullWidth onClick={onPaid}>Bayar {rupiah(tier.total)}</Button>
      <p style={{ margin: "-6px 0 0", fontSize: 12.5, color: "var(--text-meta)", textAlign: "center" }}>
        Dikirim dengan nama pengirim netral — tidak ada label kesehatan di paket.
      </p>
    </div>
  );
}
