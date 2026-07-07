-- ============================================================
-- 0007 — Register growth: GLP-1 program cluster + adjacent levers
-- ============================================================
-- Adds new initiatives to the register (rule 3: stable IDs, next free number
-- per bucket). Inputs only — v_initiatives_scored prices them. Idempotent via
-- ON CONFLICT DO NOTHING so re-running is safe.
--
-- GLP-1 cluster (the strategic new category, à la Hims/Ro):
--   F4 program launch · F5 subscription/titration · F6 screening funnel
--   G5 cold-chain/sourcing (enabler) · G6 regulatory/Rx (enabler)
--   B5 companion side-effect bundle (AOV, rides the program)
-- Plus two general levers: C6 payments, A6 predictive churn.
-- All enter at Idea (stage 1) — honest: these are bets, not commitments.
-- ============================================================

insert into initiatives
  (id,bucket,name,description,driver,base_type,direct_rp,uplift,coverage,build_cost,monthly_cost,tti,conf,ease,stage,pl_line,recurring,owner,rag,in_plan,state_since,kpi_label,kpi_target,kpi_unit)
values
('F4','F · Assortment','GLP-1 weight-management program',
 'Launch a medically-supervised GLP-1 program (semaglutide/tirzepatide) — async consult, titration protocol, monthly supply. The category that turned Hims/Ro into growth stories and Indonesia''s largest untapped men''s-health pool. Gated by G5 (cold-chain) and G6 (regulatory).',
 'New category demand','DIRECT',45000000,1,1,40000000,15000000,'S',2,2,1,'Revenue',true,null,null,false,now(),'Active GLP-1 patients',300,'pax'),

('F5','F · Assortment','GLP-1 subscription & titration adherence',
 'Dose-escalation-aware subscription that keeps GLP-1 patients on-protocol month over month — the LTV engine for the category. Builds on F4; adherence is the whole economics of GLP-1.',
 'GLP-1 retention / LTV up','DIRECT',20000000,1,1,12000000,3000000,'M',3,3,1,'Revenue',true,null,null,false,now(),'Month-3 retention',60,'%'),

('F6','F · Assortment','GLP-1 eligibility & safety screening',
 'BMI + contraindication screening quiz that qualifies GLP-1 candidates, routes them to consult, and captures first-party clinical data. Protects safety and lifts qualified conversion.',
 'Qualified conversion up','DIRECT',12000000,1,1,8000000,1500000,'M',3,3,1,'Revenue',true,null,null,false,now(),null,null,null),

('G5','G · Enablers','GLP-1 cold-chain & licensed sourcing',
 'Stand up cold-chain fulfilment and a licensed sourcing line for GLP-1. Zero direct revenue but a hard precondition for F4/F5 — no supply, no program.',
 'UNLOCK: GLP-1 fulfilment','DIRECT',0,1,1,30000000,5000000,'M',3,2,1,'Enabler',false,null,null,false,now(),null,null,null),

('G6','G · Enablers','GLP-1 regulatory & telehealth-Rx pathway',
 'Clear the BPOM / prescribing pathway for GLP-1 sold via telehealth. Zero direct revenue; the legal gate on the entire GLP-1 bet.',
 'UNLOCK: legal GLP-1 sale','DIRECT',0,1,1,10000000,1000000,'S',2,2,1,'Enabler',false,null,null,false,now(),null,null,null),

('B5','B · AOV / basket','GLP-1 companion & side-effect support bundle',
 'Bundle anti-nausea, electrolytes and vitamins with every GLP-1 order to manage side-effects and lift basket. Rides the GLP-1 program; near-zero clinical risk.',
 'AOV up + adherence','TOTAL',0,0.05,0.3,3000000,500000,'Q',3,4,1,'Revenue',true,null,null,false,now(),'Attach rate',30,'%'),

('C6','C · Conversion','Checkout & payment-method expansion',
 'Add QRIS, e-wallets (GoPay/OVO/Dana) and COD to cut checkout drop-off on the highest-intent SEA buyers. Table-stakes for Indonesian DTC conversion.',
 'Checkout conversion up','DTC',0,0.15,0.7,5000000,500000,'Q',4,4,1,'Revenue',true,null,null,false,now(),'Checkout completion',70,'%'),

('A6','A · Retention & repeat','Predictive churn scoring & save-desk',
 'Score repeat customers for churn risk off Closari data and route at-risk high-value buyers to a proactive save-offer. Depends on G2 (data consolidation).',
 'Churn down','REPEAT',0,0.1,0.4,10000000,1000000,'M',3,3,1,'Revenue',true,null,null,false,now(),null,null,null)
on conflict (id) do nothing;

-- A delivery skeleton for the headline GLP-1 bet so its critical path is visible.
insert into milestones (initiative_id,title,done,sort) values
('F4','Regulatory pathway confirmed (G6)',false,0),
('F4','Cold-chain supplier signed (G5)',false,1),
('F4','Clinical protocol + consult flow drafted',false,2),
('F4','Pilot cohort (25 patients) live',false,3),
('G6','BPOM classification opinion obtained',false,0),
('G5','Cold-chain 3PL shortlisted',false,0)
on conflict do nothing;
