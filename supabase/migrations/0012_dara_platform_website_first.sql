-- ============================================================
-- 0012 — Dara: platform framing, brand, website-first sequencing
-- ============================================================
-- Founder session 2026-07-09 (cont.): the standalone sub-brand is named **Dara**
-- (Indonesian for "young woman") and reframed from a weight brand into a WOMEN'S-HEALTH
-- PLATFORM (the ForHers model). GLP-1 is the LAUNCH category; birth control / mental
-- health / skin follow later. Positioning confirmed AFFLUENT-PREMIUM (COGS Rp 2.7M at
-- 20–30% margin ⇒ price ~Rp 3.4–3.9M/mo — premium, not mass).
--
-- Sequencing decision: **website/trust FIRST, then TikTok** — you don't drive demand to a
-- site that can't convert an Rx purchase. So G7 (demand) now DEPENDS ON G8 (the Dara site +
-- trust layer): the demand engine can't scale until the credible site is live.
--   · G7 owner = Berthin (per founder; note: Berthin now holds regulatory + supply + demand).
--   · G8 reframed to "Dara website + trust & clinical credibility" and given dated milestones.
--   · F4 reframed as the Dara GLP-1 launch category. Design handoff: docs/DARA-WEBSITE-BRIEF.md.
-- No scoring-math change. Economics pools still HELD pending bottom-up validation (D8/D21).
-- ============================================================

-- ---- G7: owner + website-first dependency ----------------------------------------
update initiatives set
  owner_id = 'berthin',
  depends_on = array['G8']::text[],           -- demand scales only after the site converts
  how_it_works = 'The organic top-of-funnel for Dara — a TikTok handle publishing compliant education / lifestyle / results content, a Shopee storefront for discovery, and content that points to the Dara site. Sequenced AFTER G8: the credible site + trust layer must be live first, or the demand is burned. Paid stays off the drug itself; attribution (G1) before any Shopee spend.',
  next_action = 'Hold content ramp until the Dara site (G8) is live; prep the TikTok handle + first compliant content batch in the meantime.',
  updated_at = now()
where id = 'G7';

-- ---- G8: this IS the Dara website build + the trust layer -------------------------
update initiatives set
  name = 'Dara website + trust & clinical credibility',
  owner_id = 'andrew',   -- delivery lead builds the site (0011 set only the legacy text field)
  description = 'Build the credible Dara site + trust layer — the #1 gate before any demand spend. A woman buying a prescription injectable online from a new brand converts on trust: visible licensed-doctor consult, transparent titration + pricing, real (compliant) results, discreet-shipping promise, and the eligibility assessment as the funnel. Design handoff in docs/DARA-WEBSITE-BRIEF.md (modeled on Hers + Juniper). Zero direct revenue; it converts F4''s demand.',
  how_it_works = 'The Dara public site is the trust vehicle and the funnel: homepage → 2-minute private eligibility assessment → async licensed-doctor consult → discreet delivery + ongoing care. Everything that makes a cold, affluent female buyer trust a new brand with an Rx injectable lives here. Built separately from the internal tracker; Next.js + Vercel; mobile-first; Bahasa primary.',
  steps = '["Approve Dara brand identity + site design (see design brief)","Build the homepage + eligibility assessment + pricing (mobile-first)","Surface named licensed doctors + the async consult","Add compliant results/stories + a discreet-shipping promise","Wire attribution (G1) so the funnel is measurable end-to-end"]'::jsonb,
  done_when = 'The Dara site is live and converting — homepage, eligibility assessment, transparent pricing, visible doctors, discreet promise — ready to receive demand.',
  updated_at = now()
where id = 'G8';

-- ---- F4: name it the Dara GLP-1 launch category ----------------------------------
update initiatives set
  name = 'Dara — GLP-1 metabolic program (launch category)',
  description = 'The launch category of the Dara women''s-health platform: a medically-supervised GLP-1 metabolic / weight-management program (branded Mounjaro/Ozempic, supply secured via Pharmaxy). Affluent-premium, female-led, pilot-first. Gated by the Dara site + trust (G8), the demand engine (G7), and eligibility screening (F6) — not supply. GLP-1 proves the platform; birth control / mental health / skin follow.',
  updated_at = now()
where id = 'F4';

-- ---- Milestones: G8 (the website) is now near-term critical path ------------------
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G8','Dara brand identity + site design approved','2026-08-15',false,0
  where not exists (select 1 from milestones where initiative_id='G8' and title='Dara brand identity + site design approved');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G8','Dara site live — homepage + eligibility assessment + pricing','2026-09-15',false,1
  where not exists (select 1 from milestones where initiative_id='G8' and title='Dara site live — homepage + eligibility assessment + pricing');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G8','Trust layer complete — doctors + results + discreet promise','2026-09-30',false,2
  where not exists (select 1 from milestones where initiative_id='G8' and title='Trust layer complete — doctors + results + discreet promise');

insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G7','TikTok handle + first compliant content batch (after site live)','2026-09-30',false,0
  where not exists (select 1 from milestones where initiative_id='G7' and title='TikTok handle + first compliant content batch (after site live)');
insert into milestones (initiative_id,title,due_date,done,sort)
  select 'G7','Shopee storefront open','2026-10-15',false,1
  where not exists (select 1 from milestones where initiative_id='G7' and title='Shopee storefront open');

-- ---- Change-log --------------------------------------------------------------------
insert into change_log (entity,entity_id,field,old_val,new_val,who) values
 ('initiative','F4','brand','(standalone TBD)','Dara — GLP-1 launch category of a women''s-health platform','migration 0012'),
 ('initiative','G7','owner','(unassigned)','berthin','migration 0012'),
 ('initiative','G7','depends_on',null,'G8 (website-first)','migration 0012'),
 ('initiative','G8','scope','trust layer','Dara website build + trust layer','migration 0012');
