import Link from 'next/link';
import { TrustBar } from './ui';

export const dynamic = 'force-dynamic';

const STEPS = [
  ['Isi kuis singkat', '60–90 detik, gratis, tanpa komitmen.'],
  ['Dokter meninjau', 'Dokter berlisensi membaca jawabanmu dalam 1×24 jam.'],
  ['Terima rencanamu', 'Obat & program yang dipilihkan untukmu — harga jelas di depan.'],
  ['Didampingi tiap bulan', 'Kiriman ulang otomatis, tim care selalu bisa dihubungi.'],
];

function CatCard({ href, title, blurb, price, feature = false }: { href: string; title: string; blurb: string; price: string; feature?: boolean }) {
  return (
    <Link href={href} className="dara-lift" style={{
      display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none',
      background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)', padding: feature ? '28px 24px' : '20px 18px',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: feature ? 26 : 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</span>
      <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{blurb}</span>
      <span style={{ marginTop: 'auto', paddingTop: 8, fontSize: 13, color: 'var(--text-meta)' }}>
        mulai <span className="dara-mono-price" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{price}</span>/bln
        <span style={{ float: 'right', color: 'var(--dara-terracotta)', fontWeight: 600 }}>Mulai kuis →</span>
      </span>
    </Link>
  );
}

export default function DaraHome() {
  return (
    <>
      {/* Hero */}
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '72px 20px 56px', maxWidth: 760, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-hero)', lineHeight: 'var(--leading-display)' }}>Kesehatanmu, aturanmu.</h1>
          <p style={{ margin: '20px auto 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Berat badan, pil KB, kulit, rambut, sampai kesehatan mental — ditangani dokter berlisensi, diantar diskret, tanpa antre dan tanpa canggung.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dara/berat-badan" style={{ textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
              Mulai konsultasi gratis
            </Link>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Category decision — Berat feature card + 2×2 grid (incl. Pil KB) */}
      <section>
        <div className="dara-wrap" style={{ padding: '40px 20px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CatCard feature href="/dara/berat-badan" title="Berat badan" blurb="Turun berat dengan dokter di sisimu — jalur GLP-1 atau oral, bukan sekadar obat." price="Rp 749.000" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            <CatCard href="/dara/pil-kb" title="Pil KB" blurb="Diantar ke rumah dengan resep dokter — tanpa antre, tanpa canggung." price="Rp 149.000" />
            <CatCard href="/dara/kulit" title="Kulit" blurb="Formula resep untuk jerawat & flek." price="Rp 249.000" />
            <CatCard href="/dara/rambut" title="Rambut" blurb="Hentikan rontok lebih awal." price="Rp 299.000" />
            <CatCard href="/dara/kesehatan-mental" title="Kesehatan mental" blurb="Kelola cemas dan tidur, ditemani." price="Rp 199.000" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="dara-band" id="cara-kerja">
        <div className="dara-wrap" style={{ padding: '48px 20px' }}>
          <h2 style={{ margin: '0 0 28px', fontSize: 'var(--text-h2)' }}>Empat langkah, tanpa antre.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {STEPS.map(([t, d], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="dara-mono-price" style={{ fontSize: 15, fontWeight: 600, color: 'var(--dara-terracotta)' }}>{i + 1}</span>
                <span style={{ fontWeight: 650, fontSize: 16 }}>{t}</span>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest note */}
      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 720 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'var(--text-h2)' }}>Serius soal aman, santai soal sisanya.</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            Semua obat di Dara terdaftar BPOM dan hanya diberikan dengan resep dokter — kuis dan konsultasi dulu, bukan keranjang belanja.
            Obat suntik diambil di klinik partner (aturan yang melindungimu), sisanya diantar diskret ke rumah dengan nama pengirim netral.
          </p>
        </div>
      </section>
    </>
  );
}
