import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { PhotoCompare } from "../../components/journey/PhotoCompare.jsx";
import { PlanCard } from "../../components/commerce/PlanCard.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Rambut (mobile). Same slow-results rhythm as Kulit;
   the shedding phase is named honestly so no one panics and quits early. */
export function LandingRambut({ onStartQuiz }) {
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 };
  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Rambut</span>
      </header>

      <section style={{ padding: "8px 20px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 38, fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: 1.08 }}>
          Rambut rontok bisa dihentikan — makin cepat, makin baik.
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Perawatan resep untuk penipisan rambut, diracik dokter dan dikirim diskret tiap bulan. Mulai sedini mungkin memberi hasil terbaik.
        </p>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai konsultasi — gratis</Button>
        <p style={{ margin: "-6px 0 0", fontSize: 12.5, color: "var(--text-meta)", textAlign: "center" }}>±4 menit · tanpa video call · jawaban hanya dibaca dokter</p>
      </section>

      <TrustBar />

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={h2}>Tiga langkah, tanpa ke klinik.</h2>
        <StepTimeline
          steps={[
            { title: "Ceritakan pola rontokmu", description: "Sejak kapan, di bagian mana, riwayat keluarga.", state: "done" },
            { title: "Dokter memilih perawatan", description: "Topikal atau kombinasi — dijelaskan kenapa, dalam 1×24 jam.", state: "done" },
            { title: "Diantar & dipantau tiap bulan", description: "Foto perkembangan ditinjau, rencana disesuaikan.", state: "done" },
          ]}
        />
      </section>

      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Lihat sendiri, sehelai demi sehelai.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Foto bulanan di portalmu jadi bukti yang jujur — perubahan yang sulit dilihat di cermin tiap hari.
        </p>
        <PhotoCompare beforeLabel="Bulan 1" afterLabel="Bulan 4" />
      </section>

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Rontok sementara di awal itu wajar.</h2>
        <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "var(--space-25)" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)" }}>3–6 bulan</p>
          <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            sampai hasil terlihat. Di minggu-minggu awal kadang rontok justru bertambah sebentar (shedding) — itu tanda siklus rambut sedang me-reset, bukan gagal. Dokter menemanimu melewatinya.
          </p>
        </div>
      </section>

      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Satu harga, sudah diracik.</h2>
        <PlanCard
          planName="Rutin Rambut Kustom"
          medication="Perawatan resep diracik dokter"
          features={["Konsultasi & penyesuaian tiap bulan", "Pengiriman diskret, gratis ongkir", "Pengingat foto & rutinitas di portal"]}
          prices={{ 1: { perMonth: 165000 }, 3: { perMonth: 152000, total: 456000, savings: "hemat 8%" }, 6: { perMonth: 140000, total: 840000, savings: "hemat 15%" } }}
          defaultTerm={1}
        />
      </section>

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Pertanyaan yang sering muncul</h2>
        <FAQAccordion
          items={[
            { q: "Kalau berhenti, rontok lagi?", a: "Bisa, karena perawatan menahan proses yang sedang berjalan. Dokter membantu menyusun rencana jangka panjang yang masuk akal untukmu." },
            { q: "Aman untuk perempuan?", a: "Ya, ada perawatan rontok yang diformulasikan untuk perempuan. Dokter memilih yang sesuai — sebagian tidak untuk masa hamil/menyusui, sebutkan di konsultasi." },
            { q: "Rontokku makin banyak di awal, normal?", a: "Shedding sementara umum di 4–8 minggu pertama dan biasanya reda. Kalau berlanjut, kabari dokter lewat pesan." },
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
