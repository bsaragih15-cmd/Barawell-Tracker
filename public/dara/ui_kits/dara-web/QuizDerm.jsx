import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { ProgressBar } from "../../components/quiz/ProgressBar.jsx";

/* Dara — dermatology intake quiz (Kulit / Rambut), config-driven so both
   categories share one engine. One question per screen, auto-advance,
   honest hand-off (no false promises; medical-looking patterns are
   flagged for review, never rejected). */
const CFG = {
  kulit: {
    tag: "Kulit",
    q: [
      { key: "concern", title: "Apa yang paling ingin kamu perbaiki?", opts: [["jerawat", "Jerawat"], ["flek", "Flek hitam & bekas jerawat"], ["usia", "Garis halus & tanda usia"], ["kusam", "Kusam & tekstur tidak rata"]] },
      { key: "tipe", title: "Jenis kulitmu?", opts: [["berminyak", "Berminyak"], ["kering", "Kering"], ["kombinasi", "Kombinasi"], ["sensitif", "Sensitif"]] },
    ],
    safety: { title: "Apakah salah satu ini berlaku untukmu?", sub: "Pilih semua yang sesuai — jawabanmu hanya dibaca dokter.", opts: [["hamil", "Sedang hamil atau menyusui"], ["rosacea", "Kulit sangat sensitif atau rosacea"], ["isotretinoin", "Sedang minum isotretinoin (Roaccutane)"], ["none", "Tidak ada yang berlaku"]] },
    resultH: "Dokter kulit akan meracik formula untukmu.",
    result: (safety) => safety.includes("hamil")
      ? "Karena kamu sedang hamil atau menyusui, dokter memilih bahan aktif yang aman untuk masa ini — sebagian bahan (seperti retinoid) ditunda dulu. Aman lebih penting."
      : "Berdasarkan jawabanmu, dokter meracik bahan aktif yang sesuai kulitmu dan menaikkan kekuatannya bertahap.",
  },
  rambut: {
    tag: "Rambut",
    q: [
      { key: "pola", title: "Bagaimana pola rontokmu?", opts: [["dahi", "Menipis di garis rambut / dahi"], ["puncak", "Menipis di puncak kepala"], ["merata", "Menipis merata"], ["bercak", "Rontok bercak atau mendadak"]] },
      { key: "durasi", title: "Sejak kapan terasa?", opts: [["baru", "Kurang dari 6 bulan"], ["sedang", "6–12 bulan"], ["lama", "Lebih dari 1 tahun"]] },
    ],
    safety: { title: "Apakah salah satu ini berlaku untukmu?", sub: "Pilih semua yang sesuai — jawabanmu hanya dibaca dokter.", opts: [["hamil", "Sedang hamil atau menyusui"], ["alergi", "Riwayat alergi obat topikal"], ["kulitkepala", "Masalah kulit kepala (gatal, luka)"], ["none", "Tidak ada yang berlaku"]] },
    resultH: "Dokter akan memilih perawatan yang tepat.",
    result: (safety, ans) => ans.pola === "bercak"
      ? "Rontok bercak atau mendadak kadang butuh diperiksa lebih dulu. Dokter meninjau jawabanmu dan mengarahkan langkah aman — termasuk bila sebaiknya tatap muka."
      : (safety.includes("hamil")
        ? "Karena kamu sedang hamil atau menyusui, sebagian perawatan ditunda — dokter memilih yang aman atau menyarankan waktu yang tepat."
        : "Berdasarkan jawabanmu, dokter memilih perawatan yang sesuai dan memantau perkembanganmu tiap bulan."),
  },
};

export function QuizDerm({ category = "kulit", onDone }) {
  const c = CFG[category] || CFG.kulit;
  const TOTAL = 3;
  const [step, setStep] = React.useState(0);
  const [ans, setAns] = React.useState({});
  const [safety, setSafety] = React.useState([]);
  const advance = (fn) => setTimeout(fn, 350);

  const Row = ({ label, selected, onSelect }) => (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "var(--border-hairline)", padding: "18px 2px", minHeight: 56, cursor: "pointer", fontFamily: "var(--font-ui)" }}
    >
      <span style={{ fontSize: 17, fontWeight: selected ? 650 : 450, color: selected ? "var(--dara-terracotta)" : "var(--text-primary)", lineHeight: 1.4, transition: "color var(--dur-fast) var(--ease-out)" }}>{label}</span>
      {selected && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dara-terracotta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>}
    </button>
  );

  const frame = (children) => (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column" }}>
      <ProgressBar value={Math.min(step, TOTAL) / TOTAL} />
      <div key={step} style={{ padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 16, flex: 1, animation: "dara-stepin var(--dur-slow) var(--ease-out) both" }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-meta)", cursor: "pointer" }}>← Kembali</button>
        )}
        {children}
      </div>
    </div>
  );

  const H = (t, sub) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <h2 style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 550, lineHeight: 1.15 }}>{t}</h2>
      {sub && <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>{sub}</p>}
    </div>
  );

  // Steps 0 & 1 — single-select questions
  if (step < 2) {
    const q = c.q[step];
    return frame(
      <>
        {H(q.title)}
        <div style={{ borderTop: "var(--border-hairline)" }}>
          {q.opts.map(([id, label]) => (
            <Row key={id} label={label} selected={ans[q.key] === id} onSelect={() => { setAns((a) => ({ ...a, [q.key]: id })); advance(() => setStep(step + 1)); }} />
          ))}
        </div>
      </>
    );
  }

  // Step 2 — safety multi-select
  if (step === 2)
    return frame(
      <>
        {H(c.safety.title, c.safety.sub)}
        <div style={{ borderTop: "var(--border-hairline)" }}>
          {c.safety.opts.map(([id, label]) => (
            <Row key={id} label={label} selected={safety.includes(id)} onSelect={() => setSafety((s) => (id === "none" ? ["none"] : s.includes(id) ? s.filter((x) => x !== id) : [...s.filter((x) => x !== "none"), id]))} />
          ))}
        </div>
        <Button size="lg" fullWidth disabled={safety.length === 0} onClick={() => setStep(3)}>Lanjut</Button>
      </>
    );

  // Result
  return frame(
    <>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-meta)" }}>Hasil awalmu</p>
      {H(c.resultH)}
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>{c.result(safety, ans)}</p>
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)" }}>Langkah berikutnya</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>Dokter meninjau jawabanmu dalam 1×24 jam. Gratis, tanpa komitmen.</p>
      </div>
      <Button size="lg" fullWidth onClick={onDone}>Kirim ke dokter</Button>
      <Button variant="quiet" fullWidth>Aku mau baca-baca dulu</Button>
    </>
  );
}
