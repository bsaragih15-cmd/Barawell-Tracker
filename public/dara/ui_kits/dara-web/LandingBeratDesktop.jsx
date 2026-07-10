import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { TierCard } from "../../components/commerce/TierCard.jsx";
import { MedicationCard } from "../../components/commerce/MedicationCard.jsx";
import { PriceAnchorCard } from "../../components/commerce/PriceAnchorCard.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Testimonials } from "../../components/content/Testimonials.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Berat Badan (desktop, max 1100px). Editorial pacing:
   2-col hero with graded product photo, two-tier module, med choice,
   oversized honest stat, price anchor, testimonials. */
export function LandingBeratDesktop({ onStartQuiz }) {
  const wrap = { maxWidth: "var(--measure-page)", margin: "0 auto", padding: "0 32px" };
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 };
  const [pref, setPref] = React.useState(null);

  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)" }}>
      <header style={{ borderBottom: "var(--border-hairline)" }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.015em" }}>Dara</span>
          <span style={{ fontSize: 14, color: "var(--text-meta)" }}>Program Berat Badan</span>
        </div>
      </header>

      {/* Hero — 2 col */}
      <section>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, alignItems: "center", padding: "56px 32px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-hero)", fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: "var(--leading-display)" }}>
              Turun berat dengan dokter di sisimu.
            </h1>
            <p style={{ margin: 0, fontSize: "var(--text-body-lg)", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "46ch" }}>
              Obat GLP-1 terdaftar BPOM, dosis diatur bertahap, dan dokter yang sama mendampingimu tiap bulan. Bukan sekadar beli obat.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button size="lg" onClick={onStartQuiz} style={{ whiteSpace: "nowrap" }}>Cek apakah aku memenuhi syarat</Button>
            </div>
            <p style={{ margin: "-8px 0 0", fontSize: 13, color: "var(--text-meta)" }}>±5 menit · gratis · tanpa komitmen</p>
          </div>
          <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: "var(--radius-card)", overflow: "hidden", border: "1px solid rgba(255,247,239,.6)", boxShadow: "0 30px 60px rgba(58,42,32,.16)" }}>
            <img src="../../assets/tile-mounjaro.jpg" alt="Pen Mounjaro® (tirzepatide)" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "sepia(.22) saturate(.92) contrast(.97) brightness(1.03)" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(228,176,134,.18), rgba(196,85,59,.08))", mixBlendMode: "multiply", pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Two tiers + med choice */}
      <section style={{ background: "var(--surface-band)" }}>
        <div style={{ ...wrap, padding: "56px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={h2}>Dua obat — kamu tidak memilih sendirian.</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>Dokter menyesuaikan obat dan dosis dengan tubuh serta tujuanmu. Tandai preferensimu — <strong style={{ color: "var(--text-primary)" }}>pilihan akhir ditentukan doktermu</strong>.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <MedicationCard name="Wegovy®" molecule="semaglutide" cadence="1× / minggu" results="hingga ±15%" priceLabel="Rp 3.900.000/bln" selected={pref === "wegovy"} onSelect={() => setPref("wegovy")} />
            <MedicationCard name="Mounjaro®" molecule="tirzepatide" cadence="1× / minggu" results="hingga ±20%" priceLabel="Rp 3.900.000/bln" selected={pref === "mounjaro"} onSelect={() => setPref("mounjaro")} />
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-meta)" }}>Ozempic® tidak ditawarkan untuk berat badan (indikasinya diabetes tipe 2). Angka hasil dari uji klinis; hasil tiap orang berbeda.</p>
        </div>
      </section>

      {/* Editorial stat + doctor quote — 2 col */}
      <section>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "center", padding: "64px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={h2}>Hasil yang realistis, bukan janji.</h2>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: 112, fontWeight: 600, lineHeight: 0.95, letterSpacing: "-0.02em", fontFeatureSettings: "var(--numeric-tabular)" }}>
              5–10<span style={{ fontSize: 52, color: "var(--dara-terracotta)" }}>%</span>
            </p>
            <div aria-hidden="true" style={{ height: 3, width: 84, background: "var(--dara-sage)", borderRadius: 2 }} />
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "38ch" }}>
              penurunan berat badan dalam 3–6 bulan pertama pada kebanyakan orang, berdasarkan uji klinis GLP-1.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, borderLeft: "1px solid var(--dara-line)", paddingLeft: 40 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontStyle: "italic", fontWeight: 500, lineHeight: 1.4 }}>
              “Yang paling sering kudengar: ternyata bukan aku yang kurang disiplin. Begitu biologinya ditangani, semuanya masuk akal.”
            </p>
            <DoctorCard compact name="dr. Ratna Wijaya" specialty="Dokter umum · program berat badan" str="31.2.1.404.221" />
          </div>
        </div>
      </section>

      {/* Price anchor */}
      <section style={{ background: "var(--surface-band)" }}>
        <div style={{ ...wrap, padding: "56px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={h2}>Hitung sendiri — transparan.</h2>
          <PriceAnchorCard
            left={{ eyebrow: "Beli obat sendiri di apotek", price: "±Rp 3.100.000/pen", note: "Tanpa pendampingan, tanpa pengaturan dosis, cari resep sendiri" }}
            right={{ eyebrow: "Program Dara", price: "Rp 3.900.000/bln", note: "Dokter, pendampingan & pengaturan dosis termasuk" }}
          />
        </div>
      </section>

      <Testimonials style={{ background: "var(--surface-page)" }} />

      {/* FAQ */}
      <section style={{ background: "var(--surface-band)" }}>
        <div style={{ ...wrap, padding: "56px 32px", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48 }}>
          <h2 style={h2}>Pertanyaan yang sering muncul</h2>
          <FAQAccordion
            items={[
              { q: "Apakah aku pasti dapat resep?", a: "Tidak. Dokter hanya meresepkan bila aman dan sesuai untukmu — sekitar 1 dari 5 pendaftar diarahkan ke jalur lain. Itu justru tanda prosesnya serius." },
              { q: "Bagaimana kalau aku mual?", a: "Mual ringan umum di minggu awal. Ada cek gejala di portal: dokter menilai, bisa menahan dosis, dan kamu tidak menebak sendiri." },
              { q: "Paketnya terlihat seperti apa?", a: "Kotak polos berpendingin, nama pengirim netral, tanpa label kesehatan." },
            ]}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
