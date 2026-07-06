# QUICKSTART — first session with Claude Code

Paste this to kick off:

> Read CLAUDE.md, docs/DECISIONS.md, and docs/BACKLOG.md. Then work the P0
> tasks in BACKLOG in order: stand the app up against a fresh Supabase project,
> get `npm run build` passing, and deploy to Vercel. Report the coverage_pct
> from v_coverage once the migration runs, and stop for my review before
> starting P1.

## Where things are
- Behavioral contract & architecture → CLAUDE.md
- Settled decisions (don't relitigate) → docs/DECISIONS.md
- Prioritized work → docs/BACKLOG.md
- The engine → supabase/migrations/0001_init.sql (views v_initiatives_scored, v_coverage)
- The UI → app/Cockpit.tsx (reads computed columns only)

## The one thing to remember
The scoring math lives in SQL. Change the view, never re-implement calculations
in the frontend.
