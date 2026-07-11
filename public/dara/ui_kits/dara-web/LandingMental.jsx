import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Kesehatan Mental (mobile). Calmest surface in the brand:
   muted blush, extra whitespace, slower rhythm, no progress gamification.
   Two tracks (Cemas / Tidur). Copy stays within "membantu mengelola" —
   never "menyembuhkan". No benzodiazepine/zolpidem naming. No crisis
   routing per project decision. */
export function LandingMental({ onStartQuiz }) {
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.25 };
  const track = (name, desc, price) => (
    <button
      className="dara-lift"
      onClick={onStartQuiz}
      style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", width: "100%", boxSizing: "border-box", background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "22px", cursor: "pointer", fontFamily: "var(--font-ui)" }}
    >
      <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>{name}</span>
      <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{desc}</span>
      <span style={{ marginTop: 4, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>mulai {price}/bln</span>
    </button>
  );

  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Kesehatan Mental</span>
      </header>

      {/* Hero — softer, muted blush, generous space */}
      <section style={{ background: "var(--surface-band)", padding: "44px 24px 48px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 550, letterSpacing: "var(--tracking-display)", lineHeight: 1.18 }}>
          Ruang untuk merasa lebih baik, pelan-pelan.
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.7, color: "var(--text-secondary)" }}>
          Konseling dan, bila tepat, perawatan dari dokter — untuk cemas dan sulit tidur. Tanpa buru-buru, tanpa dihakimi.
        </p>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai dari cerita kamu</Button>
        <p style={{ margin: "-4px 0 0", fontSize: 12.5, color: "var(--text-meta)" }}>±5 menit · rahasia · ditinjau psikolog atau dokter</p>
      </section>

      {/* Two tracks */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Mulai dari yang paling terasa.</h2>
        {track("Cemas", "Pikiran yang sulit tenang, khawatir berlebih, jantung berdebar. Belajar mengelolanya dengan pendampingan.", "Rp 149.000")}
        {track("Tidur", "Susah mulai tidur atau sering terbangun. Pendekatan yang menata ulang tidurmu — bukan sekadar obat.", "Rp 149.000")}
      </section>

      <TrustBar />

      {/* How it works — calm, no progress bar language */}
      <section style={{ background: "var(--surface-band)", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
        <h2 style={h2}>Bagaimana jalannya</h2>
        <StepTimeline
          steps={[
            { title: "Ceritakan yang kamu rasakan", description: "Beberapa pertanyaan lembut, sesuai kecepatanmu.", state: "done" },
            { title: "Ditinjau psikolog atau dokter", description: "Dalam 1×24 jam, lewat pesan — bukan robot.", state: "done" },
            { title: "Rencana yang pas untukmu", description: "Konseling, perawatan, atau keduanya — kamu yang setuju.", state: "done" },
            { title: "Ditemani tiap minggu", description: "Check-in singkat dan pesan kapan kamu butuh.", state: "done" },
          ]}
        />
      </section>

      {/* Reassurance */}
      <section style={{ padding: "40px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Jujur soal apa yang bisa kami bantu.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)" }}>
          Kami membantu kamu <strong style={{ color: "var(--text-primary)" }}>mengelola</strong> cemas dan tidur — bukan menjanjikan “sembuh total”. Untuk tidur, kami mengutamakan pendekatan yang tidak menimbulkan ketergantungan sebelum mempertimbangkan obat. Jawaban kuismu rahasia dan hanya dibaca tim medis.
        </p>
      </section>

      <section style={{ background: "var(--surface-band)", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Pertanyaan yang sering muncul</h2>
        <FAQAccordion
          items={[
            { q: "Apakah aku akan langsung diberi obat?", a: "Belum tentu. Banyak yang mulai dengan konseling saja. Kalau obat dipertimbangkan, dokter menjelaskan pilihan dan alasannya — dan untuk tidur kami menghindari obat yang berisiko ketergantungan." },
            { q: "Ini rahasia, kan?", a: "Ya. Jawaban dan sesimu privat, hanya kamu dan tim medis. Paket pengingat pun tanpa label." },
            { q: "Bisa hanya konseling tanpa obat?", a: "Bisa sepenuhnya. Kamu yang memutuskan, bersama psikolog atau doktermu." },
          ]}
        />
      </section>

      <Footer />

      <div style={{ position: "sticky", bottom: 0, padding: "12px 20px 16px", background: "var(--surface-page)", borderTop: "var(--border-hairline)" }}>
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai dari cerita kamu</Button>
      </div>
    </div>
  );
}
