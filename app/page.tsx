import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import Cockpit from './Cockpit';
import type { ScoredRow, Coverage, Config, Stage, Milestone } from './types';

export const dynamic = 'force-dynamic'; // always read fresh (mutations revalidate)

export default async function Page() {
  const sb = supabaseAdmin();
  const [rows, cov, cfg, stages, miles] = await Promise.all([
    sb.from('v_initiatives_scored').select('*'),
    sb.from('v_coverage').select('*').single(),
    sb.from('config').select('*').single(),
    sb.from('stages').select('*').order('n'),
    sb.from('milestones').select('*').order('sort'),
  ]);

  if (rows.error) {
    return (
      <div className="wrap">
        <h1>Connection error</h1>
        <p className="mono" style={{ color: '#C0392B', marginTop: 8 }}>{rows.error.message}</p>
        <p style={{ marginTop: 12, color: 'var(--ink-2)' }}>
          Check <code>.env</code> (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and that the migration ran.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            href="/growth"
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--accent)',
              textDecoration: 'none',
              border: '1px solid #CDE7DD',
              background: 'var(--accent-soft)',
              borderRadius: 8,
              padding: '7px 12px',
            }}
          >
            Open Growth OS →
          </Link>
        </div>
      </div>
      <Cockpit
        rows={(rows.data ?? []) as ScoredRow[]}
        coverage={cov.data as Coverage}
        config={cfg.data as Config}
        stages={(stages.data ?? []) as Stage[]}
        milestones={(miles.data ?? []) as Milestone[]}
      />
    </>
  );
}
