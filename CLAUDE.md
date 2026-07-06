# CLAUDE.md — Barawell Value-Capture Pipeline

Context and operating rules for Claude Code working in this repo. Read this fully before touching anything.

## What this is

A KEY-style transformation cockpit for **Barawell**, an Indonesian men's-health telehealth business (ED, compounded meds, adjacent categories — think a lean, local Hims). The tool tracks a **growing portfolio of growth initiatives** through stage-gates, computes confidence-weighted value, and reconciles it to a revenue target. It is **a decision instrument, not a to-do list**: the point is to answer "is our pipeline enough to hit Rp 500M/mo, and how much is committed vs. speculative."

The owner is a BCG consultant running this as an operator on the side. Register: direct, MECE, hypothesis-driven, no filler. Slide/section titles are "so-what" statements. Trackers use RAG. Assume graduate-level analytical ability — don't over-explain.

## The business problem (why the model looks the way it does)

- June revenue Rp 210M/mo, down from Rp 230M in May. Target Rp 500M/mo in 3 months.
- Tokopedia stores are being blocked (8 in June, 15 in May) — channel capacity is structurally impaired.
- Repeat orders are healthy but monetized only via mass "blasting" — the biggest cheap upside is retention/AOV, not acquisition into constrained channels.
- Honest read baked into the model: retention + AOV + channel recovery can plausibly reach ~Rp 300–350M fairly fast; the jump to Rp 500M needs a working acquisition engine (TikTok Shop, paid) that depends on channels currently constrained. **Do not let the model imply the target is easy.**

## Architecture

```
Supabase (Postgres) ── the model + system of record
  config                1-row assumptions (rev, target, margin, shares, haircut)
  stages                L1–L5 + confidence factor (0.30 → 1.00)
  initiatives           the growing register (inputs + stage + P&L + RAG)
  milestones            drives RAG / delivery progress
  v_initiatives_scored  THE ENGINE — base×uplift×coverage → rev → GP → risk-adj → impact → ICE → quadrant
  v_coverage            committed (L4-5) / planned (L3) / pipeline (L1-2) vs target

Next.js 14 App Router on Vercel ── the cockpit
  app/page.tsx      Server Component: reads the two views + config/stages/milestones
  app/Cockpit.tsx   Client: coverage bridge, tiles, Pipeline/Register/Prioritize/Trajectory, drawer
  app/actions.ts    Server Actions: moveStage, setRag, toggleMilestone, updateConfig
  lib/supabase/server.ts   service-role client (SERVER ONLY)
```

## Non-negotiable rules

1. **The scoring engine lives in SQL, not JS.** `v_initiatives_scored` is the single source of truth. If a calculation changes (thresholds, quadrant logic, risk-weighting), change it in the migration and the view — never re-implement the math in the frontend. The frontend reads computed columns only.
2. **Service-role key is server-only.** It lives in `lib/supabase/server.ts` and is imported exclusively by Server Components and Server Actions. Never import it into a Client Component. Never prefix it `NEXT_PUBLIC_`.
3. **Stable IDs, never renumber.** Initiatives are `A1, B2, G3…` — the bucket letter is load-bearing (the quadrant formula reads `left(bucket,1)='G'` for enablers). New ideas get the next free ID in their bucket. Kill via status, don't delete.
4. **Every mutation revalidates.** Server Actions end with `revalidatePath('/')`. The page is `dynamic = 'force-dynamic'`.
5. **Money is Rp, displayed in mono tabular numerals.** The `rp()` helper and `.mono` class are the convention — keep figures aligned like a financial model.
6. **Don't scale acquisition math without attribution.** In the model, D1/D2 (paid) are gated by G1 (attribution stack). Reflect that dependency if you touch acquisition initiatives.

## The scoring model (so you can reason about it)

Per initiative, in `v_initiatives_scored`:
- `base_rp` — revenue pool via `base_type` (TOTAL/REPEAT/NEW/DTC/MKT/TOKO_LOST/DIRECT), pulled from `config`.
- `incr_rev = base_rp × uplift × coverage`; `incr_gp = incr_rev × margin`.
- `ra_rev = incr_rev × stage_confidence` — value **hardens** as it passes gates (L1 30% → L5 100%).
- `impact` 1–5 (Rp thresholds 3M/8M/15M/25M); `ice = impact × conf × ease`; `quadrant` from impact×ease (enablers forced to "Enabler").
- `payback_mo`, `net_3mo`.

`v_coverage` rolls `ra_rev` into committed/planned/pipeline vs `target − current_rev`.

## Design system

Ledger aesthetic: cool-paper canvas `#F6F8FA`, ink `#141922`, one accent (ledger green `#0F7A5A`), muted stage/quadrant palettes. Inter for UI, JetBrains Mono for all figures. The hero is the **coverage bridge**; the signature interaction is **advancing a stage-gate**. Keep it quiet and dense — instrument, not dashboard. Full tokens in `app/globals.css`. Don't drift toward generic SaaS gradients.

## How to work here

- **Before building:** read `docs/BACKLOG.md` for the prioritized task list and `docs/DECISIONS.md` for what's already settled (don't relitigate).
- **Migrations:** additive, numbered (`0002_…`, `0003_…`). Never edit `0001_init.sql` in place once it's been run against a real project — write a new migration.
- **Verify before shipping:** `npm run build` must pass. If you change the SQL, re-run the migration on a scratch Supabase project and confirm `v_coverage` returns sane numbers before wiring the UI.
- **Match the register in any user-facing copy:** "so-what" titles, RAG for status, plain operator language ("Advance gate," not "Increment stage enum").

## Known deferred work (see BACKLOG for detail)

Auto-derive RAG from milestone slippage · stored value **phasing** table (vs. the current frontend ramp) · attrition/leakage tracking between gates · Supabase Auth (replace service-role shortcut) · config-editing UI form · the n8n → `initiatives`/`actuals` ingestion that refreshes assumptions from live sales data.
