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

### [P1·M] Adherence pass: single-view board, review filter, stale flags, milestone CRUD, weekly Δ — 2026-07-07
- Removed all tabs (D15): Execution board is the app. Filter chips replace views — "Needs attention" (RAG≠Green / overdue milestone / stale ≥14d) + per-owner filters.
- Cards show stale badges and their next dated milestone (red when overdue).
- Milestones add/delete from the drawer (with due dates) — auto-RAG now feedable everywhere.
- `0005_weekly_snapshots.sql`: `coverage_snapshots` (1 row/ISO week) + `capture_coverage_snapshot()` upsert called on page load; hero shows Δ coverage pts vs last week. Covers most of the old "Exception-based review view" P2 item.

### [P1·S] Drag-and-drop + 3-lane Execution board — 2026-07-07
- Cards drag between the 5 Pipeline stage columns (drop = set stage, absolute).
- New "Execution" tab: Idea (L1–L2) / Execute (L3–L4) / Done (L5) — a projection of the stage-gates (D14), drag between lanes writes the lane's canonical stage (L2/L4/L5). Lane rollups show count + risk-adj Rp/mo; cards show milestone progress + owner.

### [P1·S] Add / edit / kill initiative + owners — 2026-07-07
- `0004_owners_and_register_lifecycle.sql`: formalises the ad-hoc live `pics` table + `initiatives.owner_id` FK, adds a `status` ('Active'/'Killed') column, and rebuilds `v_initiatives_scored` (now joins `owner_name`/`owner_is_lead`) and `v_coverage` (counts `status='Active'` only, so killing a lever drops its value from the bridge).
- UI: "+ New initiative" modal (all scoring inputs, ID auto-assigned per bucket per rule 3 — scores compute in the view, no math in the client); "Edit inputs" from the drawer reuses the same form; owner assignment (PIC chips) in the drawer + owner avatars on pipeline/board cards and a Register column; kill/restore with a "show N killed" toggle. Verified: kill A2 → coverage 54%→47%, restore → 54%.

### [P0·S] `npm run build` passes clean — 2026-07-07
- Fixed a type error in the Register sort comparator (`(string & number)` cast collapsed to `never`, breaking `localeCompare`). Build exits 0.

### [P1·M] Milestone-driven auto-RAG — 2026-07-07
- `0002_auto_rag.sql`: added `initiatives.rag_override`; `v_initiatives_scored` now computes `rag_auto` (Red = any overdue open milestone; Amber = <50% progress & stage ≥ L4; Green = has milestones, else null) and `rag_effective` (`rag_override ? rag : rag_auto`). Frontend reads `rag_effective`; the drawer shows auto-vs-manual and a "use auto" reset; overdue milestones render red. Rule D2 honoured — logic is in SQL, not app code.

### [P1·M] Config-editing UI — 2026-07-07
- "Assumptions" modal (topbar) edits all seven `config` fields via the existing `updateConfig` action; Rp fields entered in millions, shares/margin/haircut as %. Save re-prices the whole portfolio through the view. Deferred: `haircut` is stored but not yet consumed by a view (the In-Plan overlap rollup, D6, isn't built).
