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

**D12 · Register CRUD from the UI; kill via a `status` column, never delete.**
The register is meant to grow, so add/edit initiatives ship as a founder-facing modal (`0004`). The form writes only input columns — every score still computes in `v_initiatives_scored` (rule 1). IDs are auto-assigned as the next free number in the chosen bucket (rule 3, stable IDs). Removal is a `status='Killed'` flag, not a `delete`: the ID survives, the row stays in the scored view (so it can be listed/restored), and it drops out of `v_coverage`. This honours "kill via status" and lays the groundwork for the deferred attrition/leakage rollup (P2).
*Reopens if:* leakage tracking needs a richer lifecycle (`Descoped`, kill reason, gate-at-death) — extend the `status` enum + a leakage view.

**D13 · Owners (PICs) as a lookup table, not free text.**
`initiatives.owner` (free text) stays for legacy, but accountability now runs through a `pics` table + `owner_id` FK, joined into the scored view as `owner_name`/`owner_is_lead`. A lookup keeps names consistent, powers avatars, and sets up "my initiatives" filtering and (eventually) per-owner RLS once Auth lands (D3).
*Reopens if:* owners need roles/capacity or map to real auth users — join `pics` to Supabase Auth users.

**D14 · 3-lane Execution board is a projection of the stage-gates, not a second state.**
Idea = L1–L2, Execute = L3–L4, Done = L5. Dragging a card between lanes writes the lane's canonical stage (Idea→L2, Execute→L4, Done→L5) via the same `stage` column — so the coverage bridge, confidence weighting, and the 5-column Pipeline always agree with the board. Deliberately no separate "workflow status" field: two lifecycles would drift.
*Reopens if:* the team needs execution states orthogonal to value confidence (e.g. "blocked") — add a field then, don't overload `stage`.

**D15 · Single-view cockpit: the Execution board is the app.**
Pipeline/Register/Prioritize/Trajectory tabs removed at the owner's call — the operating surface is the 3-lane board plus the coverage hero. Filters (needs-attention, per-owner) replace separate views. The removed views' data still exists (the SQL views are unchanged); re-adding a tab is a UI-only change.
*Reopens if:* prioritization sessions need the ICE/quadrant matrix back — restore the Prioritize tab from git history.

**D16 · Adherence layer: stale detection, needs-attention filter, weekly snapshots.**
Adherence = the tool pushing the team, not just measuring. Three mechanisms: (1) a card is **stale** after 14 days without update (`updated_at`, display-layer only — not business math); (2) **Needs attention** = Red/Amber, overdue milestone, or stale, one click; (3) `coverage_snapshots` stores one `v_coverage` row per ISO week (idempotent upsert on page load, `capture_coverage_snapshot()`), and the hero shows Δ coverage vs last week — the number that creates pressure when it doesn't move. Milestones are now CRUD-able from the drawer so auto-RAG has signal on every in-flight initiative.
*Reopens if:* a scheduler (n8n/pg_cron) replaces capture-on-load, or the stale threshold needs to be config.

**D17 · UI speaks only Idea / Execute / Done; L1–L5 stays in SQL as the confidence engine.**
Owner's call (partially reopens D4's *surface*, not its math): gate codes, the L1–L5 rail, and Advance/Regress are gone from the UI. The three states map to canonical stages (Idea→L2 50%, Execute→L4 90%, Done→L5 100%); `stateOf(stage)` collapses any legacy stage for display, and existing L1/L3 rows keep their stage (and confidence) until touched. The stages table and per-stage weighting are unchanged — coverage still hardens value by confidence; the UI just stops asking the team to think in five gates.
*Reopens if:* the simplified states make committed value too coarse (e.g. everything piles into 90% too easily) — then reintroduce an evidence checklist on the Idea→Execute transition rather than the five gates.

**D18 · Full-list tab alongside the board.**
The board is the operating surface; an exhaustive sortable list (ID, owner, state, RAG, gross, risk-adj, ICE, last-updated) exists as a second tab for register reviews. Same filter chips apply to both.

**D19 · The initiative card carries the operating conversation; change_log records every mutation.**
Card fields added (`0006`): `note` (status), `next_action`/`next_due` (the single next step), `kpi_label`/`kpi_target`/`kpi_actual`/`kpi_unit` (the metric the initiative moves), `state_since` (age-in-state, reset only on state change — distinct from `updated_at`). These are inputs, not scored — the SQL engine ignores them (rule 1). The mini-card surfaces note + next + progress + age; the drawer edits them inline (blur-to-save via `saveCardMeta`). `change_log` appends on every action (state/RAG/owner/status/milestone/config/meta/create/edit); the drawer shows the last 12 per initiative. `who` stays null until Auth (D3). "Done" still means state=Done; the KPI target/actual is the honesty check that the metric actually moved.
*Reopens if:* the log needs attribution (needs Auth) or a full-history audit view beyond the per-card feed.

**D20 · Playbook detail + dependencies + KPI baseline live in the model, not the export.**
`0008` adds `how_it_works`, `steps[]`, `done_when` (the execution playbook, editable in the drawer/form — the exported HTML is now a snapshot, the app is the source of truth); `depends_on[]` (prerequisite IDs) from which the view derives `blocked_by[]` — prerequisites not yet Done; and `kpi_baseline` + `kpi_leading` so progress reads as (actual−baseline)/(target−baseline) and reviews can watch leading inputs. `v_coverage` gains `unblocked`/`blocked` (reachable-now vs stuck-behind-enablers) — the honest read that ~74% of pipeline value is gated. Dependency/blocked logic stays in SQL (rule 1); the app only renders `blocked_by`.
*Reopens if:* dependencies need a "soft" (can-start-in-parallel) vs "hard" (must-be-Done) distinction, or a full critical-path/sequence view is built on top.

## GLP-1 program

**D21 · GLP-1 is demand-gated, not supply-gated — broad, female-led, standalone sub-brand, pilot-first.**
Founder session 2026-07-09. Supply is secured (branded Mounjaro/Ozempic via Pharmaxy) and already selling small-scale, so the handover's "regulatory/cold-chain is the root gate" framing is retired. The binding constraints are **demand** and **trust** for a cold, mostly-female audience buying an Rx injectable online. Positioning: broad weight-management, female-led, under a **standalone sub-brand** (a men's-ED brand can't credibly sell female weight-loss). Channels: TikTok organic + Shopee + own site — compliant content only, no drug-claim ads; attribution (G1) before any paid. Pilot-first: prove month-2/3 retention before scaling spend. Encoded in migrations `0010`–`0011` (new enablers G7 demand + G8 trust gate F4; G6 → parallel de-risk; G5 → last-mile). Full detail + open items in `docs/GLP1-STRATEGY.md`.
*Reopens if:* the pilot's retention/CAC economics don't hold, or the male-metabolic wedge (cheaper, warm-base) is reconsidered. The Rp 130M/Rp 50M pools stay HELD (D8) — 300 × Rp 1.5–2M implies ~4× the pool and branded COGS likely makes that price loss-leading — until the bottom-up economics are validated.
