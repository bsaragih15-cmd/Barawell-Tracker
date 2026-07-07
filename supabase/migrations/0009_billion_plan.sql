-- ============================================================
-- 0009 — The Rp 1B plan
-- ============================================================
-- Target raised to Rp 1B/mo (break-even / neutral net-income scale). To make the
-- register's FULLY-REALIZED (gross) run-rate reach ~Rp 1B, the scale levers —
-- acquisition, new categories, GLP-1 — are revised to mature-state monthly pools,
-- and a B2B/clinic channel is added. Stages are UNTOUCHED, so the risk-adjusted
-- view still shows how much is de-risked today (~Rp 500M of the Rp 1B potential).
-- These pools are mature-state hypotheses (D8: flagged, not hidden).
-- ============================================================

update config set target = 1000000000, updated_at = now() where id = 1;

-- Acquisition: a working paid + TikTok + SEO engine at 1B scale.
update initiatives set direct_rp = 100000000, updated_at = now() where id = 'D1';  -- TikTok Shop + KOL   40 → 100
update initiatives set direct_rp =  70000000, updated_at = now() where id = 'D2';  -- Paid social/search  25 → 70
update initiatives set direct_rp =  35000000, updated_at = now() where id = 'D3';  -- SEO / content       15 → 35
update initiatives set direct_rp =  25000000, updated_at = now() where id = 'D4';  -- Referral            12 → 25
-- New categories / GLP-1 at scale.
update initiatives set direct_rp =  70000000, updated_at = now() where id = 'F3';  -- Hair-loss / skin    30 → 70
update initiatives set direct_rp = 130000000, updated_at = now() where id = 'F4';  -- GLP-1 program       45 → 130
update initiatives set direct_rp =  50000000, updated_at = now() where id = 'F5';  -- GLP-1 subscription  20 → 50

-- New lever: B2B / clinic / corporate-wellness — high volume, independent of the
-- constrained DTC / marketplace shelf.
insert into initiatives
  (id,bucket,name,description,driver,base_type,direct_rp,uplift,coverage,build_cost,monthly_cost,tti,conf,ease,stage,pl_line,recurring,owner,rag,in_plan,status,state_since,
   how_it_works,steps,done_when,depends_on,kpi_label,kpi_target,kpi_unit,kpi_baseline,kpi_leading)
values
('D6','D · Acquisition','B2B / clinic & corporate-wellness channel',
 'Wholesale to clinics, pharmacies and corporate-wellness programs — a high-volume channel independent of DTC acquisition constraints. Scales the base without fighting for blocked marketplace shelf.',
 'Wholesale volume','DIRECT',40000000,1,1,12000000,3000000,'M',2,2,1,'Revenue',true,null,null,false,'Active',now(),
 'Sell in bulk to clinics, pharmacies and corporate-wellness programs — a B2B channel that scales volume without competing for constrained DTC/marketplace shelf.',
 '["Define the B2B offer + wholesale pricing (needs G3)","Sign 2–3 pilot clinic/pharmacy partners","Build ordering + fulfilment for bulk","Layer in corporate-wellness programs","Track wholesale volume + margin"]'::jsonb,
 'First recurring wholesale orders shipping to clinic/corporate partners.',
 array['G3']::text[],'Active B2B accounts',20,'accts',0,false)
on conflict (id) do nothing;
