import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { MessageBubble } from "../../components/messaging/MessageBubble.jsx";

/* Dara — portal, Kesehatan Mental (mobile). Daily check-in (mood + sleep),
   worded scales (no emoji), calm density, weekly session. No crisis
   surfaces per project decision; tone stays gentle and non-judging. */
export function PortalMental() {
  const [mood, setMood] = React.useState(null);
  const [sleep, setSleep] = React.useState(null);
  const [logged, setLogged] = React.useState(false);

  const card = (children) => (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  );
  const chip = (val, label, cur, set) => (
    <button
      key={val}
      onClick={() => set(val)}
      aria-pressed={cur === val}
      style={{ flex: 1, minHeight: 44, padding: "8px 4px", borderRadius: "var(--radius-control)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, background: cur === val ? "var(--dara-terracotta-tint)" : "var(--surface-page)", color: cur === val ? "var(--dara-terracotta)" : "var(--text-secondary)", border: "1px solid " + (cur === val ? "var(--dara-terracotta)" : "var(--dara-line)"), transition: "background var(--dur-fast) var(--ease-out)" }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Halo, Rara</span>
      </div>

      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 550 }}>Kesehatan Mental · Cemas</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Konseling + pendampingan · minggu ke-3</p>
            </div>
            <StatusChip status="approved" label="Aktif" />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)", borderTop: "var(--border-hairline)", paddingTop: 12 }}>
            Kamu sedang membangun kebiasaan mengelola cemas. Pelan tidak apa-apa.
          </p>
        </>
      )}

      {/* Daily check-in */}
      {card(
        logged ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "12px 14px", borderRadius: "var(--radius-control)" }}>
            Tercatat untuk hari ini. Terima kasih sudah cek in — psikologmu melihat trennya dari minggu ke minggu, bukan satu hari.
          </p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Cek in hari ini</p>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>Suasana hatimu</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[["berat", "Berat"], ["kurang", "Kurang"], ["biasa", "Biasa"], ["baik", "Baik"], ["cerah", "Cerah"]].map(([v, l]) => chip(v, l, mood, setMood))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>Tidur semalam</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[["<5", "< 5 jam"], ["5-6", "5–6"], ["7-8", "7–8"], [">8", "> 8"]].map(([v, l]) => chip(v, l, sleep, setSleep))}
              </div>
            </div>
            <Button fullWidth disabled={!mood || !sleep} onClick={() => setLogged(true)}>Catat hari ini</Button>
          </>
        )
      )}

      {/* Next session */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Sesi berikutnya</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)", fontFeatureSettings: "var(--numeric-tabular)" }}>
            Kamis, 16 Juli 2026 · 19.30 — konseling video 45 menit dengan <strong style={{ color: "var(--text-primary)" }}>Kirana, M.Psi.</strong>
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }}>Jadwalkan ulang</Button>
            <Button variant="secondary" style={{ flex: 1 }}>Tambah ke kalender</Button>
          </div>
        </>
      )}

      {/* Between-session practice */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Latihan minggu ini</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            Latihan napas 4-7-8, 5 menit sebelum tidur. Tanpa target, tanpa skor — lakukan sebisamu.
          </p>
          <Button variant="secondary" style={{ alignSelf: "flex-start" }}>Buka latihan</Button>
        </>
      )}

      {/* Messages */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesan dengan psikologmu</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MessageBubble from="doctor" author="Kirana, M.Psi." text="Senang lihat kamu cek in rutin minggu ini. Kalau malam terasa berat, coba latihan napasnya dulu ya — kita bahas Kamis." time="Kemarin, 20.10" />
            <MessageBubble from="patient" text="Baik, Kak. Terima kasih." time="Kemarin, 21.05" />
          </div>
          <Button variant="secondary" fullWidth>Tulis pesan</Button>
        </>
      )}
    </div>
  );
}
