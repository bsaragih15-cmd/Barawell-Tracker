import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { OptionCard } from "../../components/quiz/OptionCard.jsx";
import { ProgressBar } from "../../components/quiz/ProgressBar.jsx";

/* Dara — side-effect triage (mobile). Structured symptom check-in that
   branches: self-care (sage) · doctor review (info) · urgent (plain, direct).
   Never alarm-red; urgency lives in the words. */
export function TriageFlow({ onBack }) {
  const [step, setStep] = React.useState(0);
  const [symptom, setSymptom] = React.useState(null);
  const [duration, setDuration] = React.useState(null);

  const advance = (fn) => setTimeout(fn, 350);

  const SYMPTOMS = [
    ["mual", "Mual atau muntah"],
    ["sembelit", "Sembelit"],
    ["pusing", "Pusing atau lemas"],
    ["perut", "Nyeri perut hebat yang tidak reda"],
  ];

  const frame = (children) => (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column" }}>
      <ProgressBar value={Math.min(step, 2) / 2} />
      <div style={{ padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <button onClick={() => (step === 0 ? onBack && onBack() : setStep(step - 1))} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-meta)", cursor: "pointer" }}>
          ← {step === 0 ? "Portal" : "Kembali"}
        </button>
        {children}
      </div>
    </div>
  );

  if (step === 0)
    return frame(
      <>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 550, lineHeight: 1.2 }}>Apa yang kamu rasakan?</h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>Jawabanmu masuk ke catatan medis dan dibaca doktermu.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SYMPTOMS.map(([id, label]) => (
            <OptionCard key={id} label={label} selected={symptom === id} onSelect={() => { setSymptom(id); advance(() => setStep(id === "perut" ? 2 : 1)); }} />
          ))}
        </div>
      </>
    );

  if (step === 1)
    return frame(
      <>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 550, lineHeight: 1.2 }}>Sudah berapa lama?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OptionCard label="Baru hari ini" selected={duration === "1"} onSelect={() => { setDuration("1"); advance(() => setStep(2)); }} />
          <OptionCard label="1–3 hari" selected={duration === "3"} onSelect={() => { setDuration("3"); advance(() => setStep(2)); }} />
          <OptionCard label="Lebih dari 3 hari" selected={duration === "3+"} onSelect={() => { setDuration("3+"); advance(() => setStep(2)); }} />
        </div>
      </>
    );

  /* Step 2 — outcome */
  if (symptom === "perut")
    return frame(
      <>
        <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 550, lineHeight: 1.25 }}>Ini perlu diperiksa langsung, sekarang.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Nyeri perut hebat yang tidak reda bisa jadi tanda pankreatitis — efek samping yang jarang tapi serius. Jangan tunggu balasan pesan: pergi ke IGD terdekat, dan hentikan dulu suntikanmu.
        </p>
        <div style={{ background: "var(--dara-info-tint)", border: "1px solid var(--dara-info)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>
          <strong style={{ fontWeight: 600 }}>Yang perlu dibawa:</strong> pen obatmu atau fotonya, dan riwayat dosis di halaman rencana. Dokter Dara sudah kami beri tahu.
        </div>
        <Button size="lg" fullWidth>Lihat IGD terdekat</Button>
        <Button variant="quiet" fullWidth onClick={onBack}>Kembali ke portal</Button>
      </>
    );

  if (duration === "3+")
    return frame(
      <>
        <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 550, lineHeight: 1.25 }}>Lebih dari 3 hari — biar doktermu yang menilai.</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Keluhanmu sudah diteruskan ke dr. Ratna dengan prioritas. Sambil menunggu (biasanya di bawah 3 jam), jangan naikkan dosis dan tetap minum air sedikit-sedikit.
        </p>
        <div style={{ background: "var(--dara-info-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>
          Dokter mungkin akan menahan dosismu satu minggu — itu normal dan tidak menggagalkan programmu.
        </div>
        <Button size="lg" fullWidth onClick={onBack}>Kembali ke portal</Button>
      </>
    );

  return frame(
    <>
      <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 550, lineHeight: 1.25 }}>Ini umum di minggu-minggu awal — dan bisa kamu redakan sendiri.</h2>
      <div style={{ background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px" }}>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)" }}>
          <li>Makan porsi kecil, lebih sering; hindari gorengan dulu</li>
          <li>Minum air sedikit-sedikit sepanjang hari</li>
          <li>Suntik di malam hari bila mual pagi mengganggu</li>
        </ul>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Catatan ini tersimpan. Kalau berlanjut lebih dari 3 hari atau memburuk, isi cek gejala lagi — dokter akan langsung meninjau.
      </p>
      <Button size="lg" fullWidth onClick={onBack}>Kembali ke portal</Button>
      <Button variant="quiet" fullWidth>Tanya dr. Ratna sekarang</Button>
    </>
  );
}
