import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { PhotoCompare } from "../../components/journey/PhotoCompare.jsx";
import { PlanCard } from "../../components/commerce/PlanCard.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Kulit (mobile). Slow-results category, so the progress
   photo log is the hero moment. Honest timelines, zero shame. */
export function LandingKulit({ onStartQuiz }) {
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 };
  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Kulit</span>
      </header>

      <section style={{ padding: "8px 20px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 38, fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: 1.08 }}>
          Kulit yang kamu rawat, bukan yang kamu tutupi.
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Formula resep diracik dokter untuk jerawat, flek hitam, dan tanda usia — disesuaikan tiap bulan, diantar diskret.
        </p>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai konsultasi — gratis</Button>
        <p style={{ margin: "-6px 0 0", fontSize: 12.5, color: "var(--text-meta)", textAlign: "center" }}>±4 menit · tanpa video call · jawaban hanya dibaca dokter</p>
      </section>

      <TrustBar />

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={h2}>Tiga langkah, satu formula untukmu.</h2>
        <StepTimeline
          steps={[
            { title: "Ceritakan kondisi kulitmu", description: "Jenis kulit, keluhan, produk yang sedang dipakai.", state: "done" },
            { title: "Dokter meracik formula resep", description: "Bahan aktif dipilih untuk kulitmu — dijelaskan, dalam 1×24 jam.", state: "done" },
            { title: "Diantar & disesuaikan tiap bulan", description: "Kekuatan dinaikkan bertahap sesuai reaksi kulitmu.", state: "done" },
          ]}
        />
      </section>

      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Perubahan kulit itu pelan — makanya kami rekam.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Tiap bulan portalmu mengingatkan ambil satu foto. Geser untuk melihat perkembanganmu sendiri — pengingat lembut bahwa kamu sedang maju.
        </p>
        <PhotoCompare beforeLabel="Bulan 1" afterLabel="Bulan 3" />
      </section>

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Sabar itu bagian dari resepnya.</h2>
        <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "var(--space-25)" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)" }}>8–12 minggu</p>
          <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            sebelum perubahan terlihat jelas pada kebanyakan orang. Minggu-minggu awal kulit bisa menyesuaikan diri (kering atau breakout ringan) — itu umum, dan dokter memantaunya bersamamu.
          </p>
        </div>
      </section>

      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Satu harga, sudah diracik.</h2>
        <PlanCard
          planName="Rutin Kulit Kustom"
          medication="Formula resep diracik dokter"
          features={["Konsultasi & penyesuaian formula tiap bulan", "Pengiriman diskret, gratis ongkir", "Pengingat foto & rutinitas di portal"]}
          prices={{ 1: { perMonth: 189000 }, 3: { perMonth: 175000, total: 525000, savings: "hemat 7%" }, 6: { perMonth: 160000, total: 960000, savings: "hemat 15%" } }}
          defaultTerm={1}
        />
      </section>

      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Pertanyaan yang sering muncul</h2>
        <FAQAccordion
          items={[
            { q: "Apa formulaku sama dengan orang lain?", a: "Tidak. Dokter memilih bahan aktif dan kekuatannya sesuai kondisimu — bisa berubah tiap bulan mengikuti reaksi kulitmu." },
            { q: "Aman untuk ibu hamil atau menyusui?", a: "Beberapa bahan (mis. retinoid) tidak dianjurkan saat hamil/menyusui. Sebutkan di konsultasi — dokter meracik yang aman atau menyarankan menunda." },
            { q: "Kulitku malah breakout di awal, normal?", a: "Sering terjadi saat kulit menyesuaikan diri. Ada cek gejala di portal; dokter bisa menurunkan kekuatan formula bila perlu." },
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
