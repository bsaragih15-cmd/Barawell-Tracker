import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { Input } from "../../components/forms/Input.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { StepTimeline } from "../../components/journey/StepTimeline.jsx";
import { DoctorCard } from "../../components/trust/DoctorCard.jsx";
import { OrderCard } from "../../components/commerce/OrderCard.jsx";

/* Dara — the states that aren't the happy path. The brand thesis: a hard
   stop is the kindest screen — always a reason in plain words, always a
   next step, never a dead end. One switcher demoing six real states. */
export function StatusStates() {
  const VIEWS = [
    ["review", "Ditinjau"],
    ["needs_info", "Butuh info"],
    ["rejected", "Ditolak"],
    ["pay_failed", "Bayar gagal"],
    ["delayed", "Tertunda"],
    ["paused", "Dijeda"],
  ];
  const [view, setView] = React.useState("review");
  const [extra, setExtra] = React.useState("");

  const wrap = (children) => (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column" }}>
      {/* demo switcher — not part of the screen itself */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "12px 12px 0" }}>
        {VIEWS.map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, padding: "6px 10px", minHeight: 30, border: "none", cursor: "pointer", borderRadius: "var(--radius-pill)", background: view === id ? "var(--dara-ink)" : "var(--surface-card-tint)", color: view === id ? "#fff" : "var(--text-secondary)" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        {children}
      </div>
    </div>
  );

  const H = ({ children }) => (
    <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 550, lineHeight: 1.2 }}>{children}</h1>
  );
  const body = { margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" };
  const sageCard = { background: "var(--dara-sage-tint)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" };

  if (view === "review")
    return wrap(
      <>
        <StatusChip status="in_review" style={{ alignSelf: "flex-start" }} />
        <H>Jawabanmu sudah sampai di dokter.</H>
        <p style={body}>dr. Ratna sedang meninjau. Balasan dalam 1×24 jam — kami kabari lewat WhatsApp dan email. Kamu tidak perlu menunggu di halaman ini.</p>
        <DoctorCard compact name="dr. Ratna Wijaya" specialty="Meninjau jawabanmu" str="31.2.1.404.221" />
        <StepTimeline
          steps={[
            { title: "Jawaban terkirim", meta: "Hari ini, 09.14", state: "done" },
            { title: "Ditinjau dokter", meta: "Perkiraan selesai besok, 09.14", state: "current" },
            { title: "Rencana & harga", meta: "Setelah ditinjau", state: "upcoming" },
          ]}
        />
        <Button size="lg" fullWidth variant="secondary">Kembali ke beranda</Button>
      </>
    );

  if (view === "needs_info")
    return wrap(
      <>
        <StatusChip status="needs_info" style={{ alignSelf: "flex-start" }} />
        <H>dr. Ratna butuh satu info lagi.</H>
        <p style={body}>Bukan masalah — hanya memastikan dosismu aman. Boleh sebutkan tekanan darah terakhirmu? Kalau tidak tahu, tulis “belum tahu” dan dokter arahkan cara ceknya.</p>
        <Input label="Tekanan darah terakhir" hint="Contoh: 120/80 — atau tulis “belum tahu”" value={extra} onChange={(e) => setExtra(e.target.value)} />
        <Button size="lg" fullWidth disabled={!extra}>Kirim ke dr. Ratna</Button>
        <Button variant="quiet" fullWidth>Tanya dulu lewat pesan</Button>
      </>
    );

  if (view === "rejected")
    return wrap(
      <>
        <StatusChip status="rejected" style={{ alignSelf: "flex-start" }} />
        <H>Kali ini dokter belum bisa meresepkan — dan itu menjagamu.</H>
        <p style={body}>Kombinasi jawabanmu membuat obat ini berisiko lebih besar daripada manfaatnya. Sekitar 1 dari 5 pendaftar diarahkan ke jalur lain; itu tanda prosesnya sungguh medis, bukan penjualan.</p>
        <div style={sageCard}>
          Jalur yang lebih aman untukmu: pendampingan gizi & aktivitas tanpa obat, atau rujukan ke spesialis penyakit dalam. <a href="#">Kirim pesan ke tim kami</a> — kami bantu langkah berikutnya.
        </div>
        <Button size="lg" fullWidth variant="secondary">Lihat jalur lain</Button>
      </>
    );

  if (view === "pay_failed")
    return wrap(
      <>
        <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: "var(--radius-pill)", background: "var(--dara-error-tint)", border: "1px solid var(--dara-error)", color: "var(--dara-error)", fontSize: "var(--text-caption)", fontWeight: 600 }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dara-error)" }} />
          Pembayaran gagal
        </span>
        <H>Pembayaran belum berhasil.</H>
        <p style={body}>Bank menolak transaksinya — biasanya soal saldo, limit harian, atau koneksi sesaat. <strong style={{ color: "var(--text-primary)" }}>Tidak ada yang terpotong dari rekeningmu.</strong> Coba lagi, atau pilih metode lain.</p>
        <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "14px 16px", display: "flex", justifyContent: "space-between", fontSize: 14, fontFeatureSettings: "var(--numeric-tabular)" }}>
          <span style={{ color: "var(--text-secondary)" }}>Program Berat Badan · bulanan</span>
          <strong>Rp 3.900.000</strong>
        </div>
        <Button size="lg" fullWidth>Coba bayar lagi</Button>
        <Button variant="secondary" fullWidth>Ganti metode pembayaran</Button>
      </>
    );

  if (view === "delayed")
    return wrap(
      <>
        <H>Kirimanmu tertunda sedikit — dan kamu tidak akan kehabisan.</H>
        <p style={body}>Cuaca menghambat jalur ke Jakarta Pusat, jadi paketmu mundur dua hari. Kami sudah menghitung: stok formulamu masih cukup sampai kiriman baru tiba.</p>
        <OrderCard
          orderNumber="Pesanan #DR-20260709-238"
          title="Rutin Kulit Kustom — kiriman bulan ini"
          statusLabel="Tertunda cuaca"
          eta="ETA baru: 13 Juli 2026 (dari 11 Juli)"
          address="Jl. Cikini Raya No. 21, Jakarta Pusat"
        />
        <div style={sageCard}>
          Butuh lebih cepat? Kami bisa kirim <strong style={{ color: "var(--dara-sage-deep)" }}>paket darurat gratis</strong> dari apotek partner terdekat hari ini. <a href="#">Minta paket darurat</a>.
        </div>
        <Button size="lg" fullWidth variant="secondary">Lacak paket</Button>
      </>
    );

  return wrap(
    <>
      <StatusChip status="rejected" label="Dijeda" style={{ alignSelf: "flex-start" }} />
      <H>Langgananmu dijeda. Kami tunggu kamu.</H>
      <p style={body}>Tidak ada tagihan dan tidak ada kiriman sampai kamu lanjut. Riwayat dan resepmu tersimpan aman — melanjutkan hanya butuh satu ketukan, tanpa kuis ulang.</p>
      <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "16px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", fontFeatureSettings: "var(--numeric-tabular)" }}>
        Kalau lanjut hari ini, kiriman berikutnya tiba sekitar 12 Juli 2026 dan tagihan dimulai lagi dari tanggal itu.
      </div>
      <Button size="lg" fullWidth>Lanjutkan langganan</Button>
      <Button variant="quiet" fullWidth>Butuh berhenti sepenuhnya?</Button>
    </>
  );
}
