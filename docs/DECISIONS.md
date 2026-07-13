# DECISIONS.md — settled calls

Decisions already made and their rationale. Don't relitigate these without a stated reason to reopen. Format: decision · why · what would reopen it.

## Platform & stack

**D1 · Custom Next.js + Supabase over Airtable/Notion/Monday.**
Off-the-shelf PM tools can't hold the driver-based scoring engine faithfully (no cross-table lookup, no `RANK()`, weak formula layer) and — more importantly — can't share one backend with the operational data (sales, ad performance) this is meant to eventually ingest. Airtable was costed (Free tier fits 3 editors; Team $720/yr for Gantt) and rejected for the shared-backend reason, not price.
*Reopens if:* the tool stays a static tracker and never ingests operational data — then Airtable Free is the cheaper answer.

**D2 · Scoring engine in SQL (`v_initiatives_scored`), not application code.**
Single source of truth, no drift between the sheet, the prototype, and prod. Postgres does `RANK`, `CASE`, cross-table joins natively — the exact things Airtable couldn't.
*Reopens if:* never. This is foundational.

**D3 · Service-role key, server-only, instead of Supabase Auth for v1.**
Internal 3-person tool. Auth is real work that doesn't move the value; the service-role key server-side is safe (never shipped to browser) and ships today. RLS policies are already written in the migration for the eventual switch.
*Reopens when:* the tool opens to non-founders, or is exposed on a public URL without an access layer in front.

## Model design

**D4 · Stage-gate lifecycle L1–L5 with confidence factors 30/50/70/90/100%.**
Adopted from KEY by BCG / McKinsey Wave. Value hardens as it passes gates; risk-adjusted value = gross × stage confidence. This is what separates "committed" from "hopeful" and stops the portfolio double-counting speculative upside.
*Reopens if:* the client wants different gate definitions — factors are data in the `stages` table, trivially editable.

**D5 · Coverage tracked in REVENUE terms, not margin/EBIT.**
The Barawell target (Rp 500M) is a revenue run-rate, so the hero bridge weights revenue. The view already computes `ra_gp` (risk-adjusted gross profit), so switching to a margin bridge is a one-line UI change if the target becomes a bottom-line number.
*Reopens if:* the target is redefined as profit/EBIT.

**D6 · Portfolio overlap haircut (25%) on summed impact.**
Several levers act on the same revenue pool (A1 and A2 both on repeat revenue), so naive summation overstates. The haircut is a config input. Applied to the "In-Plan selected" rollup, not to the stage-based coverage (which uses distinct risk-weighting).
*Reopens if:* a cleaner overlap model is built (e.g., explicit shared-pool constraints).

**D7 · Impact score thresholds 3M/8M/15M/25M → 1–5.**
Calibrated to the actual per-initiative Rp range so the quadrant matrix produces a usable spread (not everything "low"). If revenue scales 10×, rescale these.
*Reopens if:* the initiative value distribution shifts materially.

**D8 · Assumptions are placeholders pending real data.**
repeat_share 45%, AOV Rp 400k, margin 55%, Tokopedia loss Rp 60M are hypotheses. The model sharpens the moment real repeat-rate / AOV / channel-mix / CAC data replaces them. Flagged, not hidden.

## Design

**D9 · Ledger/instrument aesthetic, mono tabular numerals, single ledger-green accent.**
Deliberately not the generic SaaS-gradient or the AI-default cream-serif-terracotta look. The subject is a financial model; it should read like one. Hero = coverage bridge; signature interaction = advancing a gate.
*Reopens if:* the client has a brand system to conform to.

## Scope sequencing

**D10 · Tracking layer (milestones, RAG, trajectory) shipped in v1; phasing/attrition/auto-RAG deferred.**
Milestones + manual RAG + a frontend-derived trajectory ramp are enough to run reviews. Stored phasing, milestone-driven auto-RAG, and inter-gate attrition are the next layer — real once initiatives are actually in-flight, premature before.
*Update 2026-07-07:* milestone-driven auto-RAG now shipped (`0002_auto_rag.sql`) — computed in `v_initiatives_scored` (rule D2), with a `rag_override` flag so a hand-set RAG still wins. Stored phasing and attrition remain deferred.

**D11 · Config edited via a UI modal, not just raw SQL.**
The `updateConfig` action existed but had no surface; assumptions (D8) change often as real data lands, so a founder-facing "Assumptions" modal now writes `config` and lets the view re-price everything. No math moved to the client — the form only writes inputs.
*Reopens if:* config becomes multi-row/versioned (per-review snapshots), which would need a different editor.

## Customer segmentation (2026-07-13)

**D12 · Segmentation is the evidence layer under the retention/AOV initiatives, shipped as a "Segments" cockpit tab — not a standalone dashboard.**
The register already carries A1–A5 (retention), B1–B4 (AOV), F2 (Baralast), E-bucket (channel). Segmentation answers "how big is each of those pools, and who exactly do we act on." Housing it in the same cockpit keeps segments → initiatives one instrument. Source: the `histori-pesanan` order-history export (4,716 customers, Jan 2025–Jul 2026).
*Reopens if:* segmentation needs to serve consumers outside the value-capture story (e.g. a standalone ops CRM).

**D13 · Segmentation model = Value tier × Lifecycle, thresholds grounded in the data.**
Value: Whale ≥ Rp2M lifetime · Core ≥ Rp400k · Entry < Rp400k. Lifecycle (vs the measured ~46-day median 1st→2nd-order refill): Dormant >90d · At-risk 46–90d · Active-repeat ≤45d & ≥2 orders · New = 1 order ≤45d. Recency is anchored on the latest order in the dataset (deterministic), not wall-clock. The source sheet's `Baru/Repeat/Dormant` tag is inconsistent with order counts (tag "Repeat"=367 vs actual ≥2-orders=658) and is **not** trusted — segments are derived from raw recency/frequency.
*Reopens if:* the refill cadence shifts materially, or a value distribution change makes the tier cuts produce a poor spread.

**D14 · Segmentation lands as computed marts + a stable `v_*` view contract, not live views over a raw customer table.**
Rule D2 (compute once, frontend reads computed values) still holds — but the classification is computed in the ingestion step (`scripts/ingest_segments.py`, the ETL role the backlog's n8n feed will play) and landed as small marts (`seg_summary`, `seg_matrix`, `seg_funnel`, `seg_refill`, `seg_channel_stat`, `seg_product`, `seg_action_queue`). Two constraints forced marts over live views: (a) the source is a 4.7k-row out-of-band export and this session's egress policy blocks a direct DB pipe; (b) real phone numbers must stay off the anon-readable surface. The `v_segment_*` view names are the stable contract the UI reads — swap the marts for live computation when an order feed exists and the UI never changes.
*Reopens when:* a live orders table lands in Supabase — then redefine the `v_*` views over it and retire the marts.

**D15 · Customer PII is never committed to git; the action queues store name/city but not phone.**
`seg_*` tables hold real names — seeded by ingestion against the live project, never in a migration or seed file. The repo ships the engine (schema + views + the ingestion script), not the customer list. Action queues deliberately omit phone: the app runs on the public anon key (D3 fallback), so anything in these tables is world-readable — operators dial from the source register by name / cust_key. Queues are capped at the top ~80 per play (operators work the head of the list).
*Reopens when:* Supabase Auth replaces the anon fallback (D3) — then phone could live in an authenticated-only table.
