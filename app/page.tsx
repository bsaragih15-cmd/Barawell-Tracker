import { supabaseAdmin } from '@/lib/supabase/server';
import Cockpit from './Cockpit';
import type {
  ScoredRow, Coverage, Config, Stage, Milestone,
  SegData, SegSummary, SegMatrixCell, SegFunnel, RefillBin, ChannelRow, ProductMix, ActionRow,
} from './types';

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

  // Segmentation views (migration 0004). Tolerate absence so the cockpit still
  // renders if the segments engine hasn't been applied to this project yet.
  const seg = await Promise.all([
    sb.from('v_segment_summary').select('*').maybeSingle(),
    sb.from('v_segment_matrix').select('*'),
    sb.from('v_segment_funnel').select('*').maybeSingle(),
    sb.from('v_refill_cohort').select('*').order('ord'),
    sb.from('v_channel_mix').select('*').order('orders', { ascending: false }),
    sb.from('v_product_mix').select('*').maybeSingle(),
    sb.from('v_action_queue').select('*').order('queue').order('rn'),
  ]);
  const segData: SegData = {
    summary: (seg[0].data ?? null) as SegSummary | null,
    matrix: (seg[1].data ?? []) as SegMatrixCell[],
    funnel: (seg[2].data ?? null) as SegFunnel | null,
    refill: (seg[3].data ?? []) as RefillBin[],
    channels: (seg[4].data ?? []) as ChannelRow[],
    product: (seg[5].data ?? null) as ProductMix | null,
    queues: (seg[6].data ?? []) as ActionRow[],
  };

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
    <Cockpit
      rows={(rows.data ?? []) as ScoredRow[]}
      coverage={cov.data as Coverage}
      config={cfg.data as Config}
      stages={(stages.data ?? []) as Stage[]}
      milestones={(miles.data ?? []) as Milestone[]}
      seg={segData}
    />
  );
}
