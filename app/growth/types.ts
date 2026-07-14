export type Numeric = number | string | null;

export type GrowthScorecard = {
  metric_month: string;
  revenue: Numeric;
  prior_revenue: Numeric;
  revenue_change: Numeric;
  revenue_change_pct: Numeric;
  repeat_rate: Numeric;
  repeat_rate_change: Numeric;
  repeat_revenue_share: Numeric;
  repeat_revenue_share_change: Numeric;
  aov: Numeric;
  owned_order_share: Numeric;
  revenue_target: Numeric;
  repeat_rate_target: Numeric;
};

export type GrowthMonthly = {
  metric_month: string;
  orders: number;
  revenue: Numeric;
  customers: number;
  aov: Numeric;
  new_orders: number;
  new_revenue: Numeric;
  new_customers: number;
  repeat_orders: number;
  repeat_revenue: Numeric;
  repeat_customers: number;
  repeat_rate: Numeric;
  repeat_revenue_share: Numeric;
  owned_orders: number;
  marketplace_orders: number;
  other_orders: number;
  is_complete: boolean;
  owned_order_share: Numeric;
  prior_revenue: Numeric;
  revenue_change: Numeric;
  repeat_rate_change: Numeric;
};

export type GrowthCohort = {
  cohort_month: string;
  customers: number;
  repeat_45: number;
  repeat_90: number;
  repeat_45_rate: Numeric;
  repeat_90_rate: Numeric;
  revenue_90: Numeric;
  revenue_90_per_customer: Numeric;
};

export type GrowthChannel = {
  metric_month: string;
  channel: string;
  channel_group: 'owned' | 'marketplace' | 'other';
  orders: number;
  customers: number;
  revenue: Numeric;
  order_share: Numeric;
  revenue_share: Numeric;
};

export type GrowthProduct = {
  metric_month: string;
  product: string;
  orders: number;
  customers: number;
  revenue: Numeric;
  customer_penetration: Numeric;
};

export type SegmentHistory = {
  snapshot_month: string;
  value_tier: 'Whale' | 'Core' | 'Entry';
  lifecycle: 'New' | 'Active-repeat' | 'At-risk' | 'Dormant';
  customers: number;
  revenue: Numeric;
  avg_aov: Numeric;
  avg_recency: Numeric;
  customer_share: Numeric;
  revenue_share: Numeric;
};

export type SegmentMovement = {
  snapshot_month: string;
  from_value_tier: string;
  from_lifecycle: string;
  to_value_tier: string;
  to_lifecycle: string;
  customers: number;
  revenue: Numeric;
};

export type GrowthInsight = {
  id: number;
  insight_key: string;
  generated_for: string;
  metric: string;
  insight_type: string;
  headline: string;
  narrative: string;
  actual_value: Numeric;
  comparison_value: Numeric;
  delta_value: Numeric;
  delta_pct: Numeric;
  expected_low: Numeric;
  expected_high: Numeric;
  driver_dimension: string | null;
  driver_member: string | null;
  affected_customers: number | null;
  confidence: Numeric;
  priority_score: Numeric;
  recommended_play: string | null;
};

export type CrmWorkspaceRow = {
  play_code: string;
  source_rank: number;
  customer_key: string;
  customer_name: string;
  city: string | null;
  lifetime_revenue: Numeric;
  order_count: number;
  recency_days: number;
  value_tier: string;
  lifecycle: string;
  reason: string;
  aov: Numeric;
  reorder_propensity: Numeric;
  cross_sell_propensity: Numeric;
  churn_risk: Numeric;
  response_propensity: Numeric;
  action_propensity: Numeric;
  expected_incremental_value: Numeric;
  priority_score: Numeric;
  rank: number;
  assignment_id: number | null;
  assigned_to: string | null;
  assignment_status: string | null;
  due_at: string | null;
};

export type CrmPlayEffectiveness = {
  play_code: string;
  name: string;
  assignments: number;
  contacts: number;
  responses: number;
  conversions: number;
  attributed_revenue: Numeric;
  attributed_gross_profit: Numeric;
  contact_to_order_rate: Numeric;
};

export type ExperimentReadout = {
  experiment_id: number;
  code: string;
  play_code: string;
  hypothesis: string;
  status: string;
  arm: 'treatment' | 'holdout' | null;
  members: number;
  conversions: number;
  revenue: Numeric;
  conversion_rate: Numeric;
};

export type SegmentSummary = {
  customers: number;
  total_spend: Numeric;
  avg_aov: Numeric;
  repeaters: number;
  repeat_rate: Numeric;
  one_and_done: number;
  repeater_rev_pct: Numeric;
  new_ct: number;
  active_ct: number;
  atrisk_ct: number;
  dormant_ct: number;
  whale_ct: number;
  bara_ct: number;
  bara_attach_pct: Numeric;
  s100_ct: number;
  asof: string;
};

export type SegmentMatrix = {
  value_tier: string;
  lifecycle: string;
  customers: number;
  spend: Numeric;
  avg_aov: Numeric;
  avg_recency: Numeric;
};

export type SegmentFunnel = {
  acquired: number;
  ordered_2plus: number;
  ordered_3plus: number;
  ordered_5plus: number;
  one_and_done: number;
  lapsed: number;
};

export type RefillCohort = { bin: string; ord: number; customers: number };

export type ChannelDriver = {
  channel: string;
  channel_group: string;
  current_month: string;
  prior_month: string;
  current_orders: number;
  prior_orders: number;
  current_revenue: Numeric;
  prior_revenue: Numeric;
  current_customers: number;
  prior_customers: number;
  order_change: number;
  revenue_change: Numeric;
  contribution_to_change: Numeric;
};

export type ProductDriver = {
  product: string;
  current_month: string;
  prior_month: string;
  current_orders: number;
  prior_orders: number;
  current_revenue: Numeric;
  prior_revenue: Numeric;
  current_customers: number;
  prior_customers: number;
  order_change: number;
  revenue_change: Numeric;
  contribution_to_change: Numeric;
};

export type AnomalyRow = GrowthMonthly & {
  expected_revenue: Numeric;
  expected_low: Numeric;
  expected_high: Numeric;
  is_anomaly: boolean;
};

export type GrowthData = {
  scorecard: GrowthScorecard | null;
  monthly: GrowthMonthly[];
  cohorts: GrowthCohort[];
  channels: GrowthChannel[];
  products: GrowthProduct[];
  segments: SegmentHistory[];
  movements: SegmentMovement[];
  insights: GrowthInsight[];
  workspace: CrmWorkspaceRow[];
  effectiveness: CrmPlayEffectiveness[];
  experiments: ExperimentReadout[];
  summary: SegmentSummary | null;
  matrix: SegmentMatrix[];
  funnel: SegmentFunnel | null;
  refill: RefillCohort[];
  channelDrivers: ChannelDriver[];
  productDrivers: ProductDriver[];
  anomalies: AnomalyRow[];
  warnings: string[];
};
