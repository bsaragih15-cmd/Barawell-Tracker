-- ============================================================
-- 0008 — Deeper initiative detail
-- ============================================================
-- #1 Playbook detail lives in the model, not just the exported HTML:
--    how_it_works, steps[], done_when — shown (and editable) in the drawer.
-- #2 Dependencies as real data: depends_on[] (initiative IDs). The view
--    derives blocked_by[] (prerequisites not yet Done) so the app can flag
--    blocked cards and compute "reachable now" value. Logic stays in SQL.
-- #5 KPI depth: kpi_baseline (starting point) + kpi_leading (leading vs
--    lagging), so progress reads as a true % and reviews watch the input.
-- Additive columns + view recreate (new cols flow through i.*). No math change
-- to existing scores. Seed of the authored detail follows in 0008b.
-- ============================================================

alter table initiatives
  add column if not exists how_it_works text,
  add column if not exists steps        jsonb,        -- array of step strings
  add column if not exists done_when    text,
  add column if not exists depends_on   text[],       -- prerequisite initiative ids
  add column if not exists kpi_baseline numeric,
  add column if not exists kpi_leading  boolean;

drop view if exists v_coverage;
drop view if exists v_initiatives_scored;

create view v_initiatives_scored as
with c as (select * from config where id = 1),
base as (
  select i.*, s.code stage_code, s.name stage_name, s.confidence stage_conf,
         p.name as owner_name, coalesce(p.is_lead, false) as owner_is_lead,
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
  left join pics p on p.id = i.owner_id
  cross join c
),
s1 as (select base.*, (base_rp * uplift * coverage) as incr_rev from base),
s2 as (
  select s1.*,
         incr_rev * margin      as incr_gp,
         incr_rev * stage_conf  as ra_rev,
         (case when incr_rev >= 25000000 then 5
               when incr_rev >= 15000000 then 4
               when incr_rev >=  8000000 then 3
               when incr_rev >=  3000000 then 2 else 1 end) as impact
  from s1
),
scored as (
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
         (select count(*) from milestones m where m.initiative_id = s2.id and m.done) as ms_done,
         (case
            when exists (
              select 1 from milestones m
              where m.initiative_id = s2.id and not m.done
                and m.due_date is not null and m.due_date < current_date
            ) then 'Red'
            when (select count(*) from milestones m where m.initiative_id = s2.id) = 0 then null
            when (select count(*) from milestones m where m.initiative_id = s2.id and m.done)::numeric
                 / nullif((select count(*) from milestones m where m.initiative_id = s2.id), 0) < 0.5
                 and s2.stage >= 4 then 'Amber'
            else 'Green' end) as rag_auto,
         -- #2 prerequisites not yet Done (or killed) → this initiative is blocked
         (select array_agg(d.id order by d.id)
            from initiatives d
            where s2.depends_on is not null
              and d.id = any(s2.depends_on)
              and (d.stage < 5 or d.status <> 'Active')) as blocked_by
  from s2
)
select scored.*,
       (case when rag_override then rag else rag_auto end) as rag_effective
from scored;

create view v_coverage as
with c as (select * from config where id = 1),
agg as (
  select coalesce(sum(case when stage >= 4 then ra_rev end),0) as committed,
         coalesce(sum(case when stage  = 3 then ra_rev end),0) as planned,
         coalesce(sum(case when stage <= 2 then ra_rev end),0) as pipeline,
         -- reachable now: risk-adj value of active, pending, unblocked revenue levers
         coalesce(sum(case when stage < 5 and blocked_by is null then ra_rev end),0) as unblocked,
         coalesce(sum(case when stage < 5 and blocked_by is not null then ra_rev end),0) as blocked
  from v_initiatives_scored
  where status = 'Active'
)
select c.current_rev, c.target,
       (c.target - c.current_rev) as gap,
       a.committed, a.planned, a.pipeline, a.unblocked, a.blocked,
       (a.committed + a.planned + a.pipeline) as total_ra,
       (c.current_rev + a.committed + a.planned + a.pipeline) as projected,
       round((a.committed + a.planned + a.pipeline) / nullif(c.target - c.current_rev,0) * 100) as coverage_pct,
       round(a.committed / nullif(c.target - c.current_rev,0) * 100) as committed_pct
from agg a cross join c;

-- ---------- seed: authored playbook detail + dependency graph + KPI baselines ----------
update initiatives set how_it_works='A checkout toggle plus a WA flow that puts refills on an automatic cadence — card-on-file or a scheduled reorder link charges the customer each cycle.', steps='["Pick 2–3 hero SKUs with predictable refill cycles","Set cadence + subscriber discount off true margin (G3)","Build the checkout sign-up toggle and a WA opt-in for existing buyers","Automate the recurring charge / reorder link with skip & pause","Seed with the current repeat base, then measure refill frequency"]'::jsonb, done_when='At least one hero SKU selling on a live recurring cadence with charges auto-processing.', depends_on=array['G2','G3']::text[] where id='A1';
update initiatives set how_it_works='Segmented WA/email journeys triggered by customer state — welcome, reorder-due, win-back, cross-sell — replacing one-size-fits-all blasts.', steps='["Define segments in Closari (new · active · due · lapsed)","Map one journey per segment with copy and timing","Build the reorder-due flow first — highest ROI","Wire triggers to order/CRM events","A/B against the current blast; scale winners"]'::jsonb, done_when='Reorder-due flow live and converting above the blast baseline.', depends_on=array['G2']::text[], kpi_baseline=10, kpi_leading=true where id='A2';
update initiatives set how_it_works='A single well-timed nudge that fires when a customer''s supply is about to run out, prompting reorder before they lapse.', steps='["Estimate days-of-supply per SKU","Schedule a WA nudge at supply-end minus a buffer","Include a one-tap reorder link","Suppress if the customer already reordered"]'::jsonb, done_when='Automated supply-end reminder firing with a reorder link.', depends_on=array['G2']::text[] where id='A3';
update initiatives set how_it_works='A one-off reactivation offer to customers who have gone quiet — you already own the list, so the cost is near zero.', steps='["Define ''lapsed'' (e.g. 2× cycle with no order)","Draft an incentive that stays within margin","Send a bounded win-back campaign","Track reactivation rate; don''t discount active buyers"]'::jsonb, done_when='Lapsed cohort campaigned with a measured reactivation rate.', depends_on=array['G2']::text[] where id='A4';
update initiatives set how_it_works='Tiered rewards that deepen your best repeat buyers'' frequency and retention — built only after the core retention flows exist.', steps='["Define tiers off repeat value","Set reward economics against true margin (G3)","Launch to top-decile buyers first","Measure incremental frequency vs a control"]'::jsonb, done_when='Top tier live with measured lift over non-members (low priority — after A1–A4).', depends_on=array['A1','A2','G3']::text[] where id='A5';
update initiatives set how_it_works='A model that scores repeat customers for churn risk off unified data and routes high-value at-risk buyers to a proactive save-offer.', steps='["Consolidate behavioural signals in Closari (G2)","Define a simple risk score (recency / frequency)","Write a save-offer playbook for high-value at-risk","Route flagged customers to a save-desk","Measure saved revenue vs a hold-out"]'::jsonb, done_when='At-risk high-value buyers auto-flagged and receiving save-offers.', depends_on=array['G2']::text[] where id='A6';
update initiatives set how_it_works='Complementary SKUs sold as a kit at a bundle price, lifting AOV — priced off the true per-SKU margin.', steps='["Get per-SKU margin from G3","Design 2–3 kits that solve a real use-case","Price to lift AOV without eroding margin","List across DTC + marketplace","Track attach rate and AOV lift"]'::jsonb, done_when='At least two bundles live with a measured AOV lift.', depends_on=array['G3']::text[] where id='B1';
update initiatives set how_it_works='A discount for buying 2–3 months of supply at once — lifts today''s order value and pre-commits the next refills.', steps='["Set quantity-break prices off true margin","Add 2- and 3-month options on hero SKUs","Message the per-unit saving","Track AOV and downstream refill retention"]'::jsonb, done_when='Multi-month option live on hero SKUs.', depends_on=array['G3']::text[] where id='B2';
update initiatives set how_it_works='A one-tap add-on presented right after checkout or in WA, capturing extra margin at near-zero friction.', steps='["Pick high-margin add-ons","Insert a post-purchase one-tap offer","Test placement (confirmation page vs WA)","Track attach rate"]'::jsonb, done_when='Post-purchase upsell live with tracked attach.', depends_on=array['G3']::text[] where id='B3';
update initiatives set how_it_works='A basket value above which shipping is free, nudging customers to add items to qualify.', steps='["Compute a threshold that lifts AOV net of ship cost (G3)","Set it and message ''add X for free shipping''","Show progress in cart / WA","Monitor AOV and margin"]'::jsonb, done_when='Threshold live and messaged in the cart.', depends_on=array['G3']::text[] where id='B4';
update initiatives set how_it_works='Anti-nausea, electrolytes and vitamins bundled with every GLP-1 order — manages side-effects (aiding adherence) and lifts basket.', steps='["Define the companion kit with the clinical team","Attach as an optional add-on in the GLP-1 flow (F4)","Price for margin","Track attach and its effect on adherence"]'::jsonb, done_when='Companion kit attachable inside the GLP-1 order flow.', depends_on=array['F4']::text[], kpi_baseline=0, kpi_leading=true where id='B5';
update initiatives set how_it_works='An on-site questionnaire that routes visitors to a recommendation and checkout — the signature Hims/Ro mechanic; also captures first-party data.', steps='["Map the assessment → recommendation logic","Build the quiz UI on-site","Connect outcomes to product + checkout","Capture responses as first-party data","Optimise completion → purchase"]'::jsonb, done_when='Quiz live routing to checkout with data captured (heavy build — sequence behind quick wins).', depends_on=null where id='C1';
update initiatives set how_it_works='Packages the doctor review into a paid async consult, turning the cost of a doctor into a trust-building conversion asset.', steps='["Design the async consult flow + SLA","Set a price that covers doctor cost","Integrate into the purchase path for Rx items","Measure trust → conversion"]'::jsonb, done_when='Paid async consult live in the Rx purchase path.', depends_on=null where id='C2';
update initiatives set how_it_works='Catalogue, one-tap reorder, saved cart and faster replies on WhatsApp — removing friction on the highest-intent SEA channel.', steps='["Set up a WA catalogue + quick replies","Enable saved cart / one-tap reorder","Cut response time with templates + routing","Track WA conversion"]'::jsonb, done_when='WA catalogue + one-tap reorder live.', depends_on=array['G2']::text[] where id='C3';
update initiatives set how_it_works='Automated follow-up to people who didn''t complete — recovering orders that were already ~80% done.', steps='["Detect non-completers (needs tracking, G1)","Trigger a WA/email recovery sequence","Include a resume-checkout link","Measure recovered orders"]'::jsonb, done_when='Recovery sequence live with tracked recovered orders.', depends_on=array['G1']::text[] where id='C4';
update initiatives set how_it_works='Reviews, ratings and a discreet-shipping promise on listings — countering the ''barang las'' review problem and lifting conversion.', steps='["Solicit reviews from happy buyers","Add a discreet-packaging promise to listings","Surface ratings / UGC on product pages","Track conversion lift"]'::jsonb, done_when='Reviews + discreet promise live on key listings.', depends_on=null where id='C5';
update initiatives set how_it_works='Adds QRIS, e-wallets (GoPay/OVO/Dana) and COD to cut checkout drop-off for Indonesian buyers — table-stakes for local DTC.', steps='["Integrate QRIS + major e-wallets","Add COD where economics allow","Surface all methods at checkout","Measure checkout completion by method"]'::jsonb, done_when='QRIS + e-wallets + COD live at checkout.', depends_on=null, kpi_baseline=55, kpi_leading=true where id='C6';
update initiatives set how_it_works='Enter TikTok Shop and recruit KOLs/affiliates — a major Indonesia channel gap; high-growth but content/compliance-sensitive for a regulated product.', steps='["Open and verify the TikTok Shop","Build a compliant content / claims playbook","Recruit and brief KOL / affiliate partners","Ramp with QC capacity (G4) in mind","Track blended CAC and content compliance"]'::jsonb, done_when='Shop live with first affiliate-driven orders and a compliance playbook.', depends_on=array['G1']::text[] where id='D1';
update initiatives set how_it_works='Meta/Google spend run with strict LTV:CAC discipline — deliberately gated until attribution exists, or the CAC math is blind.', steps='["Stand up attribution first (G1)","Set LTV:CAC guardrails","Launch small; measure true CAC","Scale only winners inside the guardrails"]'::jsonb, done_when='Attribution live; first campaigns inside CAC guardrails. Do not scale spend before G1.', depends_on=array['G1']::text[] where id='D2';
update initiatives set how_it_works='A destigmatising, search-optimised content library — slow to compound but Hims''s biggest long-run moat.', steps='["Keyword-map the category + symptoms","Publish cornerstone + supporting content","Build internal links + technical SEO","Track organic traffic → conversion over months"]'::jsonb, done_when='Cornerstone content live and ranking (long horizon).', depends_on=null where id='D3';
update initiatives set how_it_works='A give/get incentive that turns satisfied customers into low-cost acquisition — powerful in a high-trust category.', steps='["Design give/get economics within margin","Build referral links + tracking (G1)","Prompt referrals post-purchase / in WA","Measure referred-customer CAC"]'::jsonb, done_when='Referral live with tracked referred orders.', depends_on=array['G1']::text[] where id='D4';
update initiatives set how_it_works='Optimises the Shopee/Tokopedia ad spend you already run — improving conversion on traffic that''s already shopping.', steps='["Audit current keyword / product-ad performance","Cut wasted spend, raise bids on winners","Fix listing conversion (title / image / price)","Track ROAS by SKU"]'::jsonb, done_when='Ad spend rebalanced with improved ROAS.', depends_on=null where id='D5';
update initiatives set how_it_works='Diagnose why stores get flagged/blocked, fix the root cause and diversify store risk — uplift is the share of the ~Rp60M/mo lost pool you recover.', steps='["Root-cause the block pattern across affected stores","Fix the triggering behaviour + appeal","Diversify across stores/accounts to cap risk","Stand up monitoring for new flags","Track recovered revenue vs the lost pool"]'::jsonb, done_when='Root cause fixed and a measurable share of lost shelf recovered (urgent — milestone overdue).', depends_on=null where id='E1';
update initiatives set how_it_works='Diagnose why only 1-in-5 stores actually sells, then replicate the winning setup across the dormant shelf you already own.', steps='["Compare converting vs dormant store setups","Isolate the productivity drivers","Replicate across dormant stores","Track store-level productivity"]'::jsonb, done_when='Winning setup replicated to dormant stores with lift.', depends_on=null where id='E2';
update initiatives set how_it_works='Migrate volume, margin and customer data off marketplaces onto your own web/WA — the long-run LTV and margin play.', steps='["Stand up own-channel checkout + payments (C6)","Add attribution + data capture (G1 / G2)","Incentivise marketplace buyers to reorder direct","Track margin + data captured direct"]'::jsonb, done_when='First cohort reordering direct at higher margin (slow, hard — long horizon).', depends_on=array['G1','G2','C6']::text[] where id='E3';
update initiatives set how_it_works='Solicit reviews, respond to negatives and actively manage ratings to lift marketplace conversion and repair the ''barang las'' reputation.', steps='["Automate review requests to happy buyers","Set an SLA for responding to negatives","Monitor ratings across stores","Track conversion vs rating"]'::jsonb, done_when='Review solicitation + response SLA live.', depends_on=null where id='E4';
update initiatives set how_it_works='Fixes the SKU-mapping error that zeroed stock across 55 stores — protective, because a second stock-out during recovery would be severe.', steps='["Audit the SKU map across all stores (done)","Re-map and validate stock sync (done)","Run a go-live guardrail check","Add monitoring to prevent recurrence"]'::jsonb, done_when='Stock sync validated and the guardrail check passed.', depends_on=null where id='E5';
update initiatives set how_it_works='Launch a new anxiety/sleep category (pending doctor approval) and cross-sell it to the existing base — Hims''s move beyond its first category.', steps='["Secure clinical / doctor approval","Source and list the SKUs","Cross-sell to the existing base","Track new-category demand + attach"]'::jsonb, done_when='New SKUs live with first cross-sell orders.', depends_on=array['G3']::text[] where id='F1';
update initiatives set how_it_works='Promote the differentiated, higher-margin Baralas/racikan now it''s re-listed — shifting the mix toward better economics.', steps='["Confirm Baralas margin (G3)","Feature it in flows + listings","Position vs commodity alternatives","Track mix shift + blended margin"]'::jsonb, done_when='Baralas featured with a measurable mix shift.', depends_on=array['G3']::text[] where id='F2';
update initiatives set how_it_works='Enter hair-loss/skincare — Hims''s proven second category with a large pool, but a heavy build and longer horizon.', steps='["Validate demand + clinical pathway","Source products + build the funnel","Launch with cross-sell to base","Track new-category revenue"]'::jsonb, done_when='Category live with first orders (long horizon, heavy build).', depends_on=array['G3']::text[] where id='F3';
update initiatives set how_it_works='A medically-supervised GLP-1 program — async consult, titration protocol and monthly supply. The category that made Hims/Ro growth stories, and Indonesia''s largest untapped men''s-health pool.', steps='["Confirm the regulatory pathway (G6) — the gate","Sign a compliant cold-chain supplier (G5)","Draft the clinical protocol + consult flow","Stand up eligibility screening (F6)","Launch a 25-patient pilot cohort, then scale"]'::jsonb, done_when='A pilot cohort of GLP-1 patients live on protocol. Gated by G5 + G6 — do not launch before both clear.', depends_on=array['G6','G5','F6']::text[], kpi_baseline=0, kpi_leading=false where id='F4';
update initiatives set how_it_works='A dose-escalation-aware subscription that keeps GLP-1 patients on-protocol month over month — adherence is the entire economics of GLP-1.', steps='["Model the titration schedule into refill cadence","Automate dose-aware monthly supply + charge","Build adherence nudges + check-ins","Track month-3 retention"]'::jsonb, done_when='GLP-1 patients on an automated, titration-aware subscription.', depends_on=array['F4','G3']::text[], kpi_baseline=0, kpi_leading=false where id='F5';
update initiatives set how_it_works='A BMI + contraindication screening quiz that qualifies GLP-1 candidates, routes them to consult and captures first-party clinical data — protecting safety and lifting qualified conversion.', steps='["Build eligibility logic with the clinical team (G6)","Screen BMI + contraindications","Route qualified leads to consult; reject unsafe","Capture clinical data first-party"]'::jsonb, done_when='Screening live, gating entry to the GLP-1 program.', depends_on=array['G6']::text[] where id='F6';
update initiatives set how_it_works='Pixel, domain link and WA conversion tracking — zero direct revenue, but the precondition that unlocks all paid acquisition.', steps='["Install pixel + domain link","Fire WA conversion events","Validate end-to-end tracking","Confirm CAC / ROAS is measurable"]'::jsonb, done_when='Conversions tracked end-to-end, WA events firing. Unlocks D1 · D2 · D4 · C4.', depends_on=null where id='G1';
update initiatives set how_it_works='Unify CRM + sales + broadcast in Closari — the precondition for every lifecycle-marketing lever.', steps='["Connect sales + CRM + broadcast sources","Resolve customer identity across them","Expose clean segments","Validate against known cohorts"]'::jsonb, done_when='Unified customer data + segments available. Unlocks A1–A6 · C3.', depends_on=null where id='G2';
update initiatives set how_it_works='True margin per product (doctor, packaging, fulfilment) — the precondition for pricing bundles, subscriptions and the mix shift.', steps='["Define the cost taxonomy (done)","Compute per-SKU margin","Wire it into a pricing view","Keep it updated as costs move"]'::jsonb, done_when='Per-SKU true margin available to price against. Unlocks B1–B4 · A1 · F1–F2.', depends_on=null where id='G3';
update initiatives set how_it_works='A QC/packing SOP that eliminates packing errors — protective, because subscription and higher volume raise repeat brand exposure.', steps='["Draft the packing checklist (done)","Make QC sign-off a required step (done)","Train packers + audit compliance","Monitor error rate"]'::jsonb, done_when='QC sign-off enforced with a falling error rate.', depends_on=null where id='G4';
update initiatives set how_it_works='Cold-chain fulfilment and a licensed sourcing line for GLP-1 — zero direct revenue, but a hard precondition for the program.', steps='["Shortlist cold-chain 3PLs","Secure a licensed sourcing line (needs G6)","Validate temperature integrity end-to-end","Contract capacity for the pilot"]'::jsonb, done_when='Compliant cold-chain + sourcing contracted for pilot volume.', depends_on=array['G6']::text[] where id='G5';
update initiatives set how_it_works='Clears the BPOM / prescribing pathway for GLP-1 sold via telehealth — zero direct revenue, and the single legal gate on the entire GLP-1 bet.', steps='["Obtain a BPOM classification opinion","Confirm telehealth prescribing rules","Define the compliant patient journey","Document the approved pathway"]'::jsonb, done_when='Regulatory pathway confirmed in writing. The root gate — everything GLP-1 waits on this.', depends_on=null where id='G6';
