import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";

/* Dara — injection how-to & storage (mobile). Adherence surface:
   plain steps, honest storage rules, refill logic stated. */
export function InjectionGuide({ onBack }) {
  const placeholder = (label, ratio) => (
    <div
      aria-hidden="true"
      style={{
        aspectRatio: ratio || "16 / 9",
        borderRadius: "var(--radius-card)",
        border: "var(--border-hairline)",
        background: "repeating-linear-gradient(45deg, var(--dara-oat) 0 8px, var(--dara-blush) 8px 16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-meta)", background: "var(--surface-page)", padding: "3px 8px", borderRadius: 4 }}>{label}</span>
    </div>
  );

  const card = (children) => (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 12 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-meta)", cursor: "pointer" }}>← Portal</button>
      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 550, lineHeight: 1.15 }}>Cara pakai pen suntikmu</h1>
      <p style={{ margin: "-6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Sekali seminggu, hari apa saja — yang penting konsisten. Tonton dulu, lalu ikuti langkahnya.
      </p>

      {placeholder("video: demo suntik oleh perawat, 90 detik")}

      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Empat langkah</p>
          <StepTimeline
            steps={[
              { title: "Cuci tangan, cek pen", description: "Cairan harus jernih. Kalau keruh atau pernah beku, jangan dipakai — hubungi kami.", state: "done" },
              { title: "Pasang jarum baru", description: "Jarum selalu baru tiap suntik. Buang yang lama ke wadah tertutup.", state: "done" },
              { title: "Suntik di perut atau paha", description: "Cubit ringan kulit, tusuk 90°, tahan 6 detik. Ganti titik tiap minggu.", state: "done" },
              { title: "Catat di portal", description: "Sekali tap — dokter melihat jadwalmu tetap jalan.", state: "done" },
            ]}
          />
        </>
      )}

      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Penyimpanan</p>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            <li>Pen baru: kulkas <strong style={{ color: "var(--text-primary)", fontFeatureSettings: "var(--numeric-tabular)" }}>2–8 °C</strong> — bukan freezer, jangan sampai beku</li>
            <li>Pen yang sedang dipakai: boleh suhu ruang (di bawah 30 °C), habiskan dalam 30 hari</li>
            <li>Paketmu dikirim dengan pendingin — langsung masukkan kulkas saat tiba</li>
          </ul>
        </>
      )}

      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pengingat & isi ulang</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            Kami ingatkan lewat WhatsApp di hari suntikmu, dan pen berikutnya dikirim otomatis 7 hari sebelum yang ini habis. Tidak perlu memesan ulang.
          </p>
        </>
      )}

      <Button size="lg" fullWidth onClick={onBack}>Catat suntikan minggu ini</Button>
    </div>
  );
}
