create table if not exists growth_monthly_metrics (
  metric_month date primary key,
  orders integer not null,
  revenue numeric not null,
  customers integer not null,
  aov numeric not null,
  new_orders integer not null,
  new_revenue numeric not null,
  new_customers integer not null,
  repeat_orders integer not null,
  repeat_revenue numeric not null,
  repeat_customers integer not null,
  repeat_rate numeric not null,
  repeat_revenue_share numeric not null,
  owned_orders integer not null,
  marketplace_orders integer not null,
  other_orders integer not null default 0,
  is_complete boolean not null default true,
  source_batch text not null,
  refreshed_at timestamptz not null default now()
);

create table if not exists growth_cohort_metrics (
  cohort_month date primary key,
  customers integer not null,
  repeat_45 integer not null,
  repeat_90 integer not null,
  repeat_45_rate numeric not null,
  repeat_90_rate numeric not null,
  revenue_90 numeric not null,
  revenue_90_per_customer numeric not null,
  source_batch text not null,
  refreshed_at timestamptz not null default now()
);

create table if not exists growth_channel_monthly (
  metric_month date not null,
  channel text not null,
  channel_group text not null check (channel_group in ('owned','marketplace','other')),
  orders integer not null,
  customers integer not null,
  revenue numeric not null,
  source_batch text not null,
  refreshed_at timestamptz not null default now(),
  primary key (metric_month, channel)
);

create table if not exists growth_product_monthly (
  metric_month date not null,
  product text not null,
  orders integer not null,
  customers integer not null,
  revenue numeric not null,
  source_batch text not null,
  refreshed_at timestamptz not null default now(),
  primary key (metric_month, product)
);

create table if not exists growth_segment_monthly (
  snapshot_month date not null,
  value_tier text not null check (value_tier in ('Whale','Core','Entry')),
  lifecycle text not null check (lifecycle in ('New','Active-repeat','At-risk','Dormant')),
  customers integer not null,
  revenue numeric not null,
  avg_aov numeric not null,
  avg_recency numeric not null,
  source_batch text not null,
  refreshed_at timestamptz not null default now(),
  primary key (snapshot_month, value_tier, lifecycle)
);

create table if not exists growth_segment_movement (
  snapshot_month date not null,
  from_value_tier text not null,
  from_lifecycle text not null,
  to_value_tier text not null,
  to_lifecycle text not null,
  customers integer not null,
  revenue numeric not null,
  source_batch text not null,
  refreshed_at timestamptz not null default now(),
  primary key (snapshot_month, from_value_tier, from_lifecycle, to_value_tier, to_lifecycle)
);

create table if not exists growth_metric_targets (
  metric text primary key,
  target numeric not null,
  direction text not null check (direction in ('higher','lower')),
  unit text not null,
  owner text,
  updated_at timestamptz not null default now()
);

create table if not exists growth_insights (
  id bigint generated always as identity primary key,
  insight_key text not null,
  generated_for date not null,
  metric text not null,
  insight_type text not null,
  headline text not null,
  narrative text not null,
  actual_value numeric,
  comparison_value numeric,
  delta_value numeric,
  delta_pct numeric,
  expected_low numeric,
  expected_high numeric,
  driver_dimension text,
  driver_member text,
  driver_contribution numeric,
  affected_customers integer,
  confidence numeric not null default 0.8 check (confidence between 0 and 1),
  business_impact numeric not null default 3 check (business_impact between 1 and 5),
  actionability numeric not null default 3 check (actionability between 1 and 5),
  urgency numeric not null default 3 check (urgency between 1 and 5),
  priority_score numeric generated always as (confidence * business_impact * actionability * urgency) stored,
  recommended_play text,
  status text not null default 'open' check (status in ('open','accepted','dismissed','expired')),
  expires_at date,
  generated_at timestamptz not null default now(),
  unique (insight_key, generated_for)
);

create table if not exists crm_plays (
  code text primary key,
  name text not null,
  objective text not null,
  default_due_days integer not null default 1,
  active boolean not null default true,
  sort integer not null
);

create table if not exists crm_experiments (
  id bigint generated always as identity primary key,
  code text not null unique,
  play_code text not null references crm_plays(code),
  hypothesis text not null,
  primary_metric text not null default 'conversion_rate',
  treatment_share numeric not null default 0.9 check (treatment_share > 0 and treatment_share < 1),
  start_date date not null,
  end_date date,
  owner text,
  status text not null default 'draft' check (status in ('draft','running','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists crm_experiment_members (
  experiment_id bigint not null references crm_experiments(id) on delete cascade,
  customer_key text not null,
  arm text not null check (arm in ('treatment','holdout')),
  assigned_at timestamptz not null default now(),
  primary key (experiment_id, customer_key)
);

create table if not exists crm_assignments (
  id bigint generated always as identity primary key,
  customer_key text not null,
  customer_name text not null,
  city text,
  play_code text not null references crm_plays(code),
  assigned_to text,
  priority_score numeric not null,
  expected_incremental_value numeric not null default 0,
  reason text not null,
  model_version text not null default 'heuristic-v1',
  experiment_id bigint references crm_experiments(id),
  status text not null default 'open' check (status in ('open','in_progress','converted','closed','snoozed')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_assignments_one_open
  on crm_assignments(customer_key, play_code)
  where status in ('open','in_progress','snoozed');

create table if not exists crm_activities (
  id bigint generated always as identity primary key,
  assignment_id bigint references crm_assignments(id) on delete set null,
  customer_key text not null,
  agent text,
  activity_type text not null check (activity_type in ('message','call','consultation','follow_up','note')),
  channel text,
  outcome text not null check (outcome in ('not_contacted','no_response','responded','interested','needs_consultation','follow_up_scheduled','ordered','not_interested','wrong_timing','price_concern','product_concern','delivery_concern','do_not_contact','other')),
  notes text,
  script_version text,
  next_follow_up_at timestamptz,
  occurred_at timestamptz not null default now()
);

create table if not exists crm_conversions (
  id bigint generated always as identity primary key,
  assignment_id bigint not null references crm_assignments(id) on delete cascade,
  order_id text,
  converted_at timestamptz not null default now(),
  attributed_revenue numeric not null default 0,
  attributed_gross_profit numeric not null default 0,
  attribution_window_days integer not null default 7,
  attribution_method text not null default 'post_contact_window',
  unique (assignment_id, order_id)
);

create index if not exists crm_activities_customer_idx on crm_activities(customer_key, occurred_at desc);
create index if not exists crm_assignments_play_idx on crm_assignments(play_code, status, priority_score desc);
create index if not exists growth_insights_priority_idx on growth_insights(status, priority_score desc, generated_at desc);

alter table growth_monthly_metrics enable row level security;
alter table growth_cohort_metrics enable row level security;
alter table growth_channel_monthly enable row level security;
alter table growth_product_monthly enable row level security;
alter table growth_segment_monthly enable row level security;
alter table growth_segment_movement enable row level security;
alter table growth_metric_targets enable row level security;
alter table growth_insights enable row level security;
alter table crm_plays enable row level security;
alter table crm_experiments enable row level security;
alter table crm_experiment_members enable row level security;
alter table crm_assignments enable row level security;
alter table crm_activities enable row level security;
alter table crm_conversions enable row level security;

insert into growth_metric_targets(metric,target,direction,unit,owner) values
  ('monthly_revenue',500000000,'higher','Rp','Founder'),
  ('repeat_rate',0.18,'higher','ratio','Growth'),
  ('repeat_revenue_share',0.40,'higher','ratio','Growth'),
  ('one_and_done_rate',0.75,'lower','ratio','CRM'),
  ('owned_order_share',0.55,'higher','ratio','Growth'),
  ('baralast_attach',0.05,'higher','ratio','Product')
on conflict(metric) do update set
  target=excluded.target,direction=excluded.direction,unit=excluded.unit,owner=excluded.owner,updated_at=now();

insert into crm_plays(code,name,objective,default_due_days,sort) values
  ('refill_due','Refill due','Reach customers near the evidence-based refill window.',1,1),
  ('new_customer_conversion','New customer conversion','Convert the first order into a second order.',2,2),
  ('winback_value','High-value winback','Recover Core and Whale customers before value is lost.',1,3),
  ('cross_sell','Cross-sell','Offer an approved complementary-product journey.',2,4),
  ('aov_expand','AOV expansion','Increase useful basket size for repeat customers.',2,5),
  ('channel_migrate','Channel migration','Move repeat marketplace customers to owned channels.',3,6),
  ('service_recovery','Service recovery','Resolve customer friction before commercial outreach.',1,7)
on conflict(code) do update set
  name=excluded.name,objective=excluded.objective,default_due_days=excluded.default_due_days,sort=excluded.sort;

revoke all on growth_monthly_metrics,growth_cohort_metrics,growth_channel_monthly,
  growth_product_monthly,growth_segment_monthly,growth_segment_movement,
  growth_metric_targets,growth_insights,crm_plays,crm_experiments,
  crm_experiment_members,crm_assignments,crm_activities,crm_conversions
  from anon,authenticated;

grant select,insert,update,delete on growth_monthly_metrics,growth_cohort_metrics,growth_channel_monthly,
  growth_product_monthly,growth_segment_monthly,growth_segment_movement,
  growth_metric_targets,growth_insights,crm_plays,crm_experiments,
  crm_experiment_members,crm_assignments,crm_activities,crm_conversions to service_role;
grant usage,select on all sequences in schema public to service_role;
