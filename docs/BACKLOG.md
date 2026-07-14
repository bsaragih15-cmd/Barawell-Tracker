# BACKLOG.md — prioritized work

Tasks for Claude Code, in priority order. Each: scope, acceptance criteria, and where to work. Pick top-down. Mark done by moving to the bottom section.

Priority key: **P0** = do first / unblocks others · **P1** = high value · **P2** = nice-to-have.
Effort: S (<2h) · M (half-day) · L (1–2 days).

---

## P0 — stand it up (do these before any feature work)

### [P0·S] Get it running against a real Supabase project
- Run `supabase/migrations/0001_init.sql` in a fresh project's SQL Editor.
- Verify `select * from v_coverage;` returns one row with `coverage_pct` in a sane range (~35–45% at seed) and `select count(*) from v_initiatives_scored;` = 31.
- Set `.env` from `.env.example`; `npm install && npm run dev`; confirm the cockpit renders and the coverage bridge is non-empty.
- **Done when:** local app loads with all 31 initiatives, gate-advance moves the bridge, milestone toggles persist.

### [P0·S] Deploy to Vercel
- `vercel` link, add both env vars, `vercel --prod`.
- **Done when:** prod URL loads and mutations persist to Supabase.

---

## P1 — make it a real in-flight tracker

### [P1·M] Stored value phasing (replace the frontend ramp)
- New table `phasing(initiative_id, month_index, value)` or a `ramp_months` + `start_month` per initiative. Sum into a `v_trajectory` view.
- Rewire the Trajectory view to read the view instead of the client-side derivation.
- **Done when:** trajectory reflects stored phasing and updates when phasing edits.

### [P1·S] Add-initiative + edit-initiative forms
- CRUD on `initiatives` (next-free-ID helper per bucket per rule 3). Inputs only — scores compute in the view.
- **Done when:** a new initiative can be added from the UI and scores immediately.

### [P1·S] Change-log / audit table
- `change_log(id, entity, entity_id, field, old, new, who, at)`; write from actions. Governance requirement — nothing gets silently altered.
- **Done when:** stage/RAG/config changes append a log row; a simple log view exists.

### [P1·M] Protect Growth OS with Supabase Auth
- Add login and role-based customer access before enabling `BARAWELL_SHOW_CUSTOMER_NAMES=true`.
- Separate founder, sales lead, and sales-agent permissions.
- **Done when:** customer identity and CRM mutations require a signed-in, authorized user.

### [P1·M] Schedule Growth OS ingestion
- Run `scripts/ingest_growth_os.py` from n8n, GitHub Actions, or a protected operator job after every workbook refresh.
- Normalize channel aliases and alert when source counts drift materially.
- **Done when:** aggregate history and Pulse refresh without manual SQL.

### [P1·M] Approved CRM message library and clinical governance
- Store versioned, approved templates by play and channel.
- Add exclusions for unresolved complaints, clinical escalation, and do-not-contact.
- **Done when:** sales can only send approved copy and all sensitive cases route to humans.

---

## P2 — depth

### [P2·M] Attrition / leakage tracking
- Capture value lost when an initiative is killed or de-scoped between stages. A `status` field (`Active/Killed/Descoped`) + a leakage rollup in `v_coverage`.
- **Done when:** the coverage view shows gross pipeline, leakage, and net.

### [P2·L] Calibrate propensity and uplift models
- Use CRM activity, experiment membership, and conversion outcomes to estimate calibrated response and incremental uplift.
- Validate out of sample and retain deterministic fallbacks.
- **Done when:** heuristic-v1 is replaced only where a model demonstrably improves ranking.

### [P2·M] Campaign and order attribution
- Automate conversion linkage to assignments within a governed window, with refund and margin adjustments.
- **Done when:** play readouts show attributed and incremental revenue/GP without manual entry.

### [P2·M] Customer-level refill intervals
- Add a private customer mart with personal reorder intervals and product-specific fallback medians.
- **Done when:** refill timing moves from the global cohort window to customer/product evidence.

### [P2·S] Exception-based review view
- A "review mode" filtered to at-risk only (RAG ≠ Green, or coverage-critical initiatives), matching KEY's exception-based reporting.
- **Done when:** one click shows only what needs attention this week.

### [P2·S] Export to BCG-style status slide
- Generate a one-slide PNG/PPTX snapshot: coverage bridge + top movers + RAG summary, "so-what" title.
- **Done when:** a button produces a client-ready status slide.

---

## Done

### [P0·S] `npm run build` passes clean — 2026-07-07
- Fixed a type error in the Register sort comparator. Build exits 0.

### [P1·M] Milestone-driven auto-RAG — 2026-07-07
- `0002_auto_rag.sql`: milestone-derived RAG in SQL with manual override.

### [P1·M] Config-editing UI — 2026-07-07
- Founder-facing assumptions modal writes inputs; SQL views re-price the portfolio.

### [P1·L] Customer segmentation evidence layer — 2026-07-13
- Value × Lifecycle marts, retention funnel, refill cohort, channel/product mix, and five ranked customer action queues are live.

### [P1·L] Integrated Growth OS — 2026-07-14
- Historical monthly/cohort/channel/product/segment marts and movement history.
- Automatic Pulse insights, expected ranges, channel/product drivers, and target scorecard.
- CRM assignments, activities, outcomes, deterministic propensity scoring, and play effectiveness.
- Treatment/holdout experiments with treatment-only task creation.
- Aggregate XLSX ingestion; phone numbers never leave the ingestion process.
