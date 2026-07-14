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

## Growth OS

**D12 · Historical truth is stored as aggregate monthly, cohort, channel, product, segment, and movement marts.**
The source workbook is operational input, not the dashboard model. Complete months are used for period comparisons; the latest partial month remains visible but is explicitly flagged. Aggregate marts contain no phone numbers or customer-level PII.
*Reopens if:* an order-level warehouse with governed access replaces the workbook ingestion.

**D13 · Automatic insights are deterministic facts first, narrative second.**
SQL calculates period changes, target gaps, concentration, expected ranges, and drivers. The interface renders those evidence packages; an LLM may later summarize them but must not invent metric conclusions from raw rows.
*Reopens if:* never for the factual layer. Narrative generation can change without moving calculations out of SQL.

**D14 · CRM is a closed measurement loop, not a downloadable lead list.**
Eligibility → ranked action → assignment → activity → outcome → conversion → experiment readout lives in Supabase. Every sales play must eventually be judged on incremental gross profit, not attributed revenue alone.
*Reopens if:* the company adopts a CRM that becomes the authoritative execution and experiment ledger.

**D15 · Propensity scores are labelled `heuristic-v1` until outcomes calibrate them.**
Current reorder, churn, cross-sell, and response estimates are transparent deterministic heuristics. They prioritize work but are not claimed as machine-learning predictions. Logged outcomes and holdouts will support later calibration and uplift modelling.
*Reopens when:* there is enough clean treatment/outcome history to validate a trained model out of sample.

**D16 · Customer names are masked by default in the web application.**
The Growth OS is useful without exposing customer identity on a public deployment. Full names appear only when `BARAWELL_SHOW_CUSTOMER_NAMES=true` and the deployment is protected as an internal surface. Phone numbers are never returned by Growth OS views.
*Reopens when:* Supabase Auth and role-based customer access are live.
