import React from "react";
import { Button } from "../../components/actions/Button.jsx";

/* Dara — mental-health quiz (mobile). Same one-question engine as the main
   quiz, deliberately calmer: muted blush, no progress bar, generous line
   height, soft auto-advance. No severity/self-harm screening and no crisis
   routing (per project decision) — the quiz gathers gentle context and
   hands off to a human. Copy stays within "membantu mengelola". */
export function QuizMental({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [track, setTrack] = React.useState(null);
  const [durasi, setDurasi] = React.useState(null);
  const [dampak, setDampak] = React.useState(null);
  const [prefer, setPrefer] = React.useState(null);

  const advance = (fn) => setTimeout(fn, 380);

  const Row = ({ label, description, selected, onSelect }) => (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: selected ? "var(--surface-card)" : "transparent", border: "1px solid " + (selected ? "var(--dara-terracotta)" : "var(--dara-line)"), borderRadius: "var(--radius-control)", padding: "18px 18px", minHeight: 60, cursor: "pointer", fontFamily: "var(--font-ui)", transition: "border-color var(--dur-fast) var(--ease-out)" }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 17, fontWeight: 550, color: selected ? "var(--dara-terracotta)" : "var(--text-primary)", lineHeight: 1.4 }}>{label}</span>
        {description && <span style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{description}</span>}
      </span>
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dara-terracotta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
      )}
    </button>
  );

  const frame = (title, sub, children) => (
    <div key={step} style={{ background: "var(--surface-band)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column", padding: "28px 24px 36px", gap: 20, animation: "dara-stepin var(--dur-slow) var(--ease-out) both" }}>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-meta)", cursor: "pointer" }}>← Kembali</button>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 550, lineHeight: 1.3 }}>{title}</h2>
        {sub && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );

  if (step === 0)
    return frame("Apa yang paling terasa akhir-akhir ini?", "Tidak ada jawaban yang salah. Pilih yang paling dekat.", (
      <>
        <Row label="Pikiran yang sulit tenang" description="Cemas, khawatir berlebih" selected={track === "cemas"} onSelect={() => { setTrack("cemas"); advance(() => setStep(1)); }} />
        <Row label="Sulit tidur nyenyak" description="Susah mulai tidur atau sering terbangun" selected={track === "tidur"} onSelect={() => { setTrack("tidur"); advance(() => setStep(1)); }} />
        <Row label="Keduanya, saling terkait" selected={track === "dua"} onSelect={() => { setTrack("dua"); advance(() => setStep(1)); }} />
      </>
    ));

  if (step === 1)
    return frame("Sudah berapa lama terasa?", null, (
      <>
        {[["baru", "Baru-baru ini", "Beberapa minggu terakhir"], ["bulan", "Beberapa bulan"], ["lama", "Sudah lama", "Lebih dari setahun"]].map(([id, l, d]) => (
          <Row key={id} label={l} description={d} selected={durasi === id} onSelect={() => { setDurasi(id); advance(() => setStep(2)); }} />
        ))}
      </>
    ));

  if (step === 2)
    return frame("Seberapa memengaruhi hari-harimu?", "Ini membantu kami menyesuaikan pendampingan — bukan menilaimu.", (
      <>
        {[["sedikit", "Sedikit", "Masih bisa menjalani rutinitas"], ["cukup", "Cukup terasa", "Beberapa hal jadi lebih berat"], ["banyak", "Banyak", "Sering mengganggu kerja, tidur, atau hubungan"]].map(([id, l, d]) => (
          <Row key={id} label={l} description={d} selected={dampak === id} onSelect={() => { setDampak(id); advance(() => setStep(3)); }} />
        ))}
      </>
    ));

  if (step === 3)
    return frame("Kamu membayangkan mulai dari mana?", "Bisa berubah setelah bicara dengan psikolog atau dokter.", (
      <>
        <Row label="Konseling dulu" description="Bicara dengan psikolog, tanpa obat" selected={prefer === "konseling"} onSelect={() => { setPrefer("konseling"); advance(() => setStep(4)); }} />
        <Row label="Terbuka untuk perawatan bila perlu" description="Termasuk obat, kalau dokter menyarankan" selected={prefer === "obat"} onSelect={() => { setPrefer("obat"); advance(() => setStep(4)); }} />
        <Row label="Belum tahu, bantu aku" selected={prefer === "bimbing"} onSelect={() => { setPrefer("bimbing"); advance(() => setStep(4)); }} />
      </>
    ));

  /* Result — warm hand-off, no diagnosis, no gamified score */
  return (
    <div style={{ background: "var(--surface-band)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column", padding: "32px 24px 40px", gap: 18 }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 550, lineHeight: 1.25 }}>Terima kasih sudah berbagi. Itu langkah yang tidak mudah.</h2>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)" }}>
        {track === "tidur"
          ? "Seorang psikolog atau dokter akan meninjau ceritamu dan menyusun langkah menata tidur — mengutamakan cara yang tidak menimbulkan ketergantungan."
          : "Seorang psikolog atau dokter akan meninjau ceritamu dan menyusun langkah untuk membantumu mengelola ini, sesuai kecepatanmu."}
      </p>
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)" }}>Langkah berikutnya</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>Balasan dalam 1×24 jam lewat pesan. Rahasia, tanpa komitmen.</p>
      </div>
      <Button size="lg" fullWidth onClick={onDone}>Kirim ke tim mental</Button>
      <Button variant="quiet" fullWidth>Aku mau baca-baca dulu</Button>
    </div>
  );
}
