import { supabaseAdmin } from '@/lib/supabase/server';
import { adminDecide } from '../actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/* Ops console — unbranded, utilitarian, table-first (per design brief §5).
   Guarded by ?key=<DARA_ADMIN_KEY>. Server-rendered forms + server actions. */

function rp(n: number) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

export default async function AdminPage({ searchParams }: { searchParams: { key?: string } }) {
  const key = searchParams.key || '';
  const expected = process.env.DARA_ADMIN_KEY || 'dara-ops';
  if (key !== expected) {
    return (
      <div className="dara-wrap" style={{ maxWidth: 480, padding: '64px 20px' }}>
        <h1 style={{ fontSize: 24, margin: '0 0 12px' }}>Konsol ops</h1>
        <form method="get" style={{ display: 'flex', gap: 8 }}>
          <input name="key" type="password" placeholder="Kunci admin" style={{ flex: 1, padding: '12px 14px', border: 'var(--border-hairline)', borderRadius: 'var(--radius-control)', fontSize: 15 }} />
          <button style={{ padding: '12px 20px', border: 'none', borderRadius: 'var(--radius-control)', background: 'var(--dara-ink)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Masuk</button>
        </form>
      </div>
    );
  }

  const db = supabaseAdmin();
  const [{ data: cases }, { data: plans }] = await Promise.all([
    db.from('dara_cases').select('*').order('created_at', { ascending: false }).limit(100),
    db.from('dara_plans').select('*').eq('active', true),
  ]);

  const badge = (s: string) => {
    const colors: Record<string, string> = { in_review: '#7E8F6E', approved: '#0F7A5A', needs_info: '#3F5E78', rejected: '#837567', paid: '#0F7A5A', cancelled: '#837567' };
    return <span style={{ fontSize: 12, fontWeight: 700, color: colors[s] || '#333' }}>{s}</span>;
  };

  return (
    <div className="dara-wrap" style={{ padding: '32px 20px 64px' }}>
      <h1 style={{ fontSize: 24, margin: '0 0 4px' }}>Konsol ops — antrean kasus</h1>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-meta)' }}>{(cases ?? []).length} kasus terakhir · in_review menunggu keputusan</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(cases ?? []).map((c) => {
          const catPlans = (plans ?? []).filter((p) => p.category === c.category);
          return (
            <div key={c.id} style={{ background: '#fff', border: 'var(--border-hairline)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline', fontSize: 14 }}>
                <strong>{c.full_name}</strong>
                <span style={{ color: 'var(--text-meta)' }}>{c.wa_number}{c.city ? ` · ${c.city}` : ''}</span>
                <span style={{ fontWeight: 600 }}>{c.category}{c.routed_tier ? `/${c.routed_tier}` : ''}</span>
                {c.med_pref && <span style={{ color: 'var(--text-secondary)' }}>pref: {c.med_pref}</span>}
                {c.flagged && <span style={{ color: 'var(--dara-error)', fontWeight: 700 }}>⚑ FLAGGED — follow up manusia</span>}
                {badge(c.status)}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-meta)' }}>{new Date(c.created_at).toLocaleString('id-ID')}</span>
              </div>
              <details>
                <summary style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Jawaban kuis</summary>
                <pre style={{ fontSize: 12, background: 'var(--surface-card-tint)', padding: 10, borderRadius: 8, overflowX: 'auto' }}>{JSON.stringify(c.answers, null, 2)}</pre>
              </details>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-meta)' }}>
                Tautan pasien: <a href={`/dara/kasus/${c.id}`}>/dara/kasus/{c.id.slice(0, 8)}…</a>
                {c.plan_id && <> · plan: {c.plan_id}{c.term_months ? ` · ${c.term_months} bln` : ''}</>}
              </p>
              {(c.status === 'in_review' || c.status === 'needs_info') && (
                <form action={adminDecide} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', borderTop: 'var(--border-hairline)', paddingTop: 10 }}>
                  <input type="hidden" name="key" value={key} />
                  <input type="hidden" name="case_id" value={c.id} />
                  <select name="plan_id" defaultValue={catPlans[0]?.id || ''} style={{ padding: '8px 10px', borderRadius: 8, border: 'var(--border-hairline)', fontSize: 13 }}>
                    {catPlans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {rp(p.monthly_price)}/bln</option>
                    ))}
                  </select>
                  <input name="note" placeholder="Catatan dokter untuk pasien (opsional)" style={{ flex: 1, minWidth: 200, padding: '8px 10px', borderRadius: 8, border: 'var(--border-hairline)', fontSize: 13 }} />
                  <button name="decision" value="approved" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0F7A5A', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Setujui</button>
                  <button name="decision" value="needs_info" style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #3F5E78', background: 'transparent', color: '#3F5E78', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Butuh info</button>
                  <button name="decision" value="rejected" style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #837567', background: 'transparent', color: '#837567', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Tolak</button>
                </form>
              )}
            </div>
          );
        })}
        {(cases ?? []).length === 0 && <p style={{ color: 'var(--text-meta)' }}>Belum ada kasus.</p>}
      </div>
    </div>
  );
}
