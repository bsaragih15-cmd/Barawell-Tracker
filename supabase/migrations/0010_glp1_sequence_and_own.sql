-- ============================================================
-- 0010 — GLP-1 program: sequence, own, and start the root gate
-- ============================================================
-- Founder decisions (session 2026-07-09):
--   · Sourcing model  = BRANDED IMPORT (Wegovy/Mounjaro) — licence-heavy, higher COGS.
--   · G6 owner        = Berthin (drives BPOM classification + telehealth-Rx pathway).
--   · Build budget    = full ~Rp 103M approved upfront (cards may advance in parallel).
--   · Pricing to model= ~Rp 1.5–2M / titration-month, KPI 300 active patients.
--
-- This is workstream A (sequence & own the critical path) + starting G6. Data edits
-- go through migrations so repo = reality (CLAUDE.md). NO scoring math changes here —
-- inputs, ownership, playbook copy, and dated milestones only.
--
-- ECONOMICS HELD, NOT CHANGED: the Rp 130M (F4) / Rp 50M (F5) pools are UNTOUCHED.
-- The bottom-up model (docs/GLP1-ECONOMICS.md) shows they are materially inconsistent
-- with 300 patients × Rp 1.5–2M (implies ~Rp 450–600M, 4× the pool) and that branded
-- COGS likely makes Rp 1.5–2M loss-leading. Revising the pool / GLP-1 margin needs a
-- founder call first (D8) — flagged, not silently rewritten.
-- ============================================================

-- ---- Ownership: assign PICs across the cluster (owner_id FK → pics) --------------
-- Berthin owns the regulatory + licensed-sourcing spine (G6 confirmed by founder;
-- G5 is the same import-licence track, gated on G6). Andrew leads program delivery
-- (clinical screening, program launch, companion bundle). Jimmy owns the economics
-- layer (subscription pricing/retention — he already owns the gating G3 COGS model).
-- These are one-click editable in-app (setOwner); the G6 assignment is founder-set.
update initiatives set owner_id = 'berthin', updated_at = now() where id in ('G6','G5');
update initiatives set owner_id = 'andrew',  updated_at = now() where id in ('F6','F4','B5');
update initiatives set owner_id = 'jimmy',   updated_at = now() where id = 'F5';

-- ---- Start the root gate: G6 → Execute -------------------------------------------
-- Sourcing decided + owner assigned + counsel engagement dated → scoping is genuinely
-- underway. G6 is a zero-revenue enabler (direct_rp = 0), so advancing the gate does
-- NOT inflate any risk-adjusted value — it only signals the gate is live. (Guardrail:
-- never advance a REVENUE card to fake confidence; this is an enabler.)
update initiatives set stage = 3, state_since = now(), updated_at = now() where id = 'G6';

-- ---- Refine G6 / G5 playbook to the branded-import path ---------------------------
update initiatives set
  how_it_works = 'Clears the BPOM / prescribing pathway for BRANDED-IMPORT GLP-1 (Wegovy/Mounjaro) sold via telehealth — drug classification, import + distribution licence, and Rx rules. Zero direct revenue; the single legal gate on the entire GLP-1 bet.',
  steps = '["Engage external regulatory counsel (branded-import scope)","Commission a BPOM classification opinion for branded semaglutide/tirzepatide","Confirm import + distribution licence requirements","Confirm telehealth prescribing rules for GLP-1","Document the approved compliant pathway in writing"]'::jsonb,
  done_when = 'Branded-import regulatory pathway confirmed in writing — BPOM classification, import/distribution licence route, and telehealth Rx rules. The root gate; everything GLP-1 waits on this.',
  updated_at = now()
where id = 'G6';

update initiatives set
  how_it_works = 'Cold-chain fulfilment plus a LICENSED IMPORTER/DISTRIBUTOR line for branded GLP-1 — zero direct revenue, but a hard precondition for the program. The importer/distributor sign-off depends on the G6 import-licence route; cold-chain shortlisting can start in parallel.',
  steps = '["Shortlist cold-chain 3PLs (2–8°C, validated last-mile)","Identify + qualify a licensed importer/distributor for branded semaglutide","Sign the importer/distributor partner (needs the G6 licence route)","Validate temperature integrity end-to-end","Contract capacity for the pilot cohort"]'::jsonb,
  done_when = 'Compliant cold-chain + a licensed importer/distributor contracted for pilot volume (branded import).',
  updated_at = now()
where id = 'G5';

-- ---- Next actions on the cards that can start now (budget approved upfront) -------
update initiatives set
  next_action = 'Engage external regulatory counsel; commission the BPOM classification opinion (branded semaglutide import + telehealth Rx).',
  next_due = '2026-07-23', updated_at = now()
where id = 'G6';
update initiatives set
  next_action = 'Shortlist cold-chain 3PLs and licensed importer/distributor candidates (parallel now; sign after the G6 licence route).',
  next_due = '2026-08-31', updated_at = now()
where id = 'G5';
update initiatives set
  next_action = 'Draft the clinical eligibility protocol (BMI + contraindications) with the medical team.',
  next_due = '2026-09-30', updated_at = now()
where id = 'F6';
update initiatives set
  next_action = 'Blocked on G6 (regulatory) → G5 / F6. Hold program build until the gate clears.',
  updated_at = now()
where id = 'F4';

-- ---- Dated milestones: the critical path (branded import), from 2026-07-09 --------
-- Sequence: G6 → (G5 ∥ F6) → F4 → (F5 ∥ B5).  New inserts guarded by NOT EXISTS so
-- the migration is safe to re-run; existing (undated) milestones get dates + sort.

-- G6 · regulatory (near-term focus)
update milestones set due_date = '2026-08-29', sort = 1
  where initiative_id = 'G6' and title = 'BPOM classification opinion obtained';
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G6','External regulatory counsel engaged (branded-import scope)','2026-07-23',false,0
  where not exists (select 1 from milestones where initiative_id='G6' and title='External regulatory counsel engaged (branded-import scope)');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G6','Import + distribution licence pathway mapped','2026-09-15',false,2
  where not exists (select 1 from milestones where initiative_id='G6' and title='Import + distribution licence pathway mapped');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G6','Telehealth prescribing rules confirmed in writing','2026-09-30',false,3
  where not exists (select 1 from milestones where initiative_id='G6' and title='Telehealth prescribing rules confirmed in writing');

-- G5 · cold-chain & licensed sourcing
update milestones set due_date = '2026-08-31', sort = 0
  where initiative_id = 'G5' and title = 'Cold-chain 3PL shortlisted';
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G5','Licensed importer/distributor partner signed','2026-10-31',false,1
  where not exists (select 1 from milestones where initiative_id='G5' and title='Licensed importer/distributor partner signed');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G5','Cold-chain SOP + first shipment temperature-validated','2026-11-30',false,2
  where not exists (select 1 from milestones where initiative_id='G5' and title='Cold-chain SOP + first shipment temperature-validated');

-- F6 · eligibility & safety screening
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F6','Clinical eligibility protocol drafted (BMI + contraindications)','2026-09-30',false,0
  where not exists (select 1 from milestones where initiative_id='F6' and title='Clinical eligibility protocol drafted (BMI + contraindications)');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F6','Screening quiz live in the telehealth funnel','2026-10-31',false,1
  where not exists (select 1 from milestones where initiative_id='F6' and title='Screening quiz live in the telehealth funnel');

-- F4 · program launch (date the existing skeleton)
update milestones set due_date = '2026-09-30', sort = 0 where initiative_id='F4' and title='Regulatory pathway confirmed (G6)';
update milestones set due_date = '2026-10-31', sort = 1 where initiative_id='F4' and title='Cold-chain supplier signed (G5)';
update milestones set due_date = '2026-10-15', sort = 2 where initiative_id='F4' and title='Clinical protocol + consult flow drafted';
update milestones set due_date = '2026-11-30', sort = 3 where initiative_id='F4' and title='Pilot cohort (25 patients) live';
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F4','Scale to 300 active patients','2027-02-28',false,4
  where not exists (select 1 from milestones where initiative_id='F4' and title='Scale to 300 active patients');

-- F5 · subscription & titration adherence
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F5','Titration-aware subscription pricing set (with G3)','2026-11-30',false,0
  where not exists (select 1 from milestones where initiative_id='F5' and title='Titration-aware subscription pricing set (with G3)');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'F5','Subscription live for the pilot cohort','2026-12-31',false,1
  where not exists (select 1 from milestones where initiative_id='F5' and title='Subscription live for the pilot cohort');

-- B5 · companion & side-effect bundle
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'B5','Companion kit SKUs defined with the clinical team','2026-11-30',false,0
  where not exists (select 1 from milestones where initiative_id='B5' and title='Companion kit SKUs defined with the clinical team');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'B5','Bundle attach live in the GLP-1 order flow','2027-01-15',false,1
  where not exists (select 1 from milestones where initiative_id='B5' and title='Bundle attach live in the GLP-1 order flow');

-- ---- Change-log: keep governance intact for the data edits ------------------------
insert into change_log (entity,entity_id,field,old_val,new_val,who) values
 ('initiative','G6','owner','(unassigned)','berthin','migration 0010'),
 ('initiative','G5','owner','(unassigned)','berthin','migration 0010'),
 ('initiative','F6','owner','(unassigned)','andrew','migration 0010'),
 ('initiative','F4','owner','(unassigned)','andrew','migration 0010'),
 ('initiative','B5','owner','(unassigned)','andrew','migration 0010'),
 ('initiative','F5','owner','(unassigned)','jimmy','migration 0010'),
 ('initiative','G6','state','Idea','Execute','migration 0010'),
 ('initiative','G6','sourcing','(undecided)','branded import','migration 0010'),
 ('initiative','G6','milestones',null,'critical path dated: G6 → (G5 ∥ F6) → F4 → (F5 ∥ B5)','migration 0010');
