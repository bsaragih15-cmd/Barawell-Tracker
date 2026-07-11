'use client';
/* Dara quiz engine — ported from the design handoff's QuizFlow (bb + KB
   branches kept nearly verbatim), extended with derm (kulit/rambut) and
   mental (cemas/tidur, crisis-screened) flows, the GLP-1 medication
   preference step, and a real intake that submits the case. */
import React from 'react';
import { Button, ProgressBar, Input, TierCard, MedicationCard, ConsentCheckbox, HelpStrip } from '../../ui';
import { submitCase } from '../../actions';

export type QuizCategory = 'berat-badan' | 'pil-kb' | 'kulit' | 'rambut' | 'cemas' | 'tidur';

const CAT_DB: Record<QuizCategory, string> = {
  'berat-badan': 'bb', 'pil-kb': 'kb', kulit: 'kulit', rambut: 'rambut', cemas: 'cemas', tidur: 'tidur',
};

/* big-type minimal — hairline rows instead of cards (from the prototype) */
function Row({ label, description, selected, onSelect }: { label: string; description?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: 'var(--border-hairline)', padding: '18px 2px', minHeight: 56, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 17, fontWeight: selected ? 650 : 450, color: selected ? 'var(--dara-terracotta)' : 'var(--text-primary)', lineHeight: 1.4, transition: 'color var(--dur-fast) var(--ease-out)' }}>{label}</span>
        {description && <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</span>}
      </span>
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dara-terracotta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
      )}
    </button>
  );
}

function H2({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <h2 style={{ margin: small ? '8px 0 0' : '4px 0 8px', fontFamily: 'var(--font-display)', fontSize: small ? 26 : 30, fontWeight: 550, lineHeight: small ? 1.25 : 1.12 }}>{children}</h2>;
}

const SageBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--dara-sage-tint)', borderRadius: 'var(--radius-card)', padding: '16px 18px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{children}</div>
);

const NextStepCard = () => (
  <div style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>Langkah berikutnya</p>
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)' }}>Dokter meninjau jawabanmu dalam 1×24 jam. Gratis, tanpa komitmen.</p>
  </div>
);

/* ── Intake: contact + consents → submitCase ── */
function Intake({ category, tier, medPref, answers, flagged }: { category: QuizCategory; tier?: string | null; medPref?: string | null; answers: Record<string, unknown>; flagged?: boolean }) {
  const [name, setName] = React.useState('');
  const [wa, setWa] = React.useState('');
  const [city, setCity] = React.useState('');
  const [cTele, setCTele] = React.useState(false);
  const [cPriv, setCPriv] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const ok = name.trim() && wa.trim() && cTele && cPriv;
  return (
    <>
      <H2 small>Satu langkah lagi — biar dokter bisa menghubungimu.</H2>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Jawaban kuismu ikut terkirim, hanya dibaca tim medis.</p>
      <Input label="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <Input label="Nomor WhatsApp" type="tel" value={wa} onChange={(e) => setWa(e.target.value)} hint="Hasil tinjauan dokter dikirim ke sini." autoComplete="tel" />
      <Input label="Kota" value={city} onChange={(e) => setCity(e.target.value)} hint={tier === 'glp1' ? 'Untuk mencocokkan klinik partner terdekat.' : undefined} />
      <ConsentCheckbox checked={cTele} onChange={setCTele}>
        Saya setuju menerima layanan telemedisin: konsultasi dilakukan daring oleh dokter berlisensi, dan resep diberikan hanya bila dokter menilainya aman.
      </ConsentCheckbox>
      <ConsentCheckbox checked={cPriv} onChange={setCPriv}>
        Saya setuju data kesehatan saya diproses untuk keperluan konsultasi ini, sesuai kebijakan privasi (UU PDP 27/2022).
      </ConsentCheckbox>
      {err && <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--dara-error)' }}>{err}</p>}
      <Button size="lg" fullWidth disabled={!ok || busy} onClick={async () => {
        setBusy(true); setErr('');
        try {
          await submitCase({
            category: CAT_DB[category], routed_tier: tier ?? null, med_pref: medPref ?? null,
            answers, flagged, full_name: name, wa_number: wa, city,
            consent_tele: cTele, consent_privacy: cPriv,
          });
        } catch (e: unknown) {
          // redirect() throws internally — only surface real errors
          if (e && typeof e === 'object' && 'digest' in e && String((e as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) throw e;
          setErr(e instanceof Error ? e.message : 'Gagal mengirim — coba lagi.');
          setBusy(false);
        }
      }}>
        {busy ? 'Mengirim…' : 'Kirim ke dokter'}
      </Button>
    </>
  );
}

export function QuizEngine({ category }: { category: QuizCategory }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, unknown>>({});
  // bb
  const [conds, setConds] = React.useState<string[]>([]);
  const [weight, setWeight] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [wErr, setWErr] = React.useState('');
  const [medPref, setMedPref] = React.useState<string | null>(null);
  // kb
  const [kbRisk, setKbRisk] = React.useState<string[]>([]);
  const [kbSituation, setKbSituation] = React.useState<string | null>(null);
  // derm
  const [concern, setConcern] = React.useState<string | null>(null);
  const [dermFlags, setDermFlags] = React.useState<string[]>([]);
  // mental
  const [mSeverity, setMSeverity] = React.useState<string | null>(null);
  const [mCrisis, setMCrisis] = React.useState<string | null>(null);
  const [mDuration, setMDuration] = React.useState<string | null>(null);

  const advance = (fn: () => void) => setTimeout(fn, 350);
  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) =>
    setter((c) => (id === 'none' ? ['none'] : c.includes(id) ? c.filter((x) => x !== id) : [...c.filter((x) => x !== 'none'), id]));

  const TOTALS: Record<QuizCategory, number> = { 'berat-badan': 5, 'pil-kb': 4, kulit: 3, rambut: 3, cemas: 4, tidur: 4 };
  const TOTAL = TOTALS[category];

  const frame = (children: React.ReactNode, opts?: { help?: boolean }) => (
    <div style={{ background: 'var(--surface-page)', minHeight: '70vh', fontFamily: 'var(--font-ui)', display: 'flex', flexDirection: 'column', maxWidth: 560, margin: '0 auto' }}>
      <ProgressBar value={Math.min(step, TOTAL) / TOTAL} />
      <div key={step} style={{ padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, animation: 'dara-stepin var(--dur-slow) var(--ease-out) both' }}>
        {step > 0 && step <= TOTAL && (
          <button onClick={() => setStep(step - 1)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: '4px 0', minHeight: 32, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-meta)', cursor: 'pointer' }}>
            ← Kembali
          </button>
        )}
        {children}
      </div>
      {opts?.help && <HelpStrip />}
    </div>
  );

  /* ═══════════════ BERAT BADAN ═══════════════ */
  if (category === 'berat-badan') {
    const bmi = weight && height ? +((+weight) / Math.pow(+height / 100, 2)).toFixed(1) : null;
    const fmtBmi = bmi != null ? String(bmi).replace('.', ',') : '—';
    const hardStop = conds.includes('hamil') || conds.includes('men2') || conds.includes('pankreatitis');
    const glp1Eligible = bmi != null && (bmi >= 27 || conds.includes('diabetes'));

    if (step === 0)
      return frame(
        <>
          <H2>Apakah salah satu dari ini berlaku untukmu?</H2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Pilih semua yang sesuai — jawabanmu hanya dibaca dokter.</p>
          <div style={{ borderTop: 'var(--border-hairline)' }}>
            {([['hamil', 'Sedang hamil atau menyusui'], ['men2', 'Riwayat kanker tiroid meduler / MEN2', 'Pada diri sendiri atau keluarga inti'], ['pankreatitis', 'Pernah pankreatitis'], ['diabetes', 'Diabetes tipe 2'], ['none', 'Tidak ada yang berlaku']] as [string, string, string?][]).map(([id, label, desc]) => (
              <Row key={id} label={label} description={desc} selected={conds.includes(id)} onSelect={() => toggle(setConds, id)} />
            ))}
          </div>
          <Button size="lg" fullWidth disabled={conds.length === 0} onClick={() => setStep(1)}>Lanjut</Button>
        </>
      );

    if (step === 1)
      return frame(
        <>
          <H2 small>Berat dan tinggi badanmu?</H2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Perkiraan saja tidak apa-apa. Ini titik mulai, bukan penilaian.</p>
          <Input label="Berat badan" type="number" suffix="kg" value={weight} error={wErr} onChange={(e) => { setWeight(e.target.value); setWErr(''); }} />
          <Input label="Tinggi badan" type="number" suffix="cm" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Button size="lg" fullWidth onClick={() => { if (!weight || !height) { setWErr('Berat dan tinggi badan wajib diisi'); return; } setStep(2); }}>Lanjut</Button>
        </>
      );

    if (step === 2) {
      if (hardStop) {
        const isHamil = conds.includes('hamil');
        return frame(
          <>
            <H2 small>Terima kasih sudah jujur. Program ini belum aman untukmu saat ini.</H2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {isHamil
                ? 'Obat penurun berat badan tidak dianjurkan selama kehamilan atau menyusui. Ini bukan pintu tertutup — ini soal waktu yang tepat.'
                : 'Dengan riwayat itu, obat golongan GLP-1 tidak boleh diberikan — risiko kesehatannya nyata, dan dokter mana pun yang baik akan berkata sama. Kamu justru terlindungi oleh jawabanmu sendiri.'}
            </p>
            <SageBox>Jalur lain yang aman: program pendampingan gizi & aktivitas tanpa obat, atau konsultasi spesialis penyakit dalam.</SageBox>
            <Button size="lg" fullWidth variant="secondary" onClick={() => { setConds([]); setStep(0); }}>Ubah jawabanku</Button>
          </>
        );
      }
      if (!glp1Eligible)
        return frame(
          <>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-meta)' }}>Hasil awalmu</p>
            <H2 small>BMI-mu {fmtBmi}. Berdasarkan jawabanmu, dokter kami biasanya menyarankan Program Oral.</H2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Jalur GLP-1 ditujukan untuk BMI 27 ke atas — di angkamu, manfaat obat suntik belum sepadan risikonya. Program Oral memakai obat oral + pendampingan ahli gizi, diantar ke rumah.
            </p>
            <TierCard
              eyebrow="Obat oral, diantar ke rumah" name="Program Oral"
              description="Obat oral yang diresepkan dokter + pendampingan ahli gizi, check-in mingguan."
              priceFrom="Rp 749.000" delivery="Diantar diskret ke rumah"
              features={['Tinjauan dokter & resep', 'Pendampingan ahli gizi', 'Check-in mingguan']}
              recommended ctaLabel="Lanjutkan dengan Program Oral"
              onCta={() => { setAnswers({ conds, weight, height, bmi }); setStep(4); }}
            />
            <Button variant="quiet" fullWidth onClick={() => setStep(1)}>Ubah jawabanku</Button>
          </>
        );
      return frame(
        <>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-meta)' }}>Hasil awalmu</p>
          <H2 small>BMI-mu {fmtBmi}. Ini titik mulai, bukan vonis.</H2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Kamu kemungkinan cocok untuk jalur GLP-1 (suntik mingguan). Dokter memastikan obat dan dosis yang paling pas untukmu.
          </p>
          <TierCard
            eyebrow="Suntik mingguan" name="Jalur GLP-1"
            description="Wegovy atau Mounjaro, dosis diatur bertahap oleh dokter."
            priceFrom="Rp 3.900.000" delivery="Ambil di klinik partner"
            features={['Penurunan lebih besar pada uji klinis', 'Titrasi & cek gejala prioritas', 'Pendampingan makan & aktivitas']}
            recommended ctaLabel="Lanjut — pilih preferensi obat"
            onCta={() => setStep(3)}
          />
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-meta)', lineHeight: 1.5 }}>Pilihan akhir — obat & dosis — ditentukan doktermu.</p>
        </>
      );
    }

    if (step === 3)
      return frame(
        <>
          <H2 small>Ada preferensi obat?</H2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Tandai preferensimu — keputusan akhir tetap oleh dokter setelah membaca jawabanmu.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            <MedicationCard name="Wegovy®" molecule="semaglutide" cadence="1× / minggu" results="hingga ±15%" priceLabel="Rp 3.900.000/bln" img="/dara/assets/pen-wegovy.png" selected={medPref === 'wegovy'} onSelect={() => setMedPref('wegovy')} />
            <MedicationCard name="Mounjaro®" molecule="tirzepatide" cadence="1× / minggu" results="hingga ±20%" priceLabel="Rp 4.400.000/bln" img="/dara/assets/pen-mounjaro-cut.png" selected={medPref === 'mounjaro'} onSelect={() => setMedPref('mounjaro')} />
          </div>
          <Button size="lg" fullWidth onClick={() => { setAnswers({ conds, weight, height, bmi }); setStep(4); }}>
            {medPref ? 'Lanjut' : 'Lanjut tanpa preferensi'}
          </Button>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-meta)' }}>Angka hasil dari uji klinis; hasil tiap orang berbeda. Obat suntik diambil di klinik partner — tidak dikirim ke rumah.</p>
        </>
      );

    return frame(<><NextStepCard /><Intake category={category} tier={glp1Eligible ? 'glp1' : 'oral'} medPref={medPref} answers={answers} /></>);
  }

  /* ═══════════════ PIL KB ═══════════════ */
  if (category === 'pil-kb') {
    const kbPregnant = kbRisk.includes('hamil');
    const estrogenRisk = ['hipertensi', 'migrain', 'merokok', 'pembekuan'].some((k) => kbRisk.includes(k));

    if (step === 0)
      return frame(
        <>
          <H2 small>Apakah salah satu dari ini berlaku untukmu?</H2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Ini menentukan jenis pil yang aman. Pilih semua yang sesuai — hanya dibaca dokter.</p>
          <div style={{ borderTop: 'var(--border-hairline)' }}>
            {([['hamil', 'Sedang hamil atau menyusui'], ['migrain', 'Migrain dengan aura', 'Sakit kepala didahului gangguan penglihatan atau kesemutan'], ['merokok', 'Merokok, dan usia 35 tahun ke atas'], ['hipertensi', 'Tekanan darah tinggi (di atas 140/90)'], ['pembekuan', 'Riwayat pembekuan darah, stroke, atau serangan jantung'], ['none', 'Tidak ada yang berlaku']] as [string, string, string?][]).map(([id, label, desc]) => (
              <Row key={id} label={label} description={desc} selected={kbRisk.includes(id)} onSelect={() => toggle(setKbRisk, id)} />
            ))}
          </div>
          <Button size="lg" fullWidth disabled={kbRisk.length === 0} onClick={() => setStep(1)}>Lanjut</Button>
        </>
      );

    if (step === 1)
      return frame(
        <>
          <H2 small>Kamu di titik mana sekarang?</H2>
          <div style={{ borderTop: 'var(--border-hairline)' }}>
            <Row label="Baru pertama kali pakai pil KB" selected={kbSituation === 'baru'} onSelect={() => { setKbSituation('baru'); advance(() => setStep(2)); }} />
            <Row label="Ingin ganti merek atau jenis" description="Yang sekarang kurang cocok" selected={kbSituation === 'ganti'} onSelect={() => { setKbSituation('ganti'); advance(() => setStep(2)); }} />
            <Row label="Lanjutkan pil yang sudah cocok" selected={kbSituation === 'lanjut'} onSelect={() => { setKbSituation('lanjut'); advance(() => setStep(2)); }} />
          </div>
        </>
      );

    if (step === 2) {
      if (kbPregnant)
        return frame(
          <>
            <H2 small>Terima kasih sudah jujur. Pil KB bukan untuk masa ini.</H2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Pil KB tidak diberikan selama hamil. Saat menyusui, ada pilihan bebas-estrogen — tapi waktunya dan jenisnya ditentukan dokter setelah melihat kondisimu.
            </p>
            <SageBox>Yang bisa kamu lakukan sekarang: konsultasikan KB pascamelahirkan dengan bidan/dokter — tim kami bantu arahkan ke pilihan yang aman.</SageBox>
            <Button size="lg" fullWidth variant="secondary" onClick={() => { setKbRisk([]); setStep(0); }}>Ubah jawabanku</Button>
          </>
        );
      return frame(
        <>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-meta)' }}>Hasil awalmu</p>
          {estrogenRisk ? (
            <>
              <H2 small>Pil kombinasi mungkin bukan yang teraman — tapi kamu punya pilihan.</H2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Dari jawabanmu, pil dengan estrogen berisiko lebih tinggi untukmu. Kabar baiknya: ada pil bebas-estrogen (progestin, sering disebut “pil mini”) yang kerap cocok. Dokter yang memastikan mana yang aman — bukan tebakan.
              </p>
            </>
          ) : (
            <>
              <H2 small>Sepertinya kamu cocok untuk konsultasi pil KB.</H2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Berdasarkan jawabanmu, dokter kemungkinan bisa meresepkan pil KB online.{' '}
                {kbSituation === 'baru' && 'Karena ini pertama kalimu, dokter menjelaskan cara mulai yang aman.'}
                {kbSituation === 'ganti' && 'Ceritakan keluhan dengan merek sebelumnya — dokter carikan yang lebih cocok.'}
                {kbSituation === 'lanjut' && 'Kalau merekmu aman dilanjutkan, dokter meresepkan yang sama.'}
              </p>
            </>
          )}
          <NextStepCard />
          <Button size="lg" fullWidth onClick={() => { setAnswers({ kbRisk, kbSituation }); setStep(3); }}>Lanjut</Button>
        </>
      );
    }

    return frame(<Intake category={category} tier={estrogenRisk ? 'estrogen_free' : null} answers={answers} />);
  }

  /* ═══════════════ KULIT / RAMBUT ═══════════════ */
  if (category === 'kulit' || category === 'rambut') {
    const isKulit = category === 'kulit';
    const pregnant = dermFlags.includes('hamil');
    if (step === 0)
      return frame(
        <>
          <H2 small>{isKulit ? 'Apa yang paling mengganggumu?' : 'Seperti apa rontok yang kamu alami?'}</H2>
          <div style={{ borderTop: 'var(--border-hairline)' }}>
            {(isKulit
              ? [['jerawat', 'Jerawat yang datang terus', 'Terutama di dagu & rahang menjelang haid'], ['bekas', 'Bekas jerawat & flek'], ['tekstur', 'Tekstur & garis halus']]
              : [['pitak', 'Menipis di belahan / ubun-ubun'], ['pascamelahirkan', 'Rontok banyak setelah melahirkan'], ['stres', 'Rontok merata, sering saat keramas']]
            ).map(([id, label, desc]) => (
              <Row key={id} label={label} description={desc} selected={concern === id} onSelect={() => { setConcern(id); advance(() => setStep(1)); }} />
            ))}
          </div>
        </>
      );
    if (step === 1)
      return frame(
        <>
          <H2 small>Apakah salah satu dari ini berlaku untukmu?</H2>
          <div style={{ borderTop: 'var(--border-hairline)' }}>
            {([['hamil', 'Sedang hamil, menyusui, atau berencana hamil'], ['sensitif', isKulit ? 'Kulit sangat sensitif / eksim' : 'Kulit kepala sensitif / mudah iritasi'], ['tiroid', 'Masalah tiroid atau anemia yang diketahui'], ['none', 'Tidak ada yang berlaku']] as [string, string][]).map(([id, label]) => (
              <Row key={id} label={label} selected={dermFlags.includes(id)} onSelect={() => toggle(setDermFlags, id)} />
            ))}
          </div>
          <Button size="lg" fullWidth disabled={dermFlags.length === 0} onClick={() => setStep(2)}>Lanjut</Button>
        </>
      );
    if (step === 2)
      return frame(
        <>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-meta)' }}>Hasil awalmu</p>
          <H2 small>{pregnant
            ? (isKulit ? 'Ada jalur yang aman untuk masa kehamilan.' : 'Ada jalur yang aman untuk masa ini.')
            : (isKulit ? 'Kamu kemungkinan cocok untuk formula resep.' : 'Kamu kemungkinan cocok untuk paket rambut.')}
          </H2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {pregnant
              ? (isKulit
                ? 'Tretinoin tidak diberikan saat hamil/menyusui — dokter akan mengarahkan ke azelaic acid dan bahan lain yang aman.'
                : 'Minoxidil tidak dianjurkan saat hamil/menyusui — dokter akan menyusun rencana yang aman dulu.')
              : (isKulit
                ? 'Dokter meracik rutinitas resep sesuai kulitmu — dan menyesuaikannya lewat pesan seiring progres.'
                : 'Minoxidil + suplemen, dengan ekspektasi jujur: hasil terlihat 3–6 bulan. Foto progres bulanan membantumu melihatnya.')}
          </p>
          <NextStepCard />
          <Button size="lg" fullWidth onClick={() => { setAnswers({ concern, dermFlags }); setStep(3); }}>Lanjut</Button>
        </>
      );
    return frame(<Intake category={category} answers={answers} />);
  }

  /* ═══════════════ CEMAS / TIDUR (mental) ═══════════════ */
  const isCemas = category === 'cemas';
  if (step === 0)
    return frame(
      <>
        <H2 small>{isCemas ? 'Dua minggu terakhir, seberapa sering rasa cemas mengganggumu?' : 'Dua minggu terakhir, seberapa sering tidurmu bermasalah?'}</H2>
        <div style={{ borderTop: 'var(--border-hairline)' }}>
          {([['ringan', 'Beberapa hari'], ['sedang', 'Lebih dari separuh hari'], ['berat', 'Hampir setiap hari']] as [string, string][]).map(([id, label]) => (
            <Row key={id} label={label} selected={mSeverity === id} onSelect={() => { setMSeverity(id); advance(() => setStep(1)); }} />
          ))}
        </div>
      </>,
      { help: true }
    );
  if (step === 1)
    return frame(
      <>
        <H2 small>Sudah berapa lama begini?</H2>
        <div style={{ borderTop: 'var(--border-hairline)' }}>
          {([['baru', 'Baru beberapa minggu'], ['bulan', 'Beberapa bulan'], ['lama', 'Lebih dari setahun']] as [string, string][]).map(([id, label]) => (
            <Row key={id} label={label} selected={mDuration === id} onSelect={() => { setMDuration(id); advance(() => setStep(2)); }} />
          ))}
        </div>
      </>,
      { help: true }
    );
  if (step === 2)
    return frame(
      <>
        <H2 small>Pertanyaan penting — dan kami bertanya karena peduli.</H2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Dua minggu terakhir, apakah pernah terpikir untuk menyakiti diri sendiri?</p>
        <div style={{ borderTop: 'var(--border-hairline)' }}>
          <Row label="Tidak pernah" selected={mCrisis === 'tidak'} onSelect={() => { setMCrisis('tidak'); advance(() => setStep(3)); }} />
          <Row label="Pernah terlintas" selected={mCrisis === 'kadang'} onSelect={() => { setMCrisis('kadang'); advance(() => setStep(3)); }} />
          <Row label="Sering, atau ada rencana" selected={mCrisis === 'sering'} onSelect={() => { setMCrisis('sering'); advance(() => setStep(3)); }} />
        </div>
      </>,
      { help: true }
    );
  if (step === 3) {
    if (mCrisis === 'sering')
      return frame(
        <>
          <H2 small>Terima kasih sudah menjawab jujur. Kamu tidak sendirian.</H2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Yang kamu rasakan nyata dan layak ditangani orang yang tepat — lebih cepat dari yang bisa kami berikan lewat program ini.
          </p>
          <div style={{ background: 'var(--dara-info-tint)', border: '1px solid var(--dara-info)', borderRadius: 'var(--radius-card)', padding: '18px 20px', fontSize: 15, lineHeight: 1.6, color: 'var(--dara-info)' }}>
            <strong>Hubungi sekarang:</strong> layanan krisis Kemenkes <strong>119 ext. 8</strong> (24 jam, gratis), atau datang ke IGD terdekat. Kalau mau, kirimkan kontakmu di langkah berikut — psikolog partner kami akan menghubungimu lebih dulu.
          </div>
          <Button size="lg" fullWidth onClick={() => { setAnswers({ severity: mSeverity, duration: mDuration, crisis: mCrisis }); setStep(4); }}>
            Minta dihubungi psikolog partner
          </Button>
        </>,
        { help: true }
      );
    return frame(
      <>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-meta)' }}>Hasil awalmu</p>
        <H2 small>{isCemas ? 'Cemasmu bisa dikelola — dan kamu tidak harus sendirian.' : 'Tidurmu bisa membaik — dengan rencana, bukan sekadar obat.'}</H2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {isCemas
            ? 'Dokter akan menilai apakah obat membantu (bukan golongan psikotropika) dan menyusun rencana dengan check-in bulanan.'
            : 'Program kami memakai melatonin non-resep + perbaikan kebiasaan tidur 8 minggu. Kami tidak menjual obat tidur golongan psikotropika — itu aturan yang melindungimu.'}
        </p>
        <NextStepCard />
        <Button size="lg" fullWidth onClick={() => { setAnswers({ severity: mSeverity, duration: mDuration, crisis: mCrisis }); setStep(4); }}>Lanjut</Button>
      </>,
      { help: true }
    );
  }
  return frame(<Intake category={category} answers={answers} flagged={mCrisis === 'sering'} />, { help: true });
}
