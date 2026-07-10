import Link from 'next/link';
import { TrustBar, TierCard, FAQAccordion } from '../ui';
import { MedPrefPreview } from './MedPrefPreview';

export const dynamic = 'force-dynamic';

const FAQ = [
  { q: 'Kenapa obat suntiknya tidak dikirim ke rumah?', a: 'Aturan BPOM melarang pengiriman obat suntik (selain insulin) lewat jalur online — itu melindungimu dari obat palsu dan penyimpanan yang salah. Kamu mengambil atau menerima suntikan di klinik partner terdekat; jadwalnya kami atur.' },
  { q: 'Apakah harus GLP-1?', a: 'Tidak. Kuis dan dokter yang menentukan. Untuk BMI di bawah 27 atau kalau GLP-1 belum aman untukmu, Program Oral (obat oral + ahli gizi) sering jadi jalur yang tepat — dan diantar ke rumah.' },
  { q: 'Kenapa tidak ada Ozempic?', a: 'Ozempic terdaftar di BPOM untuk diabetes tipe 2, bukan penurunan berat badan — jadi kami tidak menawarkannya untuk program ini. Wegovy dan Mounjaro terdaftar dengan indikasi berat badan.' },
  { q: 'Berapa lama sampai terlihat hasil?', a: 'Pada uji klinis, penurunan berarti umumnya terlihat dalam 3–6 bulan dengan titrasi dosis bertahap. Hasil tiap orang berbeda — dokter dan pendampingmu menyesuaikan rencananya tiap bulan.' },
  { q: 'Bisa berhenti kapan saja?', a: 'Bisa. Langganan bulanan bisa dibatalkan sampai 48 jam sebelum tanggal pemrosesan berikutnya. Paket prabayar 3/6 bulan berjalan sampai periodenya selesai.' },
];

export default function LandingBeratBadan() {
  return (
    <>
      {/* Hero */}
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '64px 20px 48px', maxWidth: 720 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-meta)' }}>PROGRAM BERAT BADAN</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)' }}>Turun berat badan dengan pendampingan dokter — bukan sekadar obat.</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Kuis 90 detik menentukan jalurmu: GLP-1 suntik mingguan atau program oral. Dokter meninjau, kamu lihat harga sebelum bayar.
          </p>
          <Link href="/dara/kuis/berat-badan" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
            Mulai konsultasi gratis
          </Link>
        </div>
      </section>

      <TrustBar />

      {/* Two tiers — EQUAL design weight */}
      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h2)' }}>Dua jalur. Kuis yang menentukan, dokter yang memutuskan.</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--text-secondary)', maxWidth: '58ch' }}>Keduanya program penuh — beda di obat dan cara pengambilannya, bukan di keseriusan pendampingannya.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
            <TierCard
              eyebrow="Suntik mingguan" name="Jalur GLP-1"
              description="Wegovy® atau Mounjaro®, dosis diatur bertahap oleh dokter."
              priceFrom="Rp 3.900.000" delivery="Obat diambil / diberikan di klinik partner"
              features={['Penurunan lebih besar pada uji klinis', 'Titrasi & cek gejala prioritas', 'Pendampingan makan & aktivitas']}
              href="/dara/kuis/berat-badan" ctaLabel="Cek kecocokanmu"
            />
            <TierCard
              eyebrow="Obat oral harian" name="Program Oral"
              description="Obat oral yang diresepkan dokter + pendampingan ahli gizi."
              priceFrom="Rp 749.000" delivery="Diantar diskret ke rumah"
              features={['Tinjauan dokter & resep', 'Pendampingan ahli gizi', 'Check-in mingguan']}
              href="/dara/kuis/berat-badan" ctaLabel="Cek kecocokanmu"
            />
          </div>
        </div>
      </section>

      {/* Med preference module — Wegovy vs Mounjaro ONLY (no Ozempic) */}
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h2)' }}>Di jalur GLP-1, kamu boleh punya preferensi.</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--text-secondary)', maxWidth: '58ch' }}>Tandai yang kamu condong — keputusan akhir tetap oleh doktermu, setelah membaca riwayatmu.</p>
          <MedPrefPreview />
          <p style={{ margin: '16px 0 0', fontSize: 12.5, color: 'var(--text-meta)', lineHeight: 1.6 }}>
            Angka hasil dari uji klinis; hasil tiap orang berbeda. Ozempic® tidak ditawarkan untuk berat badan — indikasinya diabetes tipe 2. Merek adalah milik pemiliknya; Dara tidak berafiliasi.
          </p>
        </div>
      </section>

      {/* Price anchor */}
      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 'var(--text-h2)' }}>Beli obat sendiri itu bisa. Sendirian yang mahal.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ background: 'var(--surface-card-tint)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-meta)' }}>BELI SENDIRI DI APOTEK</p>
              <p className="dara-mono-price" style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 600 }}>±Rp 3.100.000<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-meta)' }}>/pen</span></p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>Tanpa titrasi terjadwal, tanpa cek gejala, tanpa pendamping saat mual di minggu kedua. Dan kamu yang harus memastikan pennya asli.</p>
            </div>
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--dara-terracotta)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--dara-terracotta)' }}>PROGRAM DARA</p>
              <p className="dara-mono-price" style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 600 }}>Rp 3.900.000<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-meta)' }}>/bln</span></p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>Obat + dokter + titrasi + pendampingan makan & aktivitas + tim care prioritas. Satu harga, tidak naik saat dosismu naik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'var(--text-h2)' }}>Yang sering ditanyakan</h2>
          <FAQAccordion items={FAQ} />
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/dara/kuis/berat-badan" style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
              Mulai konsultasi gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
