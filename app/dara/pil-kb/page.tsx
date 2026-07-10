import Link from 'next/link';
import { TrustBar, FAQAccordion } from '../ui';

export const dynamic = 'force-dynamic';

const FAQ = [
  { q: 'Perlu ke dokter dulu?', a: 'Tidak perlu keluar rumah. Kuis singkat + tinjauan dokter online menggantikan antre di klinik — resep keluar bila dokter menilai aman, lalu pil diantar.' },
  { q: 'Pil apa yang akan aku dapat?', a: 'Yang cocok untukmu. Ada pil kombinasi, pil bebas-estrogen (mini pill), dan varian lain — dokter memilih berdasarkan riwayatmu, bukan stok gudang.' },
  { q: 'Paketnya seperti apa?', a: 'Polos. Nama pengirim netral, tidak ada label kesehatan di luar paket. Kiriman ulang otomatis datang 6 hari sebelum pilmu habis.' },
  { q: 'Kalau mau ganti jenis?', a: 'Kirim pesan ke tim care — dokter meninjau dan mengganti resepmu tanpa kuis ulang.' },
  { q: 'KB darurat?', a: 'Postpil tersedia lewat konsultasi apoteker (aturan OWA) dengan pengiriman cepat. Mulai dari halaman ini juga — pilih “KB darurat” di kuis.' },
];

export default function LandingPilKB() {
  return (
    <>
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '64px 20px 48px', maxWidth: 720 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-meta)' }}>PIL KB</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)' }}>Pil KB diantar ke rumahmu, dengan resep dokter — tanpa antre, tanpa canggung.</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Mulai Rp 149.000/bulan termasuk pengiriman. Kiriman ulang otomatis, 6 hari sebelum habis.
          </p>
          <Link href="/dara/kuis/pil-kb" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
            Cek kecocokanmu
          </Link>
        </div>
      </section>

      <TrustBar items={['Resep dokter berlisensi', 'Paket polos, pengirim netral', 'Kiriman ulang otomatis', 'Ganti jenis kapan saja']} />

      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-h2)' }}>Satu pil yang tepat — bukan satu pil untuk semua.</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--text-secondary)', maxWidth: '58ch' }}>
            Pil KB juga dipakai untuk kulit lebih tenang, nyeri haid berkurang, dan siklus yang bisa diprediksi. Kuis menanyakan apa yang paling penting buatmu — dokter memilihkan jenisnya.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              ['Pil kombinasi', 'Standar emas untuk kebanyakan orang — siklus teratur, kulit lebih tenang.'],
              ['Bebas-estrogen (mini pill)', 'Untuk yang menyusui, migrain dengan aura, atau berisiko dengan estrogen.'],
              ['KB darurat (Postpil)', 'Lewat konsultasi apoteker, pengiriman cepat & diskret.'],
            ].map(([t, d], i) => (
              <div key={i} style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 20, boxShadow: 'var(--shadow-card)' }}>
                <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>{t}</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'var(--text-h2)' }}>Yang sering ditanyakan</h2>
          <FAQAccordion items={FAQ} />
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/dara/kuis/pil-kb" style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
              Cek kecocokanmu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
