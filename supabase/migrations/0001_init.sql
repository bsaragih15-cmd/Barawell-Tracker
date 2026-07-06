-- ============================================================
-- Barawell Value-Capture Pipeline — Supabase migration
-- Schema + scoring/coverage views + seed. Idempotent-ish (drops first).
-- ============================================================
drop view if exists v_coverage;
drop view if exists v_initiatives_scored;
drop table if exists milestones;
drop table if exists initiatives;
drop table if exists stages;
drop table if exists config;

-- ---------- config (single row) ----------
create table config (
  id           int primary key default 1,
  current_rev  numeric not null,
  target       numeric not null,
  margin       numeric not null,
  repeat_share numeric not null,
  dtc_share    numeric not null,
  toko_lost    numeric not null,
  haircut      numeric not null,
  updated_at   timestamptz default now(),
  constraint config_singleton check (id = 1)
);

-- ---------- stage-gate reference ----------
create table stages (
  n          int primary key,
  code       text not null,
  name       text not null,
  confidence numeric not null      -- risk weighting applied to value at this stage
);

-- ---------- initiatives (the growing register) ----------
create table initiatives (
  id          text primary key,             -- stable ID, never renumber (A1, B2, ...)
  bucket      text not null,
  name        text not null,
  description text,
  driver      text,
  base_type   text not null check (base_type in ('TOTAL','REPEAT','NEW','DTC','MKT','TOKO_LOST','DIRECT')),
  direct_rp   numeric default 0,            -- used only when base_type = DIRECT
  uplift      numeric not null default 0,
  coverage    numeric not null default 0,
  build_cost  numeric not null default 0,
  monthly_cost numeric not null default 0,
  tti         text check (tti in ('Q','M','S')),
  conf        int not null default 3 check (conf between 1 and 5),
  ease        int not null default 3 check (ease between 1 and 5),
  stage       int not null default 1 references stages(n),
  pl_line     text not null default 'Revenue' check (pl_line in ('Revenue','Gross margin','Enabler')),
  recurring   boolean not null default true,
  owner       text,
  rag         text check (rag in ('Green','Amber','Red')),   -- null until in-flight
  in_plan     boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- milestones (drives RAG for in-flight initiatives) ----------
create table milestones (
  id            bigint generated always as identity primary key,
  initiative_id text not null references initiatives(id) on delete cascade,
  title         text not null,
  due_date      date,
  done          boolean not null default false,
  sort          int default 0
);
create index on milestones(initiative_id);

-- ============================================================
-- SCORING VIEW — the entire impact engine, computed in SQL.
-- Single source of truth; no formula drift.
-- ============================================================
create view v_initiatives_scored as
with c as (select * from config where id = 1),
base as (
  select i.*, s.code stage_code, s.name stage_name, s.confidence stage_conf,
         c.margin, c.target, c.current_rev cfg_rev,
         (case i.base_type
            when 'TOTAL'     then c.current_rev
            when 'REPEAT'    then c.current_rev * c.repeat_share
            when 'NEW'       then c.current_rev * (1 - c.repeat_share)
            when 'DTC'       then c.current_rev * c.dtc_share
            when 'MKT'       then c.current_rev * (1 - c.dtc_share)
            when 'TOKO_LOST' then c.toko_lost
            else i.direct_rp
          end) as base_rp
  from initiatives i
  join stages s on s.n = i.stage
  cross join c
),
s1 as (select base.*, (base_rp * uplift * coverage) as incr_rev from base),
s2 as (
  select s1.*,
         incr_rev * margin                              as incr_gp,
         incr_rev * stage_conf                          as ra_rev,
         (case when incr_rev >= 25000000 then 5
               when incr_rev >= 15000000 then 4
               when incr_rev >=  8000000 then 3
               when incr_rev >=  3000000 then 2 else 1 end) as impact
  from s1
)
select s2.*,
       incr_gp * stage_conf as ra_gp,
       3*incr_gp - build_cost - 3*monthly_cost as net_3mo,
       (case when (incr_gp - monthly_cost) <= 0 then null
             else build_cost / (incr_gp - monthly_cost) end) as payback_mo,
       impact * conf * ease as ice,
       (case
          when left(bucket,1) = 'G' then 'Enabler'
          when impact >= 4 and ease >= 4 then 'Quick Win'
          when impact >= 4 and ease <  4 then 'Big Bet'
          when impact <  4 and ease >= 4 then 'Fill-in'
          else 'Deprioritize' end) as quadrant,
       (select count(*) from milestones m where m.initiative_id = s2.id) as ms_total,
       (select count(*) from milestones m where m.initiative_id = s2.id and m.done) as ms_done
from s2;

-- ============================================================
-- COVERAGE VIEW — the transformation headline: pipeline vs target.
-- ============================================================
create view v_coverage as
with c as (select * from config where id = 1),
agg as (
  select coalesce(sum(case when stage >= 4 then ra_rev end),0) as committed,
         coalesce(sum(case when stage  = 3 then ra_rev end),0) as planned,
         coalesce(sum(case when stage <= 2 then ra_rev end),0) as pipeline
  from v_initiatives_scored
)
select c.current_rev, c.target,
       (c.target - c.current_rev) as gap,
       a.committed, a.planned, a.pipeline,
       (a.committed + a.planned + a.pipeline) as total_ra,
       (c.current_rev + a.committed + a.planned + a.pipeline) as projected,
       round((a.committed + a.planned + a.pipeline) / nullif(c.target - c.current_rev,0) * 100) as coverage_pct,
       round(a.committed / nullif(c.target - c.current_rev,0) * 100) as committed_pct
from agg a cross join c;

-- ============================================================
-- Row-Level Security — 3-person team, all authenticated users read/write.
-- Tighten later with per-role policies if needed.
-- ============================================================
alter table config      enable row level security;
alter table stages      enable row level security;
alter table initiatives enable row level security;
alter table milestones  enable row level security;
create policy rw_config on config      for all to authenticated using (true) with check (true);
create policy rw_stages on stages      for all to authenticated using (true) with check (true);
create policy rw_inits  on initiatives for all to authenticated using (true) with check (true);
create policy rw_miles  on milestones  for all to authenticated using (true) with check (true);

-- ============================================================
-- SEED
-- ============================================================
insert into config (id,current_rev,target,margin,repeat_share,dtc_share,toko_lost,haircut)
values (1, 210000000, 500000000, 0.55, 0.45, 0.15, 60000000, 0.25);

insert into stages (n,code,name,confidence) values
 (1,'L1','Idea',0.30),
 (2,'L2','Business case',0.50),
 (3,'L3','Planned',0.70),
 (4,'L4','In-flight',0.90),
 (5,'L5','Realized',1.00);

insert into initiatives (id,bucket,name,description,driver,base_type,direct_rp,uplift,coverage,build_cost,monthly_cost,tti,conf,ease,stage,pl_line,recurring,owner,rag,in_plan) values
('A1','A · Retention & repeat','Subscribe & save / auto-refill','Automatic recurring refills on a set cadence — converts one-off buyers into a subscription base. The core Hims LTV engine. Depends on G2 data.','Refill freq up / churn down','REPEAT',0,0.35,0.6,15000000,2000000,'M',4,3,2,'Revenue',true,null,null,false),
('A2','A · Retention & repeat','Segmented lifecycle flows','Replace blasting with targeted WA/email journeys — welcome, reorder-due, win-back, cross-sell. Segmented WA converts 2-5x a blast.','Repeat conversion up','REPEAT',0,0.4,0.7,8000000,1500000,'Q',4,4,3,'Revenue',true,null,null,true),
('A3','A · Retention & repeat','Adherence / reorder reminders','Nudge timed to when supply runs out, prompting reorder before lapse. Cheap, fast, pulls repeat revenue forward.','Refill rate up','REPEAT',0,0.15,0.7,3000000,500000,'Q',4,5,3,'Revenue',true,null,null,true),
('A4','A · Retention & repeat','Win-back lapsed buyers','One-off reactivation to quiet customers with an incentive. Cheapest revenue — you own the list.','Reactivation','REPEAT',0,0.12,0.5,2000000,500000,'Q',4,5,3,'Revenue',true,null,null,true),
('A5','A · Retention & repeat','Loyalty / VIP tier','Tiered rewards for high-value repeat customers. Deepens best-buyer LTV; build after A1-A4.','Frequency + retention up','REPEAT',0,0.1,0.5,12000000,1000000,'M',3,3,1,'Revenue',true,null,null,false),
('B1','B · AOV / basket','Bundles / performance stacks','Sell complementary products as a kit at a bundle price. Lifts AOV 15-30%. Needs G3 margin model to price.','AOV up','TOTAL',0,0.2,0.4,5000000,500000,'Q',4,4,2,'Revenue',true,null,null,true),
('B2','B · AOV / basket','Multi-month quantity pricing','Discount for buying 2-3 months at once. Lifts order value now and pre-commits refills.','AOV up + pre-commit','TOTAL',0,0.15,0.35,3000000,300000,'Q',4,4,2,'Revenue',true,null,null,true),
('B3','B · AOV / basket','Post-purchase 1-click upsell','One-tap add-on after checkout or in WA. Captures margin with near-zero friction.','Attach rate up','TOTAL',0,0.1,0.3,8000000,800000,'M',3,3,1,'Revenue',true,null,null,false),
('B4','B · AOV / basket','Free-ship / gift threshold','Basket value above which shipping is free. Simple lever to lift order value.','AOV up','TOTAL',0,0.06,0.4,1000000,200000,'Q',3,5,2,'Revenue',true,null,null,true),
('C1','C · Conversion','Quiz / assessment funnel','On-site questionnaire to recommendation to checkout. Signature Hims/Ro mechanic; captures first-party data.','Site conversion up','DTC',0,0.3,0.8,20000000,1500000,'M',3,2,1,'Revenue',true,null,null,false),
('C2','C · Conversion','Async doctor consult (productized)','Package the doctor review into a paid async consult. Turns biaya dokter into a conversion asset.','Trust to conversion up','DTC',0,0.15,0.6,12000000,2000000,'M',3,2,1,'Revenue',true,null,null,false),
('C3','C · Conversion','WhatsApp commerce optimization','Catalogue, one-tap reorder, saved cart, faster replies. Removes friction on the highest-intent SEA channel.','WA conversion up','DTC',0,0.25,0.7,10000000,1500000,'M',3,3,1,'Revenue',true,null,null,false),
('C4','C · Conversion','Abandoned-cart / chat recovery','Automated follow-up to non-completers. Recovers orders already ~80% done.','Recovered orders','DTC',0,0.12,0.6,5000000,800000,'Q',4,4,2,'Revenue',true,null,null,true),
('C5','C · Conversion','Social proof + discreet packaging','Reviews, ratings, discreet-shipping promise on listings. Counters the barang-las review issue.','Conversion up','TOTAL',0,0.05,0.5,3000000,300000,'Q',3,4,2,'Revenue',true,null,null,true),
('D1','D · Acquisition','TikTok Shop + affiliate / KOL','Enter TikTok Shop + recruit KOLs. Major Indonesia gap; high-growth but content/compliance risk for a regulated product.','New traffic','DIRECT',40000000,1,1,15000000,10000000,'M',3,3,1,'Revenue',true,null,null,false),
('D2','D · Acquisition','Paid social/search + attribution','Meta/Google + LTV:CAC discipline. GATED BY G1 — do not scale spend before attribution is live.','New traffic','DIRECT',25000000,1,1,5000000,15000000,'M',2,2,1,'Revenue',true,null,null,false),
('D3','D · Acquisition','SEO / content hub','Destigmatising, search-optimised library. Slow to compound but Hims biggest moat.','Organic traffic','DIRECT',15000000,1,1,10000000,5000000,'S',2,2,1,'Revenue',true,null,null,false),
('D4','D · Acquisition','Referral program','Give/get incentive for referrals. Low-cost acquisition in a high-trust category.','Referred customers','DIRECT',12000000,1,1,6000000,1000000,'M',3,3,1,'Revenue',true,null,null,false),
('D5','D · Acquisition','Marketplace internal-ads opt.','Optimise the Shopee/Tokopedia ad spend you already run. Improves conversion on traffic already shopping.','In-platform conversion','DIRECT',18000000,1,1,2000000,8000000,'Q',3,4,2,'Revenue',true,null,null,true),
('E1','E · Channel stabilization','Tokopedia blocking root-cause fix','Diagnose why stores get flagged and fix the cause + diversify risk. Uplift = pct of the ~Rp60M/mo lost revenue recovered.','Recover lost shelf','TOKO_LOST',0,0.6,1,5000000,1000000,'M',3,2,2,'Revenue',true,null,null,true),
('E2','E · Channel stabilization','Activate non-converting Shopee stores','Diagnose why 1-of-5 stores sells; replicate. Unlocks dormant shelf you own.','Store productivity','DIRECT',15000000,1,1,3000000,1000000,'M',3,3,2,'Revenue',true,null,null,true),
('E3','E · Channel stabilization','DTC-shift: margin + data off marketplace','Migrate volume, margin, data to your own web/WA. The long-run LTV bet; mostly a margin play.','Margin + LTV capture','DIRECT',15000000,1,1,25000000,3000000,'S',2,1,1,'Gross margin',true,null,null,false),
('E4','E · Channel stabilization','Review / reputation management','Solicit reviews, respond to negatives, manage ratings. Lifts marketplace conversion; repairs barang-las.','Conversion up','MKT',0,0.04,0.5,2000000,500000,'Q',3,4,2,'Revenue',true,null,null,true),
('E5','E · Channel stabilization','Jubelio SKU mapping fix','Fix the SKU mapping that zeroed stock across 55 stores. Protective — a 2nd stock-out in recovery is severe. In-flight.','Prevent stock-to-zero','DIRECT',0,1,1,3000000,0,'Q',4,3,4,'Enabler',false,null,'Green',true),
('F1','F · Assortment','Launch anxiety / sleep SKUs','New category (pending doctor approval) + cross-sell the base. Hims move beyond its first category.','New demand + cross-sell','DIRECT',25000000,1,1,10000000,2000000,'M',2,2,1,'Revenue',true,null,null,false),
('F2','F · Assortment','Push Baralas / racikan','Promote the differentiated, higher-margin Baralas now it is re-listed. Shifts mix toward better economics.','Mix to higher margin','TOTAL',0,0.08,0.4,2000000,500000,'Q',3,4,2,'Gross margin',true,null,null,true),
('F3','F · Assortment','Hair-loss / skin adjacency','Enter hair-loss/skincare — Hims proven 2nd category. Large pool but heavy build, longer horizon.','New category demand','DIRECT',30000000,1,1,30000000,5000000,'S',2,1,1,'Revenue',true,null,null,false),
('G1','G · Enablers','Attribution stack','Pixel, domain link, WA conversion tracking. 0 direct revenue but unlocks D1/D2. Planned.','UNLOCK: paid acquisition','DIRECT',0,1,1,6000000,500000,'Q',4,3,3,'Enabler',false,null,null,true),
('G2','G · Enablers','Data consolidation in Closari','Unify CRM + sales + broadcast. Precondition for the lifecycle marketing in A1-A5.','UNLOCK: segmentation','DIRECT',0,1,1,15000000,1500000,'M',3,2,2,'Enabler',false,null,null,true),
('G3','G · Enablers','COGS / margin model fix','True margin per product. Precondition for pricing bundles & subscription. In-flight.','UNLOCK: pricing','DIRECT',0,1,1,3000000,0,'Q',4,4,4,'Enabler',false,null,'Amber',true),
('G4','G · Enablers','QC / packing SOP','Eliminate packing errors. Protects brand as subscription raises repeat exposure. In-flight.','UNLOCK: brand protection','DIRECT',0,1,1,1000000,0,'Q',4,5,4,'Enabler',false,null,'Green',true);

insert into milestones (initiative_id,title,done,sort) values
('E5','SKU map audit across 55 stores',true,0),
('E5','Re-map & validate stock sync',true,1),
('E5','Go-live guardrail check',false,2),
('G3','Cost taxonomy defined (doctor, packaging, fulfil)',true,0),
('G3','Per-SKU margin computed',false,1),
('G3','Wired into pricing view',false,2),
('G4','Packing checklist drafted',true,0),
('G4','QC sign-off step live',true,1),
('A2','Segments defined in Closari',false,0),
('A2','First reorder flow live',false,1),
('G1','Pixel + domain link installed',false,0),
('G1','WA conversion event firing',false,1),
('E1','Root-cause diagnosis of blocks',false,0),
('E1','Store-risk diversification plan',false,1);