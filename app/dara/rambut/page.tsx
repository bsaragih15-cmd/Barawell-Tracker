import Link from 'next/link';
import { TrustBar, FAQAccordion, StickyCta } from '../ui';

export const dynamic = 'force-dynamic';

const FAQ = [
  { q: 'Minoxidil benar-benar bekerja untuk perempuan?', a: 'Ya — minoxidil topikal adalah terapi dengan bukti terkuat untuk pola rontok perempuan. Kuncinya konsisten: hasil terlihat 3–6 bulan, dan kami jujur soal itu di depan.' },
  { q: 'Rontok setelah melahirkan — perlu obat?', a: 'Sering kali tidak: telogen effluvium pascamelahirkan biasanya pulih sendiri. Kuis dan dokter membantu membedakannya dari pola rontok yang butuh terapi.' },
  { q: 'Ada efek samping?', a: 'Sebagian orang mengalami iritasi ringan di kulit kepala pada minggu-minggu awal. Kirim foto lewat pesan — dokter menyesuaikan pemakaiannya.' },
  { q: 'Kenapa pakai foto progres?', a: 'Karena perubahan rambut pelan dan mudah tidak terasa. Foto bulanan dengan sudut sama membuat kemajuannya terlihat — dan keputusan lanjut/ubah jadi berdasar.' },
];

export default function LandingRambut() {
  return (
    <>
      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '64px 20px 48px', maxWidth: 720 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-meta)' }}>RAMBUT</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)' }}>Rontok itu umum. Membiarkannya, tidak harus.</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '52ch', fontSize: 'var(--text-body-lg)', color: 'var(--text-secondary)' }}>
            Minoxidil topikal + suplemen, disusun dokter untuk pola rontokmu — mulai Rp 299.000/bulan, diantar ke rumah.
          </p>
          <Link href="/dara/kuis/rambut" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
            Cek pola rontokmu
          </Link>
        </div>
      </section>

      <TrustBar items={['Terapi dengan bukti klinis', 'Ekspektasi jujur: 3–6 bulan', 'Foto progres bulanan', 'Diantar diskret']} />

      <section>
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'var(--text-h2)' }}>Jujur di depan: ini maraton, bukan sulap.</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            Bulan 1–2: rontok bisa terasa bertambah dulu (itu tanda folikel “restart”). Bulan 3–4: rontok melambat.
            Bulan 5–6: rambut baru mulai terlihat di foto progres. Kami menuliskannya di sini supaya kamu tidak berhenti tepat sebelum hasilnya datang.
          </p>
        </div>
      </section>

      <section className="dara-band">
        <div className="dara-wrap" style={{ padding: '48px 20px', maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'var(--text-h2)' }}>Yang sering ditanyakan</h2>
          <FAQAccordion items={FAQ} />
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/dara/kuis/rambut" style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--accent-action)', color: '#fff', fontWeight: 600, fontSize: 17, padding: '15px 28px', borderRadius: 'var(--radius-control)' }}>
              Cek pola rontokmu
            </Link>
          </div>
        </div>
      </section>
      <StickyCta href="/dara/kuis/rambut" label="Mulai konsultasi — gratis" />
    </>
  );
}
