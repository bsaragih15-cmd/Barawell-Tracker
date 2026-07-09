-- ============================================================
-- 0011 — GLP-1: pivot from supply-gated to demand-gated
-- ============================================================
-- Founder brainstorm (session 2026-07-09) changed the program's core assumption:
--   · Supply is SECURED (Mounjaro/Ozempic via Pharmaxy) and already selling — so
--     supply/regulatory is NO LONGER the root gate. Demand + trust are.
--   · Go BROAD weight-management, FEMALE-LED, under a STANDALONE SUB-BRAND
--     (distinct from Barawell's men's-health line — a men's-ED brand can't credibly
--     sell female weight-loss).
--   · Named bottlenecks: DEMAND and TRUST. Channels: TikTok organic + Shopee + own site.
--   · PILOT-FIRST: prove trust + retention on a small cohort before scaling content/ads.
--
-- Reshape: two new demand/trust enablers gate F4; the regulatory (G6) and sourcing (G5)
-- cards are reframed from "universal blocker" to parallel de-risk / last-mile. Enablers
-- carry zero revenue pool (they unlock F4's pool — no double-count, same pattern as G1).
-- Economics pools still HELD pending validation (D8) — female-broad makes cold CAC real.
-- No scoring-math change; inputs, ownership, playbook, milestones only.
-- ============================================================

-- ---- New enablers: the demand engine and the trust layer --------------------------
insert into initiatives
  (id,bucket,name,description,driver,base_type,direct_rp,uplift,coverage,build_cost,monthly_cost,tti,conf,ease,stage,pl_line,recurring,owner,rag,in_plan,status,state_since,
   how_it_works,steps,done_when,depends_on,kpi_label,kpi_target,kpi_unit,kpi_baseline,kpi_leading)
values
('G7','G · Enablers','Weight-management demand & content engine',
 'Stand up the standalone sub-brand''s organic demand engine — TikTok organic + a Shopee storefront + the own-site funnel. Compliant demand-gen (education / lifestyle / results, NOT drug-claim ads). Zero direct revenue on its own; it makes the F4 weight-management pool reachable. The #1 bottleneck (demand) lives here.',
 'UNLOCK: GLP-1 demand','DIRECT',0,1,1,8000000,6000000,'M',3,3,1,'Enabler',true,null,null,false,'Active',now(),
 'The organic top-of-funnel for the female weight-management sub-brand: a TikTok handle publishing compliant education / lifestyle / results content, a Shopee storefront for discovery, and an own-site landing that routes to the eligibility quiz. Paid stays off the drug itself (policy risk); attribution (G1) goes in before any Shopee ad spend.',
 '["Name + launch the standalone sub-brand TikTok handle","Ship a first compliant content batch (education / lifestyle / real results)","Open the Shopee storefront for the weight-management line","Wire the own-site landing → eligibility quiz (F6)","Stand up attribution (G1) before any paid Shopee spend"]'::jsonb,
 'Organic content live and driving qualified quiz starts under the sub-brand, with CAC measurable before paid scale.',
 null,'Qualified quiz starts / mo',200,'starts',0,true),

('G8','G · Enablers','Trust & clinical credibility layer',
 'The trust unlock for buying a prescription injectable online from an unknown (new) brand: a visible licensed-doctor consult, real before/after social proof, transparent pricing, and a discreet-shipping promise. Zero direct revenue; it converts F4''s demand. The #2 bottleneck (trust) lives here.',
 'UNLOCK: GLP-1 trust/conversion','DIRECT',0,1,1,6000000,1000000,'M',3,3,1,'Enabler',false,'andrew',null,false,'Active',now(),
 'Everything that makes a cold female buyer trust a new brand with an Rx injectable: surface a named licensed doctor + the async consult, publish real patient before/afters and reviews, show transparent titration pricing, and promise discreet delivery. Turns demand (G7) into paying, retained patients.',
 '["Surface a licensed doctor + the async consult in the funnel","Collect + publish real before/after results and reviews","Make pricing + the titration schedule transparent","Add a discreet-shipping promise","Track consult-completion and quiz→paid conversion"]'::jsonb,
 'A credible clinical + social-proof layer live in the funnel, lifting quiz→paid conversion.',
 null,'Quiz → paid conversion',null,'%',null,true)
on conflict (id) do nothing;

-- ---- F4: reframe to the standalone, demand-gated, pilot-first program -------------
update initiatives set
  how_it_works = 'A medically-supervised GLP-1 weight-management program sold under a STANDALONE brand (distinct from Barawell''s men''s-health line) — async consult, titration protocol, monthly supply. Broad audience, female-led. Supply is secured (Pharmaxy) and already selling small-scale, so the gates are DEMAND (G7) and TRUST (G8), not supply. Pilot-first: prove month-2/3 retention on a small cohort before scaling content/ads.',
  steps = '["Name + stand up the standalone weight-management sub-brand + funnel","Wire the eligibility quiz (F6) as the lead-capture entry","Run a pilot cohort with concierge onboarding on the titration protocol","Prove month-2/3 retention before scaling demand","Then scale via TikTok organic + Shopee (G7); de-risk regulatory (G6) before paid"]'::jsonb,
  done_when = 'A pilot cohort live on protocol under the standalone brand, with month-3 retention measured — before scaling paid. Regulatory (G6) must clear before ad-scale.',
  depends_on = array['F6','G7','G8']::text[],
  next_action = 'Name + stand up the standalone weight-management sub-brand; wire the eligibility quiz as the funnel entry.',
  next_due = '2026-08-15',
  updated_at = now()
where id = 'F4';

-- ---- G6: reframe from universal blocker → de-risk-before-scale (parallel) ---------
update initiatives set
  how_it_works = 'NO LONGER the universal blocker — supply + small-scale sales are already live. This de-risks the BPOM / telehealth-Rx exposure that Barawell is quietly absorbing at low volume, BEFORE demand is scaled with paid. Branded-import scope (Wegovy/Mounjaro via Pharmaxy). Runs in parallel with the demand/trust build; must clear before ad-scale.',
  done_when = 'Branded-import regulatory pathway confirmed in writing (BPOM classification, import/distribution licence, telehealth Rx rules) — the green light to scale paid acquisition.',
  updated_at = now()
where id = 'G6';

-- ---- G5: supply secured → scope down to cold-chain last-mile, off critical path ---
update initiatives set
  description = 'Supply is secured via Pharmaxy (branded Mounjaro/Ozempic), so this is no longer the sourcing gate. Scoped down to the cold-chain LAST-MILE (2–8°C delivery integrity) plus a backup licensed-sourcing line. Off the critical path; needed before volume, not before the pilot.',
  how_it_works = 'With primary supply secured (Pharmaxy), this covers the cold-chain last mile — validated 2–8°C delivery to patients — and a backup licensed-sourcing line so a single supplier isn''t a single point of failure at volume.',
  steps = '["Validate 2–8°C last-mile delivery (packaging + 3PL)","Confirm Pharmaxy supply terms + lead times at pilot volume","Line up a backup licensed-sourcing option for scale","Contract cold-chain capacity ahead of volume"]'::jsonb,
  done_when = 'Validated cold-chain last-mile + a backup sourcing option for scale (primary supply already secured).',
  next_action = 'Validate 2–8°C last-mile delivery for the pilot; confirm Pharmaxy terms at pilot volume.',
  next_due = '2026-09-30',
  updated_at = now()
where id = 'G5';

-- ---- F4 milestones: reflect the pivot ---------------------------------------------
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F4','Standalone weight-management sub-brand + funnel live','2026-09-15',false,0
  where not exists (select 1 from milestones where initiative_id='F4' and title='Standalone weight-management sub-brand + funnel live');
-- supply is secured → the old "cold-chain supplier signed" milestone becomes last-mile validation
update milestones set title='Cold-chain last-mile validated (supply secured via Pharmaxy)', due_date='2026-09-30'
  where initiative_id='F4' and title='Cold-chain supplier signed (G5)';

-- ---- Change-log --------------------------------------------------------------------
insert into change_log (entity,entity_id,field,old_val,new_val,who) values
 ('initiative','F4','strategy','male/supply-gated','broad weight-mgmt · female-led · standalone brand · demand-gated','migration 0011'),
 ('initiative','F4','depends_on','G6,G5,F6','F6,G7,G8','migration 0011'),
 ('initiative','G7','created',null,'Weight-management demand & content engine','migration 0011'),
 ('initiative','G8','created',null,'Trust & clinical credibility layer','migration 0011'),
 ('initiative','G6','scope','root gate (blocks all)','de-risk before ad-scale (parallel)','migration 0011'),
 ('initiative','G5','scope','sourcing gate','cold-chain last-mile (supply secured via Pharmaxy)','migration 0011');
