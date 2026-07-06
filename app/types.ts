export type ScoredRow = {
  id: string; bucket: string; name: string; description: string | null;
  driver: string | null; base_type: string; direct_rp: number;
  uplift: number; coverage: number; build_cost: number; monthly_cost: number;
  tti: 'Q' | 'M' | 'S' | null; conf: number; ease: number;
  stage: number; stage_code: string; stage_name: string; stage_conf: number;
  pl_line: 'Revenue' | 'Gross margin' | 'Enabler'; recurring: boolean;
  owner: string | null; rag: 'Green' | 'Amber' | 'Red' | null; in_plan: boolean;
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
