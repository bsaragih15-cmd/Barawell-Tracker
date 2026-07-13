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

### [P0·S] `npm run build` passes clean
- The code is written for Next 14 but was authored offline (no install). Resolve any type/version pins.
- **Done when:** `npm run build` exits 0 with no type errors.

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

---

## P2 — depth

### [P2·M] Attrition / leakage tracking
- Capture value lost when an initiative is killed or de-scoped between stages. A `status` field (`Active/Killed/Descoped`) + a leakage rollup in `v_coverage`.
- **Done when:** the coverage view shows gross pipeline, leakage, and net.

### [P2·L] n8n → Supabase ingestion
- Pipe live sales/ad performance into an `actuals` table; auto-refresh `config.current_rev` and flag assumptions that drift from actuals. This is the "shared backend" payoff that justified going custom (D1).
- **Done when:** current_rev updates from a scheduled n8n run; a drift indicator appears when an assumption diverges from actuals.
- **Note (2026-07-13):** the segmentation ingestion (`scripts/ingest_segments.py`, D14) is the first instance of this ETL role. When n8n lands, it should (a) land a real `orders` table, (b) let the `v_segment_*` views compute live over it (retiring the marts), and (c) refresh `config` assumptions from the same feed — repeat_share and AOV are now measurable (14.0% repeat, Rp296k avg AOV), so D8's placeholders can be replaced.

### [P1·M] Wire segmentation into the initiative model
- The Segments tab (D12–D15) now sizes the pools the retention/AOV initiatives act on: 4,058 one-and-done, 2,459 dormant, 607 cross-sell targets, ~46d refill window. Feed these into the initiatives' `base_rp`/`coverage`/`uplift` inputs so A1–A5 / B1–B4 / F2 are calibrated to real segment sizes instead of D8 placeholders. Consider an `initiative ↔ segment/queue` link so advancing a play shows the exact target list.
- **Done when:** at least the retention (A) and AOV (B) initiatives read segment-derived pool sizes, and a drawer can surface the queue a given initiative works.

### [P2·M] Segmentation depth — refresh cadence, refill precision, phone behind auth
- Auto-refresh the marts on the ingestion schedule (currently a one-off load). Store the exact median refill per cohort rather than the hard-coded ~46d UI label. Once Auth lands (D3/P2), move phone into an authenticated-only table so action queues are directly dial-able (D15).
- **Done when:** marts refresh on schedule and the refill window is data-driven per view.

### [P2·M] Supabase Auth (retire service-role shortcut)
- Add Supabase Auth (magic link or Google), switch server client to anon key + user session, lean on the RLS policies already in the migration.
- **Done when:** the app requires login and the service-role key is gone from request paths.

### [P2·S] Exception-based review view
- A "review mode" filtered to at-risk only (RAG ≠ Green, or coverage-critical initiatives), matching KEY's exception-based reporting.
- **Done when:** one click shows only what needs attention this week.

### [P2·S] Export to BCG-style status slide
- Generate a one-slide PNG/PPTX snapshot: coverage bridge + top movers + RAG summary, "so-what" title. (Owner uses PptxGenJS.)
- **Done when:** a button produces a client-ready status slide.

---

## Done

### [P0·S] `npm run build` passes clean — 2026-07-07
- Fixed a type error in the Register sort comparator (`(string & number)` cast collapsed to `never`, breaking `localeCompare`). Build exits 0.

### [P1·M] Milestone-driven auto-RAG — 2026-07-07
- `0002_auto_rag.sql`: added `initiatives.rag_override`; `v_initiatives_scored` now computes `rag_auto` (Red = any overdue open milestone; Amber = <50% progress & stage ≥ L4; Green = has milestones, else null) and `rag_effective` (`rag_override ? rag : rag_auto`). Frontend reads `rag_effective`; the drawer shows auto-vs-manual and a "use auto" reset; overdue milestones render red. Rule D2 honoured — logic is in SQL, not app code.

### [P1·M] Config-editing UI — 2026-07-07
- "Assumptions" modal (topbar) edits all seven `config` fields via the existing `updateConfig` action; Rp fields entered in millions, shares/margin/haircut as %. Save re-prices the whole portfolio through the view. Deferred: `haircut` is stored but not yet consumed by a view (the In-Plan overlap rollup, D6, isn't built).

### [P1·L] Customer segmentation cockpit tab — 2026-07-13
- `0004_segments.sql`: segmentation marts + the `v_segment_*` view contract (D12–D15). `scripts/ingest_segments.py` computes the model from the `histori-pesanan` export (4,716 customers) and lands the marts; no PII committed.
- New **Segments** tab (`app/Segments.tsx`): headline tiles, the Value×Lifecycle matrix (12 cells, click for detail), the retention funnel (4,716→658→237→53), the refill cohort (median ~46d), channel mix (website already 51% of orders; Tokopedia only 17%), product/cross-sell headroom (Baralast attach 1.3% → 607 targets), and five ranked, copy-exportable action queues (refill-due, win-back, cross-sell, AOV-expand, channel-migrate).
- Key findings baked in: **86% one-and-done** (repeat rate 14.0%, but repeaters = 33% of revenue); the leak is the second order; owned channel is already the largest (reframes the Tokopedia risk as bounded). Build passes; component SSR-verified against live data. Local browser E2E not possible (egress policy blocks the dev server from Supabase); verified via the MCP-backed views + Vercel.
