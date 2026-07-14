import { supabaseAdmin } from '@/lib/supabase/server';
import GrowthOS from './GrowthOS';
import type {
  AnomalyRow,
  ChannelDriver,
  CrmPlayEffectiveness,
  CrmWorkspaceRow,
  ExperimentReadout,
  GrowthChannel,
  GrowthCohort,
  GrowthData,
  GrowthInsight,
  GrowthMonthly,
  GrowthProduct,
  GrowthScorecard,
  ProductDriver,
  RefillCohort,
  SegmentFunnel,
  SegmentHistory,
  SegmentMatrix,
  SegmentMovement,
  SegmentSummary,
} from './types';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Barawell · Growth OS',
  description: 'Historical performance, automatic insights, CRM execution, and experiments.',
};

const maskName = (customerKey: string) => {
  const suffix = customerKey.replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `Customer ${suffix}`;
};

const emptyResult = Promise.resolve({ data: [], error: null });

export default async function GrowthPage() {
  const sb = supabaseAdmin();
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const workspaceView = hasServiceRole ? 'v_crm_workspace' : 'v_crm_workspace_masked';

  const results = await Promise.all([
    sb.from('v_growth_scorecard').select('*').maybeSingle(),
    sb.from('v_growth_monthly_performance').select('*').order('metric_month'),
    sb.from('v_growth_cohorts').select('*').order('cohort_month'),
    sb.from('v_growth_channel_trend').select('*').order('metric_month'),
    sb.from('v_growth_product_trend').select('*').order('metric_month'),
    sb.from('v_growth_segment_history').select('*').order('snapshot_month'),
    sb.from('v_growth_segment_movement').select('*').order('snapshot_month'),
    sb.from('v_growth_pulse').select('*').limit(12),
    sb.from(workspaceView).select('*').order('play_code').order('rank'),
    hasServiceRole ? sb.from('v_crm_play_effectiveness').select('*') : emptyResult,
    hasServiceRole ? sb.from('v_crm_experiment_readout').select('*') : emptyResult,
    sb.from('v_segment_summary').select('*').maybeSingle(),
    sb.from('v_segment_matrix').select('*'),
    sb.from('v_segment_funnel').select('*').maybeSingle(),
    sb.from('v_refill_cohort').select('*').order('ord'),
    sb.from('v_growth_channel_drivers').select('*').order('revenue_change'),
    sb.from('v_growth_product_drivers').select('*').order('revenue_change'),
    sb.from('v_growth_anomaly_history').select('*').order('metric_month'),
  ]);

  const warnings = results
    .map((result, index) => result.error ? `Dataset ${index + 1}: ${result.error.message}` : null)
    .filter((value): value is string => Boolean(value));

  const showCustomerNames = hasServiceRole && process.env.BARAWELL_SHOW_CUSTOMER_NAMES === 'true';
  const workspace = ((results[8].data ?? []) as CrmWorkspaceRow[]).map(row => ({
    ...row,
    customer_name: showCustomerNames
      ? row.customer_name
      : hasServiceRole
        ? maskName(row.customer_key)
        : row.customer_name,
  }));

  const data: GrowthData = {
    scorecard: (results[0].data ?? null) as GrowthScorecard | null,
    monthly: (results[1].data ?? []) as GrowthMonthly[],
    cohorts: (results[2].data ?? []) as GrowthCohort[],
    channels: (results[3].data ?? []) as GrowthChannel[],
    products: (results[4].data ?? []) as GrowthProduct[],
    segments: (results[5].data ?? []) as SegmentHistory[],
    movements: (results[6].data ?? []) as SegmentMovement[],
    insights: (results[7].data ?? []) as GrowthInsight[],
    workspace,
    effectiveness: (results[9].data ?? []) as CrmPlayEffectiveness[],
    experiments: (results[10].data ?? []) as ExperimentReadout[],
    summary: (results[11].data ?? null) as SegmentSummary | null,
    matrix: (results[12].data ?? []) as SegmentMatrix[],
    funnel: (results[13].data ?? null) as SegmentFunnel | null,
    refill: (results[14].data ?? []) as RefillCohort[],
    channelDrivers: (results[15].data ?? []) as ChannelDriver[],
    productDrivers: (results[16].data ?? []) as ProductDriver[],
    anomalies: (results[17].data ?? []) as AnomalyRow[],
    warnings,
  };

  return <GrowthOS data={data} showCustomerNames={showCustomerNames} />;
}
