import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { ProgressBar } from "../../components/quiz/ProgressBar.jsx";
import { Input } from "../../components/forms/Input.jsx";
import { TierCard } from "../../components/commerce/TierCard.jsx";

/* Dara — quiz flow (mobile). One question per screen, auto-advance,
   two branches (berat badan / pil KB), empathetic results, kind hard
   stops. Eligibility is honest: low BMI is redirected, not "sold to";
   estrogen risk is redirected to an estrogen-free path, not a dead end. */
export function QuizFlow({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [goal, setGoal] = React.useState(null);
  // berat-badan branch
  const [conds, setConds] = React.useState([]);
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [wErr, setWErr] = React.useState("");
  // pil-KB branch
  const [kbRisk, setKbRisk] = React.useState([]);
  const [kbSituation, setKbSituation] = React.useState(null);

  const TOTAL = goal === "kb" ? 3 : 4;
  const bmi = weight && height ? +(weight / Math.pow(height / 100, 2)).toFixed(1) : null;
  const fmtBmi = bmi != null ? String(bmi).replace(".", ",") : "—";

  const weightHardStop = conds.includes("hamil") || conds.includes("men2") || conds.includes("pankreatitis");
  const glp1Eligible = bmi != null && (bmi >= 27 || conds.includes("diabetes"));
  const notCandidate = bmi != null && !glp1Eligible;

  const kbPregnant = kbRisk.includes("hamil");
  const kbEstrogenRisk = ["hipertensi", "migrain", "merokok", "pembekuan"].some((k) => kbRisk.includes(k));

  const advance = (fn) => setTimeout(fn, 350);
  const toggle = (setter, id) =>
    setter((c) => (id === "none" ? ["none"] : c.includes(id) ? c.filter((x) => x !== id) : [...c.filter((x) => x !== "none"), id]));

  /* big-type minimal — hairline rows instead of cards */
  const Row = ({ label, description, selected, onSelect }) => (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "var(--border-hairline)", padding: "18px 2px", minHeight: 56, cursor: "pointer", fontFamily: "var(--font-ui)" }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 17, fontWeight: selected ? 650 : 450, color: selected ? "var(--dara-terracotta)" : "var(--text-primary)", lineHeight: 1.4, transition: "color var(--dur-fast) var(--ease-out)" }}>{label}</span>
        {description && <span style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{description}</span>}
      </span>
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dara-terracotta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
      )}
    </button>
  );

  const frame = (children) => (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column" }}>
      <ProgressBar value={Math.min(step, TOTAL) / TOTAL} />
      <div key={step} style={{ padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 16, flex: 1, animation: "dara-stepin var(--dur-slow) var(--ease-out) both" }}>
        {step > 0 && step <= TOTAL && (
          <button onClick={() => setStep(step - 1)} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-meta)", cursor: "pointer" }}>
            ← Kembali
          </button>
        )}
        {children}
      </div>
    </div>
  );

  const H2 = ({ children, small }) => (
    <h2 style={{ margin: small ? "8px 0 0" : "4px 0 8px", fontFamily: "var(--font-display)", fontSize: small ? 26 : 30, fontWeight: 550, lineHeight: small ? 1.25 : 1.12 }}>{children}</h2>
  );
  const nextStepCard = (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)" }}>Langkah berikutnya</p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>Dokter meninjau jawabanmu dalam 1×24 jam. Gratis, tanpa komitmen.</p>
    </div>
  );

  /* Step 0 — goal (shared) */
  if (step === 0)
    return frame(
      <>
        <H2>Apa yang ingin kamu capai?</H2>
        <div style={{ borderTop: "var(--border-hairline)" }}>
          <Row label="Menurunkan berat badan" description="Program dengan pendampingan dokter" selected={goal === "bb"} onSelect={() => { setGoal("bb"); advance(() => setStep(1)); }} />
          <Row label="Merasa lebih sehat & bertenaga" description="Mulai dari kebiasaan, dokter membantu menilai" selected={goal === "sehat"} onSelect={() => { setGoal("sehat"); advance(() => setStep(1)); }} />
        </div>
      </>
    );

  /* ============================ PIL KB BRANCH ============================ */
  if (goal === "kb") {
    if (step === 1)
      return frame(
        <>
          <H2 small>Apakah salah satu dari ini berlaku untukmu?</H2>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>Ini menentukan jenis pil yang aman. Pilih semua yang sesuai — hanya dibaca dokter.</p>
          <div style={{ borderTop: "var(--border-hairline)" }}>
            {[
              ["hamil", "Sedang hamil atau menyusui"],
              ["migrain", "Migrain dengan aura", "Sakit kepala didahului gangguan penglihatan atau kesemutan"],
              ["merokok", "Merokok, dan usia 35 tahun ke atas"],
              ["hipertensi", "Tekanan darah tinggi (di atas 140/90)"],
              ["pembekuan", "Riwayat pembekuan darah, stroke, atau serangan jantung"],
              ["none", "Tidak ada yang berlaku"],
            ].map(([id, label, desc]) => (
              <Row key={id} label={label} description={desc || undefined} selected={kbRisk.includes(id)} onSelect={() => toggle(setKbRisk, id)} />
            ))}
          </div>
          <Button size="lg" fullWidth disabled={kbRisk.length === 0} onClick={() => setStep(2)}>Lanjut</Button>
        </>
      );

    if (step === 2)
      return frame(
        <>
          <H2 small>Kamu di titik mana sekarang?</H2>
          <div style={{ borderTop: "var(--border-hairline)" }}>
            <Row label="Baru pertama kali pakai pil KB" selected={kbSituation === "baru"} onSelect={() => { setKbSituation("baru"); advance(() => setStep(3)); }} />
            <Row label="Ingin ganti merek atau jenis" description="Yang sekarang kurang cocok" selected={kbSituation === "ganti"} onSelect={() => { setKbSituation("ganti"); advance(() => setStep(3)); }} />
            <Row label="Lanjutkan pil yang sudah cocok" selected={kbSituation === "lanjut"} onSelect={() => { setKbSituation("lanjut"); advance(() => setStep(3)); }} />
          </div>
        </>
      );

    /* step 3 — KB result */
    if (kbPregnant)
      return frame(
        <>
          <H2 small>Terima kasih sudah jujur. Pil KB bukan untuk masa ini.</H2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            Pil KB tidak diberikan selama hamil. Saat menyusui, ada pilihan bebas-estrogen — tapi waktunya dan jenisnya ditentukan dokter setelah melihat kondisimu.
          </p>
          <div style={{ background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            Yang bisa kamu lakukan sekarang: baca panduan kami tentang <a href="#">KB pascamelahirkan</a>, atau <a href="#">kirim pesan</a> — tim kami bantu arahkan ke pilihan yang aman.
          </div>
          <Button size="lg" fullWidth variant="secondary" onClick={() => { setKbRisk([]); setStep(1); }}>Ubah jawabanku</Button>
        </>
      );

    return frame(
      <>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-meta)" }}>Hasil awalmu</p>
        {kbEstrogenRisk ? (
          <>
            <H2 small>Pil kombinasi mungkin bukan yang teraman — tapi kamu punya pilihan.</H2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Dari jawabanmu, pil dengan estrogen berisiko lebih tinggi untukmu. Kabar baiknya: ada pil bebas-estrogen (progestin, sering disebut “pil mini”) yang kerap cocok. Dokter yang memastikan mana yang aman — bukan tebakan.
            </p>
          </>
        ) : (
          <>
            <H2 small>Sepertinya kamu cocok untuk konsultasi pil KB.</H2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Berdasarkan jawabanmu, dokter kemungkinan bisa meresepkan pil KB online.{" "}
              {kbSituation === "baru" && "Karena ini pertama kalimu, dokter menjelaskan cara mulai yang aman."}
              {kbSituation === "ganti" && "Ceritakan keluhan dengan merek sebelumnya — dokter carikan yang lebih cocok."}
              {kbSituation === "lanjut" && "Kalau merekmu aman dilanjutkan, dokter meresepkan yang sama."}
            </p>
          </>
        )}
        {nextStepCard}
        <Button size="lg" fullWidth onClick={() => onDone(goal)}>Kirim ke dokter</Button>
        <Button variant="quiet" fullWidth>Aku mau baca-baca dulu</Button>
      </>
    );
  }

  /* ========================= BERAT BADAN BRANCH ========================= */
  /* Step 1 — conditions (multi) */
  if (step === 1)
    return frame(
      <>
        <H2 small>Apakah salah satu dari ini berlaku untukmu?</H2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>Pilih semua yang sesuai — jawabanmu hanya dibaca dokter.</p>
        <div style={{ borderTop: "var(--border-hairline)" }}>
          {[["hamil", "Sedang hamil atau menyusui"], ["men2", "Riwayat kanker tiroid meduler / MEN2", "Pada diri sendiri atau keluarga inti"], ["pankreatitis", "Pernah pankreatitis"], ["diabetes", "Diabetes tipe 2"], ["none", "Tidak ada yang berlaku"]].map(([id, label, desc]) => (
            <Row key={id} label={label} description={desc || undefined} selected={conds.includes(id)} onSelect={() => toggle(setConds, id)} />
          ))}
        </div>
        <Button size="lg" fullWidth disabled={conds.length === 0} onClick={() => setStep(2)}>Lanjut</Button>
      </>
    );

  /* Step 2 — measurements */
  if (step === 2)
    return frame(
      <>
        <H2 small>Berat dan tinggi badanmu?</H2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>Perkiraan saja tidak apa-apa. Ini titik mulai, bukan penilaian.</p>
        <Input label="Berat badan" type="number" suffix="kg" value={weight} error={wErr} onChange={(e) => { setWeight(e.target.value); setWErr(""); }} />
        <Input label="Tinggi badan" type="number" suffix="cm" value={height} onChange={(e) => setHeight(e.target.value)} />
        <Button size="lg" fullWidth onClick={() => { if (!weight || !height) { setWErr("Berat dan tinggi badan wajib diisi"); return; } setStep(3); }}>Lanjut</Button>
      </>
    );

  /* Step 3 — hard stop (medical contraindication) */
  if (weightHardStop) {
    const isHamil = conds.includes("hamil");
    return frame(
      <>
        <H2 small>Terima kasih sudah jujur. Program ini belum aman untukmu saat ini.</H2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          {isHamil
            ? "Obat penurun berat badan tidak dianjurkan selama kehamilan atau menyusui. Ini bukan pintu tertutup — ini soal waktu yang tepat."
            : "Dengan riwayat itu, obat golongan GLP-1 tidak boleh diberikan — risiko kesehatannya nyata, dan dokter mana pun yang baik akan berkata sama. Kamu justru terlindungi oleh jawabanmu sendiri."}
        </p>
        <div style={{ background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          {isHamil ? (
            <>Yang bisa kamu lakukan sekarang: konsultasi gizi kehamilan gratis dengan bidan puskesmas, atau baca panduan kami tentang <a href="#">nutrisi pasca-melahirkan</a>.</>
          ) : (
            <>Jalur lain yang aman: program pendampingan gizi & aktivitas tanpa obat, atau konsultasi spesialis penyakit dalam. Tim kami bisa bantu merujukmu — <a href="#">kirim pesan ke kami</a>.</>
          )}
        </div>
        <Button size="lg" fullWidth variant="secondary" onClick={() => { setConds([]); setStep(1); }}>Ubah jawabanku</Button>
      </>
    );
  }

  /* Step 3 — below threshold: honest redirect, not a sale */
  if (notCandidate)
    return frame(
      <>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-meta)" }}>Hasil awalmu</p>
        <H2 small>BMI-mu {fmtBmi}. Kabar baiknya: kamu belum butuh obat berat badan.</H2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Jalur GLP-1 ditujukan untuk BMI 27 ke atas. Di angkamu, risiko obat lebih besar daripada manfaatnya, dan dokter mana pun yang baik akan berkata sama. Ini menjagamu, bukan menolakmu.
        </p>
        <div style={{ background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Kalau tujuanmu merasa lebih sehat dan bertenaga: kami punya <a href="#">panduan gizi & aktivitas tanpa obat</a>, dan tim kami senang bantu arahkan. Berat badan bukan satu-satunya ukuran sehat.
        </div>
        <Button size="lg" fullWidth variant="secondary" onClick={() => setStep(2)}>Ubah jawabanku</Button>
      </>
    );

  /* Step 3 — eligible: recommend the GLP-1 path. */
  return frame(
    <>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-meta)" }}>Hasil awalmu</p>
      <H2 small>BMI-mu {fmtBmi}. Ini titik mulai, bukan vonis.</H2>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Kamu kemungkinan cocok untuk jalur GLP-1 (suntik mingguan). Dokter memastikan obat dan dosis yang paling pas untukmu.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 2 }}>
        <TierCard
          eyebrow="Suntik mingguan"
          name="Jalur GLP-1"
          description="Wegovy atau Mounjaro, dosis diatur bertahap oleh dokter."
          priceFrom="Rp 3.900.000"
          delivery="Ambil di klinik partner"
          deliveryIcon="map-pin"
          features={["Penurunan lebih besar pada uji klinis", "Titrasi & cek gejala prioritas", "Pendampingan makan & aktivitas"]}
          recommended
          ctaLabel="Kirim ke dokter"
          onCta={() => onDone(goal)}
        />
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-meta)", lineHeight: 1.5 }}>Pilihan akhir — obat & dosis — ditentukan doktermu.</p>
    </>
  );
}
