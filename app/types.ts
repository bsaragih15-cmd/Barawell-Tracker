export type ScoredRow = {
  id: string; bucket: string; name: string; description: string | null;
  driver: string | null; base_type: string; direct_rp: number;
  uplift: number; coverage: number; build_cost: number; monthly_cost: number;
  tti: 'Q' | 'M' | 'S' | null; conf: number; ease: number;
  stage: number; stage_code: string; stage_name: string; stage_conf: number;
  pl_line: 'Revenue' | 'Gross margin' | 'Enabler'; recurring: boolean;
  owner: string | null; rag: 'Green' | 'Amber' | 'Red' | null; in_plan: boolean;
  rag_override: boolean;
  rag_auto: 'Green' | 'Amber' | 'Red' | null;
  rag_effective: 'Green' | 'Amber' | 'Red' | null;
  base_rp: number; incr_rev: number; incr_gp: number; ra_rev: number; ra_gp: number;
  net_3mo: number; payback_mo: number | null; impact: number; ice: number;
  quadrant: string; ms_total: number; ms_done: number;
};
export type Coverage = {
  current_rev: number; target: number; gap: number;
  committed: number; planned: number; pipeline: number; total_ra: number;
  projected: number; coverage_pct: number; committed_pct: number;
};
export type Config = {
  id: number; current_rev: number; target: number; margin: number;
  repeat_share: number; dtc_share: number; toko_lost: number; haircut: number;
};
export type Stage = { n: number; code: string; name: string; confidence: number };
export type Milestone = { id: number; initiative_id: string; title: string; due_date: string | null; done: boolean; sort: number };

// ---- Customer segmentation (marts behind the v_segment_* views) ----
export type SegSummary = {
  customers: number; total_spend: number; avg_aov: number; repeaters: number;
  repeat_rate: number; one_and_done: number; repeater_rev_pct: number;
  new_ct: number; active_ct: number; atrisk_ct: number; dormant_ct: number;
  whale_ct: number; bara_ct: number; bara_attach_pct: number; s100_ct: number;
  asof: string;
};
export type SegMatrixCell = {
  value_tier: 'Whale' | 'Core' | 'Entry';
  lifecycle: 'New' | 'Active-repeat' | 'At-risk' | 'Dormant';
  customers: number; spend: number; avg_aov: number; avg_recency: number;
};
export type SegFunnel = {
  acquired: number; ordered_2plus: number; ordered_3plus: number;
  ordered_5plus: number; one_and_done: number; lapsed: number;
};
export type RefillBin = { bin: string; ord: number; customers: number };
export type ChannelRow = { channel: string; orders: number; customers: number };
export type ProductMix = {
  s50_buyers: number; s100_buyers: number; bara_buyers: number; tada_buyers: number;
  bara_crosssell_targets: number; dosage_upsell_targets: number; customers: number;
};
export type ActionRow = {
  queue: string; rn: number; cust_key: number; name: string | null; city: string | null;
  spend: number; orders_n: number; recency_days: number;
  value_tier: string; lifecycle: string; reason: string;
};
export type SegData = {
  summary: SegSummary | null; matrix: SegMatrixCell[]; funnel: SegFunnel | null;
  refill: RefillBin[]; channels: ChannelRow[]; product: ProductMix | null; queues: ActionRow[];
};
