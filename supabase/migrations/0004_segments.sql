-- ============================================================
-- Barawell — Customer Segmentation engine (migration 0004)
-- Additive. Adds the segmentation marts + the stable view contract
-- that powers the "Segments" cockpit tab.
--
-- Rule #1 (single source of truth; frontend reads computed values):
-- the segmentation model — value tiers, lifecycle windows, the
-- Value×Lifecycle matrix, the lifecycle funnel, the refill cohort,
-- channel/product roll-ups and the action queues — is COMPUTED once
-- in the ingestion step (scripts/ingest_segments.py, the same ETL role
-- the backlog's "n8n → register" feed will play) and landed here as
-- marts. The frontend reads the v_* views only; no segmentation math
-- in JS. The classification thresholds live in the ingestion script's
-- header and are restated in comments below so the engine is legible.
--
-- Why marts, not live views over a raw customer table: the source is a
-- 4.7k-row order-history export loaded out-of-band (egress policy blocks
-- a direct DB pipe from this session). Marts keep the load small and
-- keep real phone numbers out of the anon-readable surface. The v_*
-- names are the stable contract — swap the marts for computed views
-- when a live order feed exists, and the UI never changes.
--
-- Re-runnable (drops first). No PII is committed; marts are seeded by
-- ingestion against the live project.
-- ============================================================
drop view if exists v_action_queue;
drop view if exists v_product_mix;
drop view if exists v_channel_mix;
drop view if exists v_refill_cohort;
drop view if exists v_segment_funnel;
drop view if exists v_segment_matrix;
drop view if exists v_segment_summary;
drop view if exists v_customer_segments;
drop table if exists seg_orders;
drop table if exists seg_customers;
drop table if exists seg_action_queue;
drop table if exists seg_product;
drop table if exists seg_channel_stat;
drop table if exists seg_refill;
drop table if exists seg_funnel;
drop table if exists seg_matrix;
drop table if exists seg_summary;

-- ---------- headline stats (single row) ----------
-- Recency measured vs the latest order in the dataset (deterministic).
-- Value tiers: Whale ≥ Rp2M lifetime · Core ≥ Rp400k · else Entry.
-- Lifecycle (vs ~46-day median refill): Dormant >90d · At-risk 46–90d ·
-- Active-repeat ≤45d & ≥2 orders · New = 1 order ≤45d.
create table seg_summary (
  id               int primary key default 1 constraint seg_summary_one check (id = 1),
  customers        int,
  total_spend      numeric,
  avg_aov          numeric,
  repeaters        int,
  repeat_rate      numeric,   -- % of customers with ≥2 orders
  one_and_done     int,
  repeater_rev_pct numeric,   -- % of revenue from repeaters
  new_ct           int,
  active_ct        int,
  atrisk_ct        int,
  dormant_ct       int,
  whale_ct         int,
  bara_ct          int,
  bara_attach_pct  numeric,
  s100_ct          int,
  asof             date
);

-- ---------- Value × Lifecycle matrix (≤12 rows) ----------
create table seg_matrix (
  value_tier   text,
  lifecycle    text,
  customers    int,
  spend        numeric,
  avg_aov      numeric,
  avg_recency  int,
  primary key (value_tier, lifecycle)
);

-- ---------- lifecycle funnel (single row) ----------
create table seg_funnel (
  id            int primary key default 1 constraint seg_funnel_one check (id = 1),
  acquired      int,
  ordered_2plus int,
  ordered_3plus int,
  ordered_5plus int,
  one_and_done  int,
  lapsed        int
);

-- ---------- refill cohort: 1st→2nd order gap histogram ----------
create table seg_refill (
  bin       text primary key,
  ord       int,
  customers int
);

-- ---------- channel roll-up (order-level) ----------
create table seg_channel_stat (
  channel   text primary key,
  orders    int,
  customers int
);

-- ---------- product adoption / cross-sell headroom (single row) ----------
create table seg_product (
  id                     int primary key default 1 constraint seg_product_one check (id = 1),
  s50_buyers             int,
  s100_buyers            int,
  bara_buyers            int,
  tada_buyers            int,
  bara_crosssell_targets int,
  dosage_upsell_targets  int,
  customers              int
);

-- ---------- action queues: ranked, contactable target lists ----------
-- Bounded to the top ranks per queue (the operators work the head of the
-- list). Phone is intentionally NOT stored here — the anon key is public;
-- operators dial from the source register by name / cust_key.
create table seg_action_queue (
  queue        text not null,   -- refill_due | winback_value | cross_sell | channel_migrate | aov_expand
  rn           int  not null,   -- rank within queue (1 = act first)
  cust_key     int  not null,
  name         text,
  city         text,
  spend        numeric,
  orders_n     int,
  recency_days int,
  value_tier   text,
  lifecycle    text,
  reason       text,
  primary key (queue, rn)
);
create index on seg_action_queue(queue);

-- ============================================================
-- VIEW CONTRACT — what the frontend reads. Thin over the marts today;
-- the seam where a live-feed computation can be substituted later.
-- ============================================================
create view v_segment_summary as select * from seg_summary;
create view v_segment_matrix  as select * from seg_matrix;
create view v_segment_funnel  as select * from seg_funnel;
create view v_refill_cohort   as select bin, ord, customers from seg_refill;
create view v_channel_mix     as select channel, orders, customers from seg_channel_stat;
create view v_product_mix     as select * from seg_product;
create view v_action_queue    as select * from seg_action_queue;

-- ============================================================
-- RLS — same posture as the rest of the tool. Read-only for the app;
-- ingestion writes with the service role.
-- ============================================================
alter table seg_summary       enable row level security;
alter table seg_matrix        enable row level security;
alter table seg_funnel        enable row level security;
alter table seg_refill        enable row level security;
alter table seg_channel_stat  enable row level security;
alter table seg_product       enable row level security;
alter table seg_action_queue  enable row level security;
create policy anon_read_seg_summary on seg_summary      for select to anon using (true);
create policy anon_read_seg_matrix  on seg_matrix       for select to anon using (true);
create policy anon_read_seg_funnel  on seg_funnel       for select to anon using (true);
create policy anon_read_seg_refill  on seg_refill       for select to anon using (true);
create policy anon_read_seg_channel on seg_channel_stat for select to anon using (true);
create policy anon_read_seg_product on seg_product      for select to anon using (true);
create policy anon_read_seg_queue   on seg_action_queue for select to anon using (true);
create policy rw_seg_summary on seg_summary      for all to authenticated using (true) with check (true);
create policy rw_seg_matrix  on seg_matrix       for all to authenticated using (true) with check (true);
create policy rw_seg_funnel  on seg_funnel       for all to authenticated using (true) with check (true);
create policy rw_seg_refill  on seg_refill       for all to authenticated using (true) with check (true);
create policy rw_seg_channel on seg_channel_stat for all to authenticated using (true) with check (true);
create policy rw_seg_product on seg_product      for all to authenticated using (true) with check (true);
create policy rw_seg_queue   on seg_action_queue for all to authenticated using (true) with check (true);
