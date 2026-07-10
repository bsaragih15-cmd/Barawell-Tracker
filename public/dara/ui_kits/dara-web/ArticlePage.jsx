import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { ArticleCard } from "../../components/content/ArticleCard.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — article template (mobile). Editorial serif, medically-reviewed
   byline up top, clinical sources at the bottom, one quiet CTA. */
export function ArticlePage({ onStartQuiz }) {
  const prose = { margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--text-primary)", maxWidth: "62ch" };
  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Artikel</span>
      </header>

      <article style={{ padding: "8px 20px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
        <p style={{ margin: 0, fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--dara-terracotta)" }}>Berat badan</p>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 550, lineHeight: 1.15, letterSpacing: "var(--tracking-display)" }}>
          Kenapa berat badan bukan soal kemauan keras
        </h1>

        {/* Byline — reviewed, dated, honest */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "var(--border-hairline)", borderBottom: "var(--border-hairline)", padding: "12px 0" }}>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Ditinjau secara medis oleh dr. Ratna Wijaya · STR 31.2.1.404.221
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-caption)", color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>
            Diperbarui 2 Juli 2026 · 6 menit baca
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{ aspectRatio: "16 / 9", borderRadius: "var(--radius-card)", border: "var(--border-hairline)", background: "repeating-linear-gradient(45deg, var(--dara-oat) 0 8px, var(--dara-blush) 8px 16px)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-meta)", background: "var(--surface-page)", padding: "3px 8px", borderRadius: 4 }}>foto: sarapan, natural light</span>
        </div>

        <p style={prose}>
          Kalau kamu pernah turun berat lalu naik lagi, itu bukan kegagalan karakter. Tubuhmu punya sistem hormon yang aktif melawan penurunan berat — dan sistem itu tidak peduli seberapa kuat tekadmu.
        </p>
        <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 550, lineHeight: 1.25 }}>Hormon lapar bekerja melawanmu</h2>
        <p style={prose}>
          Saat berat turun, kadar leptin (sinyal kenyang) ikut turun dan ghrelin (sinyal lapar) naik. Hasilnya: kamu lebih lapar justru ketika sedang paling disiplin. Penelitian menunjukkan efek ini bertahan lebih dari setahun setelah diet berakhir.
        </p>
        <p style={prose}>
          Obat golongan GLP-1 bekerja di titik ini — meniru hormon kenyang alami, memperlambat pengosongan lambung, dan meredakan "suara makanan" di kepala. Itu sebabnya obat ini efektif untuk banyak orang yang sudah mencoba segalanya.
        </p>
        <div style={{ background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-primary)" }}>
            <strong style={{ fontWeight: 600 }}>Intinya:</strong> obat mengatasi biologinya; kebiasaan makan dan gerak mengatasi sisanya. Program yang baik memasangkan keduanya — dengan dokter yang mengatur dosis.
          </p>
        </div>

        {/* Sources */}
        <div style={{ borderTop: "var(--border-hairline)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--text-meta)" }}>Sumber</p>
          <p style={{ margin: 0, fontSize: "var(--text-caption)", lineHeight: 1.6, color: "var(--text-meta)" }}>
            Wilding JPH, dkk. "Once-Weekly Semaglutide in Adults with Overweight or Obesity" (STEP 1). N Engl J Med, 2021. · Sumithran P, dkk. "Long-Term Persistence of Hormonal Adaptations to Weight Loss." N Engl J Med, 2011.
          </p>
        </div>

        {/* Quiet CTA */}
        <div style={{ background: "var(--surface-band)", borderRadius: "var(--radius-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 550, lineHeight: 1.3 }}>Penasaran apakah program ini cocok untukmu?</p>
          <Button size="lg" fullWidth onClick={onStartQuiz}>Cek dalam 5 menit — gratis</Button>
        </div>
      </article>

      <TrustBar />

      <section style={{ padding: "32px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 550 }}>Baca juga</p>
        <ArticleCard category="Berat badan" title="Minggu pertama dengan GLP-1: yang normal dan yang tidak" excerpt="Mual ringan itu umum. Ini cara membedakannya dari tanda yang perlu dokter." reviewer="dr. Ratna Wijaya" imageLabel="foto: pen di meja kayu" />
      </section>

      <Footer />
    </div>
  );
}
