import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { ArticleCard } from "../../components/content/ArticleCard.jsx";
import { Footer } from "../../components/content/Footer.jsx";
import { Icon } from "../../components/icons/Icon.jsx";

/* Dara — Home (desktop, max 1100px). Same content system as mobile home,
   composed for width: 2-col hero, 4-col how-it-works, 3-col articles. */
export function HomeDesktop({ onStartQuiz, onCategory }) {
  const wrap = { maxWidth: "var(--measure-page)", margin: "0 auto", padding: "0 32px" };
  const go = (id) => (onCategory || onStartQuiz)(id);
  const catCard = (id, title, desc, price, feature = false) => (
    <button
      className="dara-lift"
      onClick={() => go(id)}
      style={{
        display: "flex", flexDirection: feature ? "row" : "column", alignItems: feature ? "center" : "flex-start", justifyContent: feature ? "space-between" : "flex-start", gap: feature ? 16 : 8,
        width: "100%", height: "100%", textAlign: "left", boxSizing: "border-box",
        background: "var(--surface-card-tint)", border: "var(--border-hairline)",
        borderRadius: "var(--radius-card)", padding: "28px", cursor: "pointer", fontFamily: "var(--font-ui)",
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: feature ? 26 : 20, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</span>
        <span style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55 }}>{desc}</span>
        <span style={{ marginTop: 2, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>mulai {price}/bln</span>
      </span>
      {feature && <span style={{ color: "var(--dara-terracotta)", display: "flex" }}><Icon name="arrow-right" size={24} /></span>}
    </button>
  );
  const step = (n, title, desc) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid var(--dara-terracotta)", color: "var(--dara-terracotta)", background: "var(--dara-terracotta-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)" }}>{n}</span>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <header style={{ borderBottom: "var(--border-hairline)" }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.015em" }}>Dara</span>
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {["Berat badan", "Kulit", "Rambut", "Kesehatan mental", "Artikel"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 15, color: "var(--text-secondary)", textDecoration: "none" }}>{l}</a>
            ))}
            <Button variant="secondary" style={{ minHeight: 40, padding: "8px 18px" }}>Masuk</Button>
          </nav>
        </div>
      </header>

      {/* Hero — 2 col */}
      <section>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, alignItems: "center", padding: "64px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-hero)", fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: "var(--leading-display)" }}>
              Kesehatanmu, aturanmu.
            </h1>
            <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "46ch" }}>
              Konsultasi dokter, obat terdaftar BPOM, dan pendampingan — semua dari rumah, dikirim diskret.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button size="lg" onClick={onStartQuiz} style={{ whiteSpace: "nowrap" }}>Mulai kuis kesehatan</Button>
              <Button size="lg" variant="secondary" style={{ whiteSpace: "nowrap" }}>Lihat cara kerja</Button>
            </div>
          </div>
          <div
            style={{
              position: "relative", aspectRatio: "4 / 5", borderRadius: "var(--radius-card)", overflow: "hidden",
              border: "1px solid rgba(255,247,239,.6)", boxShadow: "0 30px 60px rgba(58,42,32,.16)",
            }}
          >
            <style>{`@keyframes dara-hd-spin{to{transform:rotate(360deg)}}`}</style>
            <img
              src="../../assets/tile-mounjaro.jpg"
              alt="Pen Mounjaro® (tirzepatide)"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "sepia(.22) saturate(.92) contrast(.97) brightness(1.03)" }}
            />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(228,176,134,.18), rgba(196,85,59,.08))", mixBlendMode: "multiply", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "9%", bottom: "8%", width: 104, height: 104, animation: "dara-hd-spin 18s linear infinite" }}>
              <svg viewBox="0 0 100 100" width="104" height="104" aria-hidden="true">
                <defs><path id="dara-hd-badge" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
                <text fill="#B85539" style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, letterSpacing: "2.5px" }}>
                  <textPath href="#dara-hd-badge" startOffset="0">DOSIS TINGGI • BARU • DOSIS TINGGI • BARU • </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — Berat feature + 2×2 grid */}
      <section>
        <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 16, paddingBottom: 64 }}>
          {catCard("bb", "Berat badan", "Turun berat dengan dokter di sisimu — jalur GLP-1 atau oral.", "Rp 1.200.000", true)}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {catCard("kulit", "Kulit", "Formula resep untuk jerawat, flek, dan tanda usia.", "Rp 160.000")}
            {catCard("rambut", "Rambut", "Hentikan rontok lebih awal, diracik dokter.", "Rp 140.000")}
          </div>
          {catCard("mental", "Kesehatan Mental", "Kelola cemas dan tidur, ditemani psikolog.", "Rp 149.000")}
        </div>
      </section>

      {/* How it works — 4 col on blush band */}
      <section style={{ background: "var(--surface-band)" }}>
        <div style={{ ...wrap, padding: "56px 32px" }}>
          <h2 style={{ margin: "0 0 32px", fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550 }}>Empat langkah, tanpa antre.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {step(1, "Isi kuis kesehatan", "±5 menit, gratis, tanpa janji temu.")}
            {step(2, "Dokter meninjau jawabanmu", "Balasan dalam 1×24 jam lewat pesan.")}
            {step(3, "Terima rencana & harga transparan", "Kamu putuskan — tidak ada tagihan tersembunyi.")}
            {step(4, "Pengiriman diskret tiap bulan", "Nama pengirim netral, bisa dijeda kapan saja.")}
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Articles — 3 col */}
      <section>
        <div style={{ ...wrap, padding: "56px 32px" }}>
          <h2 style={{ margin: "0 0 24px", fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550 }}>Pelajari dulu, putuskan kemudian.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <ArticleCard category="Berat badan" title="Kenapa berat badan bukan soal kemauan keras" excerpt="Yang dikatakan sains tentang hormon lapar — dan kenapa obat bisa membantu." reviewer="dr. Ratna Wijaya" imageLabel="foto: sarapan, natural light" />
            <ArticleCard category="Kulit" title="Retinoid untuk pemula: mulai pelan, menang pelan" excerpt="Cara memakai bahan aktif resep tanpa membuat kulitmu kaget — dan kapan hasilnya terlihat." reviewer="dr. Sinta Halim" imageLabel="foto: strip pil, latar tekstur" />
            <ArticleCard category="Berat badan" title="Minggu pertama dengan GLP-1: yang normal dan yang tidak" excerpt="Mual ringan itu umum. Ini cara membedakannya dari tanda yang perlu dokter." reviewer="dr. Ratna Wijaya" imageLabel="foto: pen di meja kayu" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
