import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { StatusChip, HelpStrip } from '../../ui';
import { PlanCheckout } from './PlanCheckout';

export const dynamic = 'force-dynamic';
// The case page must always reflect the live DB row — a doctor may update the
// case out-of-band, and patients reopen this link from WhatsApp for days.
export const fetchCache = 'force-no-store';

const CAT_LABEL: Record<string, string> = {
  bb: 'Program Berat Badan', kb: 'Pil KB', kulit: 'Kulit', rambut: 'Rambut', cemas: 'Program Cemas', tidur: 'Program Tidur',
};

function rp(n: number) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

export default async function CasePage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const db = supabaseAdmin();
  const { data: c } = await db.from('dara_cases').select('*').eq('id', params.id).single();
  if (!c) notFound();
  const { data: plan } = c.plan_id
    ? await db.from('dara_plans').select('*').eq('id', c.plan_id).single()
    : { data: null };

  const isMental = c.category === 'cemas' || c.category === 'tidur';
  const firstName = String(c.full_name || '').split(' ')[0];

  return (
    <>
      <div className="dara-wrap" style={{ maxWidth: 640, padding: '40px 20px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>{CAT_LABEL[c.category] || c.category}</p>
            <h1 style={{ margin: '4px 0 0', fontSize: 26 }}>Halo, {firstName}.</h1>
          </div>
          <StatusChip status={c.status} />
        </div>

        {/* ── in_review ── */}
        {c.status === 'in_review' && (
          <>
            <div style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Jawabanmu sudah di meja dokter.</p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Dokter meninjau dalam 1×24 jam. Hasilnya kami kirim ke WhatsApp <strong>{c.wa_number}</strong> — dan halaman ini akan berubah begitu ada keputusan. Simpan tautannya.
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>Tidak ada biaya apa pun sampai kamu melihat rencana & harga dan memutuskan lanjut.</p>
          </>
        )}

        {/* ── needs_info ── */}
        {c.status === 'needs_info' && (
          <div style={{ background: 'var(--dara-info-tint)', border: '1px solid var(--dara-info)', borderRadius: 'var(--radius-card)', padding: 24 }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--dara-info)' }}>Dokter butuh info tambahan.</p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {c.doctor_note || 'Tim care akan menghubungimu lewat WhatsApp untuk melengkapi datamu.'}
            </p>
          </div>
        )}

        {/* ── approved: plan reveal + checkout ── */}
        {c.status === 'approved' && plan && (
          <>
            <div style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>Rencana dari doktermu</p>
              <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                {c.doctor_note || 'Dokter sudah meninjau jawabanmu dan menyusun rencana ini untukmu.'}
              </p>
            </div>
            <PlanCheckout
              caseId={c.id}
              plan={{
                id: plan.id, name: plan.name, medication: plan.medication, features: plan.features ?? [],
                fulfillment: plan.fulfillment, monthly: plan.monthly_price, m3: plan.price_3mo, m6: plan.price_6mo,
              }}
            />
          </>
        )}

        {/* ── paid: portal-lite ── */}
        {c.status === 'paid' && plan && (
          <>
            <div style={{ background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{plan.name}</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{plan.medication}</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                Durasi: <strong>{c.term_months} bulan</strong> · {rp(plan.monthly_price)}/bln
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>Aktif sejak {new Date(c.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div style={{ background: plan.fulfillment === 'clinic_pickup' ? 'var(--dara-sage-tint)' : 'var(--surface-card-tint)', borderRadius: 'var(--radius-card)', padding: 20 }}>
              <p style={{ margin: '0 0 6px', fontWeight: 650, fontSize: 15 }}>
                {plan.fulfillment === 'clinic_pickup' ? 'Langkah berikutnya: jadwal klinik' : 'Langkah berikutnya: pengiriman pertama'}
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {plan.fulfillment === 'clinic_pickup'
                  ? `Tim care menghubungimu lewat WhatsApp (${c.wa_number}) untuk menjadwalkan pengambilan / suntikan pertama di klinik partner terdekat${c.city ? ` di ${c.city}` : ''}. Obat suntik tidak dikirim ke rumah — aturan yang melindungimu.`
                  : `Paket pertamamu disiapkan dan dikirim diskret dengan nama pengirim netral. Nomor resi menyusul lewat WhatsApp (${c.wa_number}). Kiriman ulang otomatis datang 6 hari sebelum habis.`}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-meta)' }}>
              Butuh mengubah sesuatu? Balas pesan WhatsApp tim care — termasuk jeda atau berhenti (hingga 48 jam sebelum pemrosesan berikutnya).
            </p>
          </>
        )}

        {/* ── rejected — warm, with a path ── */}
        {c.status === 'rejected' && (
          <div style={{ background: 'var(--dara-sage-tint)', borderRadius: 'var(--radius-card)', padding: 24 }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Program ini bukan jalur yang aman untukmu saat ini.</p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              {c.doctor_note || 'Dokter menilai program ini belum tepat untuk kondisimu — dan itu keputusan yang melindungimu. Tim care akan mengarahkan ke pilihan yang lebih aman lewat WhatsApp.'}
            </p>
          </div>
        )}
      </div>
      {isMental && <HelpStrip />}
    </>
  );
}
