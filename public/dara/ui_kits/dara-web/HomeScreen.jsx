import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { ArticleCard } from "../../components/content/ArticleCard.jsx";
import { Footer } from "../../components/content/Footer.jsx";
import { Testimonials } from "../../components/content/Testimonials.jsx";
import { Icon } from "../../components/icons/Icon.jsx";
import { HeroAnimation } from "./HeroAnimation.jsx";

/* Dara — Home (mobile). One screen = one idea:
   editorial hero → the two-category decision → how-it-works → trust → articles. */
export function HomeScreen({ onStartQuiz, onCategory }) {
  const go = (id) => (onCategory || onStartQuiz)(id);
  const catCard = (id, title, desc, price, feature = false) => (
    <button
      className="dara-lift"
      onClick={() => go(id)}
      style={{
        display: "flex",
        flexDirection: feature ? "row" : "column",
        alignItems: feature ? "center" : "flex-start",
        justifyContent: feature ? "space-between" : "flex-start",
        gap: feature ? 12 : 6,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        background: "var(--surface-card-tint)",
        border: "var(--border-hairline)",
        borderRadius: "var(--radius-card)",
        padding: feature ? "22px" : "18px",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: feature ? 22 : 17, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</span>
        <span style={{ fontSize: feature ? 14 : 12.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{desc}</span>
        <span style={{ marginTop: 2, fontSize: 12, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>mulai {price}/bln</span>
      </span>
      {feature && <span style={{ color: "var(--dara-terracotta)", display: "flex" }}><Icon name="arrow-right" size={22} /></span>}
    </button>
  );

  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em" }}>Dara</span>
        <Button variant="secondary" style={{ minHeight: 40, padding: "8px 16px" }}>Masuk</Button>
      </header>

      {/* Hero — animated: floating Ozempic pen + rotating gold badge (HeroAnimation, blush variant) */}
      <HeroAnimation onStartQuiz={onStartQuiz} frameHeight={700} />

      {/* Category decision — Berat feature card + 2×2 grid */}
      <section style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {catCard("bb", "Berat badan", "Turun berat dengan dokter di sisimu — jalur GLP-1 atau oral.", "Rp 1.200.000", true)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {catCard("kulit", "Kulit", "Formula resep untuk jerawat & flek.", "Rp 160.000")}
          {catCard("rambut", "Rambut", "Hentikan rontok lebih awal.", "Rp 140.000")}
        </div>
        {catCard("mental", "Kesehatan Mental", "Kelola cemas dan tidur, ditemani.", "Rp 149.000")}
      </section>

      {/* How it works */}
      <section style={{ background: "var(--surface-band)", padding: "40px 20px" }}>
        <h2 style={{ margin: "0 0 24px", fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: "var(--leading-heading)" }}>
          Empat langkah, tanpa antre.
        </h2>
        <StepTimeline
          steps={[
            { title: "Isi kuis kesehatan", description: "±5 menit, gratis, tanpa janji temu.", state: "done" },
            { title: "Dokter meninjau jawabanmu", description: "Balasan dalam 1×24 jam lewat pesan.", state: "done" },
            { title: "Terima rencana & harga transparan", description: "Kamu putuskan — tidak ada tagihan tersembunyi.", state: "done" },
            { title: "Pengiriman diskret tiap bulan", description: "Nama pengirim netral, bisa dijeda kapan saja.", state: "done" },
          ]}
        />
      </section>

      <TrustBar />

      {/* Articles */}
      <section style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550 }}>
          Pelajari dulu, putuskan kemudian.
        </h2>
        <ArticleCard
          category="Berat badan"
          title="Kenapa berat badan bukan soal kemauan keras"
          excerpt="Yang dikatakan sains tentang hormon lapar — dan kenapa obat bisa membantu."
          reviewer="dr. Ratna Wijaya"
          imageLabel="foto: sarapan, natural light"
        />
        <ArticleCard
          category="Kulit"
          title="Retinoid untuk pemula: mulai pelan, menang pelan"
          excerpt="Cara memakai bahan aktif resep tanpa membuat kulitmu kaget — dan kapan hasilnya terlihat."
          reviewer="dr. Sinta Halim"
          imageLabel="foto: strip pil, latar tekstur"
        />
      </section>

      <Testimonials />

      <Footer />
    </div>
  );
}
