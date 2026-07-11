import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { TrustBar } from "../../components/trust/TrustBar.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { PriceAnchorCard } from "../../components/commerce/PriceAnchorCard.jsx";
import { PlanCard } from "../../components/commerce/PlanCard.jsx";
import { TierCard } from "../../components/commerce/TierCard.jsx";
import { MedicationCard } from "../../components/commerce/MedicationCard.jsx";
import { FAQAccordion } from "../../components/content/FAQAccordion.jsx";
import { Testimonials } from "../../components/content/Testimonials.jsx";
import { Footer } from "../../components/content/Footer.jsx";

/* Dara — landing: Berat Badan (mobile). Alternating canvas/blush bands,
   every section ends near a quiz CTA, sticky bottom CTA. */
export function LandingBeratBadan({ onStartQuiz }) {
  const h2 = { margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 };
  const [pref, setPref] = React.useState(null);

  /* Hero background exploration — terang (bright, default) vs hangat (dark).
     Swatch toggle sits in the header so both can be compared live. */
  const HERO_THEMES = {
    terang: { bg: "radial-gradient(120% 92% at 50% 24%, #FCEFE7 0%, #F3E0D4 46%, #E2C0AA 100%)", beam: "linear-gradient(115deg, rgba(255,255,255,0) 34%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 66%)", header: "#FCEFE7", top: "#3A2A20", accent: "#C4553B", sub: "rgba(58,42,32,.8)", foot: "rgba(58,42,32,.55)", badge: "#B85539", onDark: false, shadow: "rgba(58,42,32,.3)" },
    hangat: { bg: "linear-gradient(168deg, #6B4A33 0%, #4A3222 46%, #2A1D12 100%)", beam: "linear-gradient(115deg, rgba(255,236,214,0) 34%, rgba(255,236,214,.22) 50%, rgba(255,236,214,0) 66%)", header: "#6B4A33", top: "#FFF7EF", accent: "#E4B086", sub: "rgba(255,247,239,.85)", foot: "rgba(255,247,239,.5)", badge: "#E4B086", onDark: true, shadow: "rgba(12,7,3,.55)" },
  };
  const [bgTheme, setBgTheme] = React.useState("terang");
  const t = HERO_THEMES[bgTheme];

  /* Hero hover-tilt — pen cluster leans toward the cursor (desktop pointer only). */
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const onStageMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: nx, y: ny });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  /* Stat count-up — animates 0→10 when the results stat scrolls into view. */
  const [statTop, setStatTop] = React.useState(0);
  const statRef = React.useRef(null);
  React.useEffect(() => {
    const el = statRef.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStatTop(10); return; }
    let raf, done = false;
    const run = () => {
      const t0 = performance.now(), dur = 1100;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        setStatTop(Math.round((1 - Math.pow(1 - p, 3)) * 10));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting && !done) { done = true; run(); io.disconnect(); } });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ background: "var(--surface-page)", fontFamily: "var(--font-ui)", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: t.header }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: t.top }}>Dara</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: t.foot }}>Program Berat Badan</span>
          <span style={{ display: "flex", gap: 6 }}>
            {[["terang", "#F3E0D4", "Latar terang"], ["hangat", "#4A3222", "Latar hangat"]].map(([id, swatch, label]) => (
              <button key={id} aria-label={label} aria-pressed={bgTheme === id} onClick={() => setBgTheme(id)} style={{ width: 18, height: 18, borderRadius: "50%", cursor: "pointer", background: swatch, border: bgTheme === id ? "2px solid " + t.accent : "1px solid var(--dara-line)", padding: 0 }} />
            ))}
          </span>
        </span>
      </header>

      {/* Hero — Hims-style: light beam, floating product cluster,
         centered copy, GLP-1 lineup rail at the bottom */}
      <section style={{ position: "relative", overflow: "hidden", background: t.bg, display: "flex", flexDirection: "column", gap: 0, transition: "background var(--dur-slow) var(--ease-out)" }}>
        {/* diagonal light beam */}
        <div aria-hidden="true" style={{ position: "absolute", inset: "-20%", background: t.beam, pointerEvents: "none" }} />

        <div style={{ position: "relative", padding: "26px 24px 0", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 550, letterSpacing: "var(--tracking-display)", lineHeight: 1.14, color: t.top }}>
            Terobosan berat badanmu{" "}
            <span style={{ color: t.accent }}>sudah tiba.</span>
          </h1>
        </div>

        {/* Floating product cluster — the three-pen studio shot, circled by the rotating badge */}
        <div onMouseMove={onStageMove} onMouseLeave={resetTilt} style={{ position: "relative", height: 356, margin: "6px 0 0", perspective: "900px" }}>
          <style>{`@keyframes dara-lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes dara-lp-spin{to{transform:rotate(360deg)}}`}</style>

          {/* rotating gold text ring — circles the whole cluster, passes behind the pens */}
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 320, height: 320, marginLeft: -160, marginTop: -160, transformOrigin: "center", animation: "dara-lp-spin 24s linear infinite", zIndex: 1, pointerEvents: "none" }}>
            <svg viewBox="0 0 100 100" width="320" height="320">
              <defs><path id="dara-lp-badge" d="M50,50 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text fill={t.badge} style={{ fontFamily: "var(--font-ui)", fontSize: 5.5, fontWeight: 700, letterSpacing: "1.4px" }}>
                <textPath href="#dara-lp-badge" startOffset="0">DOSIS TINGGI · BARU · DENGAN RESEP DOKTER · </textPath>
              </text>
            </svg>
          </div>

          {/* soft glow behind the pens */}
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 300, marginLeft: -150, marginTop: -150, borderRadius: "50%", background: t.onDark ? "radial-gradient(closest-side, rgba(255,239,216,.22), transparent)" : "radial-gradient(closest-side, rgba(255,255,255,.6), transparent)", zIndex: 1, pointerEvents: "none" }} />

          {/* the three-pen studio shot — floats as one, tilts toward the cursor */}
          <div style={{ position: "absolute", left: "50%", top: "50%", width: "86%", marginLeft: "-43%", transform: `translateY(-50%) rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 10}deg)`, transformStyle: "preserve-3d", transition: "transform .18s ease-out", zIndex: 2 }}>
            <img
              src="../../assets/pens-trio.png"
              alt="Pen Wegovy® (semaglutide), Ozempic® (semaglutide), Mounjaro® (tirzepatide)"
              style={{ display: "block", width: "100%", transform: "rotate(6deg)", filter: `drop-shadow(-14px 22px 26px ${t.shadow})`, animation: "dara-lp-float 6.5s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div style={{ position: "relative", padding: "14px 24px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: t.sub, maxWidth: "30ch" }}>
            Turun hingga <strong style={{ color: t.accent }}>25% berat badan</strong>* — dengan dokter di sisimu, kini dengan lebih banyak pilihan.
          </p>
          <Button size="lg" onClick={onStartQuiz} style={{ whiteSpace: "nowrap" }}>Mulai kuis kesehatan</Button>
        </div>

        {/* GLP-1 lineup rail */}
        <div style={{ position: "relative", padding: "4px 0 24px" }}>
          <p style={{ margin: "0 24px 12px", fontSize: 13.5, fontWeight: 600, color: t.onDark ? "rgba(255,247,239,.75)" : "var(--text-secondary)" }}>Jajaran GLP-1 kami</p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 24px 8px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {[
              { id: "wegovy", name: "Wegovy® Pen", mol: "semaglutide", price: "Rp 3.900.000/bln", tag: "Indikasi berat badan", img: "../../assets/pen-wegovy-3d.png" },
              { id: "mounjaro", name: "Mounjaro® KwikPen", mol: "tirzepatide", price: "Rp 3.900.000/bln", tag: "Indikasi berat badan", img: "../../assets/pen-mounjaro-3d.png" },
              { id: "ozempic", name: "Ozempic®", mol: "semaglutide", price: "dengan resep", tag: "Indikasi diabetes tipe 2", img: "../../assets/pen-ozempic-3d.png" },
            ].map((c) => (
              <div key={c.id} className="dara-lift" style={{ flex: "0 0 auto", width: 158, scrollSnapAlign: "start", background: t.onDark ? "rgba(255,247,239,.08)" : "var(--surface-card)", border: t.onDark ? "1px solid rgba(255,247,239,.16)" : "var(--border-hairline)", boxShadow: t.onDark ? "none" : "var(--shadow-card)", borderRadius: "var(--radius-card)", padding: 12, display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
                <div style={{ position: "relative", height: 96, borderRadius: 10, overflow: "hidden", background: t.onDark ? "rgba(255,247,239,.06)" : "var(--surface-card-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.img ? (
                    <img src={c.img} alt={c.name} style={{ maxWidth: "88%", maxHeight: "88%", objectFit: "contain", filter: `drop-shadow(0 8px 12px ${t.shadow})` }} />
                  ) : (
                    <image-slot id={"lineup-" + c.id} placeholder={"foto " + c.name} style={{ position: "absolute", inset: 0 }}></image-slot>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 650, color: t.onDark ? "#FFF7EF" : "var(--text-primary)", lineHeight: 1.25 }}>{c.name}</span>
                  <span style={{ fontSize: 11.5, color: t.onDark ? "rgba(255,247,239,.65)" : "var(--text-meta)" }}>{c.mol}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.accent, fontFeatureSettings: "var(--numeric-tabular)" }}>{c.price}</span>
                  <span style={{ marginTop: 3, alignSelf: "flex-start", fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", color: t.onDark ? "rgba(255,247,239,.7)" : "var(--text-secondary)", border: t.onDark ? "1px solid rgba(255,247,239,.25)" : "1px solid var(--dara-line)", borderRadius: "var(--radius-pill)", padding: "2px 7px" }}>{c.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "8px 24px 0", fontSize: 10.5, lineHeight: 1.5, color: t.foot }}>
            *Hingga 25% dalam uji klinis semaglutide dosis tinggi (72 minggu); hasil tiap orang berbeda. Ozempic® diresepkan hanya untuk diabetes tipe 2 — bukan program berat badan. Merek adalah milik pemiliknya; Dara tidak berafiliasi.
          </p>
        </div>
      </section>

      <TrustBar />

      {/* GLP-1 medication choice — Wegovy vs Mounjaro */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Dua obat — kamu tidak memilih sendirian.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Dokter menyesuaikan obat dan dosis dengan tubuh serta tujuanmu. Tandai preferensimu — <strong style={{ color: "var(--text-primary)" }}>pilihan akhir ditentukan doktermu</strong>.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <MedicationCard name="Wegovy®" molecule="semaglutide" cadence="1× / minggu" results="hingga ±15%" priceLabel="Rp 3.900.000/bln" selected={pref === "wegovy"} onSelect={() => setPref("wegovy")} />
          <MedicationCard name="Mounjaro®" molecule="tirzepatide" cadence="1× / minggu" results="hingga ±20%" priceLabel="Rp 3.900.000/bln" selected={pref === "mounjaro"} onSelect={() => setPref("mounjaro")} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-meta)", lineHeight: 1.5 }}>Ozempic® tidak ditawarkan untuk berat badan (indikasinya diabetes tipe 2). Angka hasil dari uji klinis; hasil tiap orang berbeda.</p>
      </section>

      {/* Why supervised */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Kenapa harus dengan dokter, bukan beli sendiri?</h2>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8 }}>
          <li><strong style={{ color: "var(--text-primary)" }}>Dosis yang salah itu risiko nyata.</strong> Naik terlalu cepat = mual berat; terlalu lambat = tidak ada hasil. Dokter mengatur titrasinya untukmu.</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Efek samping ada penanganannya.</strong> Cek gejala kapan saja — dokter menilai dan menyesuaikan, bukan kamu menebak sendiri.</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Obat berhenti, kebiasaan tetap.</strong> Pendampingan makan & aktivitas supaya hasilnya bertahan.</li>
        </ul>
        <DoctorCard compact name="dr. Ratna Wijaya" specialty="Dokter umum · program berat badan" str="31.2.1.404.221" />
      </section>

      {/* Expected results — honest range, editorial scale */}
      <section style={{ padding: "44px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Hasil yang realistis, bukan janji.</h2>
        <p ref={statRef} style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 84, fontWeight: 600, lineHeight: 0.95, letterSpacing: "-0.02em", fontFeatureSettings: "var(--numeric-tabular)", color: "var(--text-primary)" }}>
          5–{statTop}<span style={{ fontSize: 42, color: "var(--dara-terracotta)" }}>%</span>
        </p>
        <div aria-hidden="true" style={{ height: 3, width: 72, background: "var(--dara-sage)", borderRadius: 2 }} />
        <p style={{ margin: "4px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "36ch" }}>
          penurunan berat badan dalam 3–6 bulan pertama pada kebanyakan orang, berdasarkan uji klinis GLP-1. Hasilmu bergantung dosis, konsistensi, dan tubuhmu sendiri — doktermu memantau trennya tiap bulan.
        </p>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={h2}>Cara kerjanya</h2>
        <StepTimeline
          steps={[
            { title: "Kuis kesehatan 5 menit", description: "Riwayat, obat lain, tujuanmu.", state: "done" },
            { title: "Dokter meninjau & menyusun rencana", description: "Dalam 1×24 jam, lewat pesan.", state: "done" },
            { title: "Mulai dosis rendah", description: "0,25 mg — naik bertahap hanya bila cocok.", state: "done" },
            { title: "Check-in tiap minggu, kiriman tiap bulan", description: "Jeda atau berhenti kapan saja.", state: "done" },
          ]}
        />
        <Button size="lg" fullWidth onClick={onStartQuiz}>Mulai kuis kesehatan</Button>
      </section>

      {/* Price */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={h2}>Hitung sendiri — transparan.</h2>
        <PriceAnchorCard
          left={{ eyebrow: "Beli obat sendiri di apotek", price: "±Rp 3.100.000/pen", note: "Tanpa pendampingan, tanpa pengaturan dosis, cari resep sendiri" }}
          right={{ eyebrow: "Program Dara", price: "Rp 3.900.000/bln", note: "Dokter, pendampingan & pengaturan dosis termasuk" }}
        />
        <PlanCard
          planName="Program Berat Badan"
          medication="Semaglutide pen mingguan"
          features={["Konsultasi & tinjauan dokter berkelanjutan", "Titrasi dosis + cek gejala prioritas", "Pengiriman diskret berpendingin, gratis"]}
          prices={{ 1: { perMonth: 3900000 }, 3: { perMonth: 3500000, total: 10500000, savings: "hemat 10%" }, 6: { perMonth: 3200000, total: 19200000, savings: "hemat 18%" } }}
          defaultTerm={3}
        />
      </section>

      {/* Trust depth */}
      <section style={{ background: "var(--surface-band)", padding: "36px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={h2}>Tim medis yang bisa kamu cek sendiri.</h2>
        <p style={{ margin: "2px 0 6px", fontFamily: "var(--font-display)", fontSize: 23, fontStyle: "italic", fontWeight: 500, lineHeight: 1.4, color: "var(--text-primary)" }}>
          “Yang paling sering kudengar: ternyata bukan aku yang kurang disiplin. Begitu biologinya ditangani, semuanya masuk akal.”
        </p>
        <DoctorCard name="dr. Ratna Wijaya" specialty="Dokter umum · 11 th praktik" str="31.2.1.404.221" />
        <DoctorCard name="dr. Ayu Lestari" specialty="Dokter umum · konseling gizi" str="31.2.1.517.008" />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-meta)" }}>
          Verifikasi STR di ki.kki.go.id · nomor registrasi obat bisa dicek di cekbpom.pom.go.id — tertera di setiap kemasan.
        </p>
      </section>

      {/* FAQ */}
      <section style={{ padding: "36px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Pertanyaan yang sering muncul</h2>
        <FAQAccordion
          items={[
            { q: "Apakah aku pasti dapat resep?", a: "Tidak. Dokter hanya meresepkan bila aman dan sesuai untukmu — sekitar 1 dari 5 pendaftar diarahkan ke jalur lain. Itu justru tanda prosesnya serius." },
            { q: "Bagaimana kalau aku mual?", a: "Mual ringan umum di minggu awal. Ada cek gejala di portal: dokter menilai, bisa menahan dosis, dan kamu tidak menebak sendiri." },
            { q: "Apakah beratku naik lagi kalau berhenti?", a: "Bisa, kalau berhenti mendadak tanpa perubahan kebiasaan. Karena itu program ini memasangkan obat dengan pendampingan makan & aktivitas, dan penurunan dosis diatur dokter." },
            { q: "Paketnya terlihat seperti apa?", a: "Kotak polos berpendingin, nama pengirim netral, tanpa label kesehatan." },
          ]}
        />
      </section>

      <Testimonials />

      <Footer />

      {/* Sticky bottom bar — price anchor + CTA */}
      <div style={{ position: "sticky", bottom: 0, padding: "10px 16px 14px", background: "var(--surface-page)", borderTop: "var(--border-hairline)", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 -6px 20px rgba(33,26,20,.06)" }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span style={{ fontSize: 11, color: "var(--text-meta)" }}>mulai dari</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFeatureSettings: "var(--numeric-tabular)", whiteSpace: "nowrap" }}>Rp 3,9jt<span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 400, color: "var(--text-meta)" }}>/bln</span></span>
        </div>
        <Button size="lg" onClick={onStartQuiz} style={{ flex: 1, whiteSpace: "nowrap" }}>Cek kelayakanku — gratis</Button>
      </div>
    </div>
  );
}
