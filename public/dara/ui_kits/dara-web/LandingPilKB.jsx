import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { SupplyMeter } from "../../components/journey/SupplyMeter.jsx";
import { PlanCard } from "../../components/commerce/PlanCard.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Pil KB (mobile). Zero euphemism, discretion up front,
   refill promise made concrete with the supply meter. */
export function LandingPilKB({ onStartQuiz }) {
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 };
  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Pil KB</span>
      </header>

      {/* Hero */}
      <section style={{ padding: "8px 20px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 38, fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: 1.08 }}>
          Pil KB diantar ke pintumu, tanpa antre apotek.
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Diresepkan dokter online, dikirim diskret tiap bulan, dan tidak pernah kehabisan. Mulai, ganti merek, atau lanjutkan pil yang sudah cocok.
        </p>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai konsultasi — gratis</Button>
        <p style={{ margin: "-6px 0 0", fontSize: 12.5, color: "var(--text-meta)", textAlign: "center" }}>±3 menit · tanpa video call · jawaban hanya dibaca dokter</p>
      </section>

      <TrustBar />

      {/* How it works */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={h2}>Tiga langkah, sekali saja.</h2>
        <StepTimeline
          steps={[
            { title: "Ceritakan kebutuhanmu", description: "Riwayat singkat: tekanan darah, migrain, merokok, pil sebelumnya.", state: "done" },
            { title: "Dokter memilihkan pil yang aman", description: "Kombinasi atau progestin — dijelaskan kenapa, dalam 1×24 jam.", state: "done" },
            { title: "Diantar tiap bulan, otomatis", description: "Gratis ongkir, bisa dijeda kapan saja.", state: "done" },
          ]}
        />
      </section>

      {/* Never run out */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Tidak akan kehabisan di hari ke-28.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Portalmu menghitung sisa pilmu. Strip berikutnya dikirim otomatis 6 hari sebelum habis — kamu tinggal melanjutkan.
        </p>
        <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "var(--space-25)" }}>
          <SupplyMeter totalDays={28} remainingDays={5} refillDate="15 Juli 2026" />
        </div>
      </section>

      {/* Discretion */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Urusanmu, bukan urusan kurir.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Amplop polos, nama pengirim netral, tanpa label kesehatan. Tagihan di rekening tertulis nama perusahaan umum. Kontrasepsi itu perawatan kesehatan — dan privasimu bagian darinya.
        </p>
      </section>

      {/* Price */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Satu harga, sudah semua.</h2>
        <PlanCard
          planName="Langganan Pil KB"
          medication="Pil kombinasi atau progestin — dipilih doktermu"
          features={["Konsultasi & ganti merek kapan saja", "Pengiriman diskret tiap bulan, gratis ongkir", "Pengingat harian lewat WhatsApp (opsional)"]}
          prices={{ 1: { perMonth: 135000 }, 3: { perMonth: 125000, total: 375000, savings: "hemat 7%" }, 6: { perMonth: 115000, total: 690000, savings: "hemat 15%" } }}
          defaultTerm={1}
        />
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Pertanyaan yang sering muncul</h2>
        <FAQAccordion
          items={[
            { q: "Aku belum pernah pakai pil KB. Aman?", a: "Dokter memeriksa riwayatmu dulu — tekanan darah, migrain dengan aura, merokok, usia. Kalau pil bukan pilihan aman, dokter bilang terus terang dan menyarankan alternatif." },
            { q: "Bisa pakai pil yang sudah biasa kupakai?", a: "Bisa. Sebutkan mereknya di konsultasi — kalau aman dilanjutkan, dokter meresepkan yang sama." },
            { q: "Apakah butuh persetujuan siapa pun?", a: "Tidak. Kamu berusia 18+, ini keputusanmu. Jawaban kuismu hanya dibaca tim medis." },
            { q: "Kalau aku telat minum satu pil?", a: "Portal punya panduan langkah demi langkah sesuai jenis pilmu, dan kamu bisa tanya dokter langsung lewat pesan." },
          ]}
        />
      </section>

      <Footer />

      <div style={{ position: "sticky", bottom: 0, padding: "12px 20px 16px", background: "var(--surface-page)", borderTop: "var(--border-hairline)" }}>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai konsultasi — gratis</Button>
      </div>
    </div>
  );
}
