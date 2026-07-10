import Link from 'next/link';
import { TrustBar, FAQAccordion, HelpStrip } from '../ui';

export const dynamic = 'force-dynamic';

const FAQ = [
  { q: 'Obat apa yang dipakai untuk cemas?', a: 'Bila dokter menilai obat membantu, yang diresepkan adalah golongan yang aman untuk telemedisin (bukan psikotropika seperti benzodiazepine — itu aturan yang melindungimu). Sering kali rencananya kombinasi: obat + kebiasaan + check-in.' },
  { q: 'Kenapa tidak jual obat tidur?', a: 'Obat tidur golongan psikotropika tidak boleh diresepkan online di Indonesia — dan sering bukan jawaban jangka panjang. Program Tidur kami memakai melatonin non-resep + perbaikan kebiasaan 8 minggu.' },
  { q: 'Ini pengganti psikolog?', a: 'Bukan. Untuk banyak orang, program ini cukup; untuk sebagian, terapi bicara lebih tepat — dokter kami jujur mengarahkannya, termasuk merujuk ke psikolog partner.' },
  { q: 'Kalau kondisiku darurat?', a: 'Jangan tunggu program: hubungi 119 ext. 8 (24 jam, gratis) atau IGD terdekat. Kuis kami juga menanyakan ini dan langsung mengarahkanmu ke bantuan yang lebih cepat.' },
];

export default function LandingMental() {
  return (
    <>
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '64px 20px 48px', maxWidth: 720 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-meta)' }}>KESEHATAN MENTAL</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)' }}>Kelola cemas dan tidur — ditemani, bukan dihakimi.</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Dua program dengan dokter dan check-in rutin. Pelan-pelan, dengan rencana yang jelas.
          </p>
        </div>
      </section>

      <TrustBar items={['Dokter berlisensi', 'Check-in rutin', 'Privasi dijaga', 'Bukan psikotropika']} />

      {/* Two tracks */}
      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="dara-lift" style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-meta)' }}>CEMAS</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Program Cemas</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>Asesmen terstruktur, obat bila membantu (bukan psikotropika), check-in dokter tiap bulan, tim care kapan saja.</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13, color: 'var(--text-meta)' }}>mulai <span className="dara-mono-price" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Rp 349.000</span>/bln</p>
              <Link href="/dara/kuis/cemas" style={{ textDecoration: 'none', textAlign: 'center', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px 20px', borderRadius: 'var(--radius-control)' }}>Mulai asesmen</Link>
            </div>
            <div className="dara-lift" style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-meta)' }}>TIDUR</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Program Tidur</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>Melatonin non-resep + perbaikan kebiasaan tidur 8 minggu. Tanpa obat tidur keras — dan kami jelaskan kenapa.</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13, color: 'var(--text-meta)' }}>mulai <span className="dara-mono-price" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Rp 199.000</span>/bln</p>
              <Link href="/dara/kuis/tidur" style={{ textDecoration: 'none', textAlign: 'center', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px 20px', borderRadius: 'var(--radius-control)' }}>Mulai asesmen</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'var(--text-h2)' }}>Yang sering ditanyakan</h2>
          <FAQAccordion items={FAQ} />
        </div>
      </section>

      <HelpStrip />
    </>
  );
}
