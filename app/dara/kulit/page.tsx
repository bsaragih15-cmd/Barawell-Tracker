import Link from 'next/link';
import { TrustBar, FAQAccordion } from '../ui';

export const dynamic = 'force-dynamic';

const FAQ = [
  { q: 'Apa bedanya dengan skincare biasa?', a: 'Bahan aktif resep — tretinoin, azelaic acid — bekerja pada akar masalah, bukan permukaannya. Karena resep, dokter yang menakar kekuatan dan memantau reaksi kulitmu.' },
  { q: 'Aman untuk kulit sensitif?', a: 'Dokter mulai dari kekuatan rendah dan menaikkannya pelan-pelan. Kalau kulitmu protes, kirim foto lewat pesan — formulanya disesuaikan.' },
  { q: 'Sedang hamil atau program hamil?', a: 'Tretinoin tidak diberikan saat hamil/menyusui. Kuis menanyakannya di awal dan dokter mengarahkan ke bahan yang aman, seperti azelaic acid.' },
  { q: 'Kapan terlihat hasilnya?', a: 'Jerawat aktif biasanya membaik dalam 6–8 minggu; bekas dan tekstur butuh 3–6 bulan. Foto progres bulanan membantumu melihat perubahan yang pelan.' },
];

export default function LandingKulit() {
  return (
    <>
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '64px 20px 48px', maxWidth: 720 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-meta)' }}>KULIT</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)' }}>Jerawat hormonal tidak sembuh oleh skincare rak toko.</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Formula resep yang diracik untuk kulitmu — tretinoin, azelaic acid, dan kombinasi lain — mulai Rp 249.000/bulan, diantar ke rumah.
          </p>
          <Link href="/dara/kuis/kulit" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
            Mulai dari kulitmu
          </Link>
        </div>
      </section>

      <TrustBar items={['Bahan aktif resep', 'Dokter memantau progresmu', 'Sesuaikan formula lewat pesan', 'Diantar diskret']} />

      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 'var(--text-h2)' }}>Pilih keluhanmu, dokter yang meracik.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              ['Jerawat yang datang terus', 'Terutama di dagu & rahang menjelang haid — sering hormonal, dan bisa ditangani dari dua arah (topikal + pil KB bila cocok).'],
              ['Bekas jerawat & flek', 'Retinoid resep + bahan pencerah yang ditakar dokter, bukan trial-and-error.'],
              ['Tekstur & garis halus', 'Tretinoin adalah bahan dengan bukti terpanjang — dimulai pelan supaya kulit tidak kaget.'],
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
            <Link href="/dara/kuis/kulit" style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
              Mulai dari kulitmu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
