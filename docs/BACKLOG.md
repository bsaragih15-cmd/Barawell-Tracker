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

### [P1·M] Milestone-driven auto-RAG
- Add a rule: RAG derives from milestone status unless manually overridden. Red if any milestone past `due_date` and not done; Amber if progress <50% and stage ≥ L4; Green otherwise. Keep a manual override flag.
- Prefer computing in a view (`v_initiatives_scored` or a new `v_initiative_rag`) over app code (rule D2).
- **Done when:** overdue milestones surface Red automatically; manual override still wins.

### [P1·M] Stored value phasing (replace the frontend ramp)
- New table `phasing(initiative_id, month_index, value)` or a `ramp_months` + `start_month` per initiative. Sum into a `v_trajectory` view.
- Rewire the Trajectory view to read the view instead of the client-side derivation.
- **Done when:** trajectory reflects stored phasing and updates when phasing edits.

### [P1·M] Config-editing UI
- A form (drawer or modal) that writes `config` via `updateConfig` (action already exists). Fields: current_rev, target, margin, repeat_share, dtc_share, toko_lost, haircut.
- Recompute cascades automatically (it's all in the view).
- **Done when:** editing an assumption re-prices the whole portfolio live.

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
_(move completed items here with a date)_
