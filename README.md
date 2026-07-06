# Barawell — Value-Capture Pipeline

A KEY-style transformation cockpit: stage-gated initiatives, confidence-weighted value, coverage-to-target, milestones + RAG, and a value trajectory. Next.js (App Router) + Supabase (Postgres). The entire impact engine lives in a SQL view — single source of truth, no formula drift.

## Architecture

```
Supabase (Postgres)
├── config            1-row assumption set (revenue, target, margin, shares, haircut)
├── stages            L1–L5 + confidence factor
├── initiatives       the growing register (inputs + stage + P&L + RAG)
├── milestones        drives RAG / progress
├── v_initiatives_scored   ← the engine (base×uplift×coverage → rev → GP → risk-adj → impact → ICE → quadrant)
└── v_coverage             ← committed / planned / pipeline vs target

Next.js on Vercel
├── app/page.tsx      Server Component: reads the two views + config/stages/milestones
├── app/Cockpit.tsx   Client: bridge, tiles, Pipeline / Register / Prioritize / Trajectory, drawer
└── app/actions.ts    Server Actions: moveStage, setRag, toggleMilestone, updateConfig
```

## Setup (≈10 min)

1. **Create a Supabase project** → SQL Editor → paste `supabase/migrations/0001_init.sql` → Run. This builds the schema, both views, RLS policies, and seeds all 31 initiatives + stages + config + sample milestones.

2. **Env** — copy `.env.example` to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...        # Project → Settings → API → service_role
   ```
   The service-role key is used **server-side only** (Server Components + Actions) so the app works immediately for an internal 3-person team. It never reaches the browser. To open the tool to end-users, switch to Supabase Auth + the anon key and rely on the RLS policies already in the migration.

3. **Run locally**
   ```bash
   npm install
   npm run dev        # http://localhost:3000
   ```

4. **Deploy**
   ```bash
   npm i -g vercel
   vercel               # link project
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel --prod
   ```

## How the model works

`v_initiatives_scored` computes, per initiative:
- `base_rp` — the revenue pool (via `base_type`: TOTAL / REPEAT / NEW / DTC / MKT / TOKO_LOST / DIRECT), pulled from `config`.
- `incr_rev = base_rp × uplift × coverage`, `incr_gp = incr_rev × margin`.
- `ra_rev = incr_rev × stage_confidence` — value hardens as an initiative passes gates (L1 30% → L5 100%).
- `impact` (1–5 from Rp thresholds), `ice = impact × conf × ease`, `quadrant`, `payback_mo`, `net_3mo`.

`v_coverage` rolls risk-adjusted value into **committed (L4–L5) / planned (L3) / pipeline (L1–L2)** and compares to the target gap.

## Editing the model
- **Tune assumptions** → edit the `config` row (or wire `updateConfig` to a UI form). Everything re-prices.
- **Add an initiative** → insert a row in `initiatives` with the next free ID in its bucket. It scores automatically.
- **Advance a gate** → the ▸ buttons call `moveStage`; value hardens and coverage moves.
- **Track delivery** → set RAG + tick milestones in the drawer.

## Notes
- `dynamic = 'force-dynamic'` on the page + `revalidatePath('/')` in actions keeps reads fresh after mutations.
- Trajectory ramps value in over 6 months from stage + time-to-impact — a frontend derivation for the MVP. For board-grade phasing, add a `phasing` table (initiative_id, month, value) and sum it in a view.
- Governance: never renumber IDs; kill via a status, don't delete; snapshot `config` per review so score changes are traceable.
