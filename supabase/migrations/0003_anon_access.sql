-- ============================================================
-- 0003 — MVP anon access (REVERSIBLE security tradeoff)
-- ============================================================
-- The app is designed around a server-only SERVICE-ROLE key that bypasses RLS
-- (see lib/supabase/server.ts, DECISIONS D3). When that secret isn't wired in,
-- the server client falls back to the ANON key, which runs as the `anon`
-- Postgres role — and the 0001 policies only grant `authenticated`. These
-- policies open the same read/write access to `anon` so the fallback works.
--
-- ⚠️  This makes the tables reachable by anyone holding the (public) anon key.
-- Acceptable only for an MVP on placeholder data (D8). To harden:
--   1. Set SUPABASE_SERVICE_ROLE_KEY in the deploy env (bypasses RLS), and
--   2. Run the DOWN block below to drop these anon policies, or move to Auth.
-- ============================================================
create policy rw_config_anon on config      for all to anon using (true) with check (true);
create policy rw_stages_anon on stages      for all to anon using (true) with check (true);
create policy rw_inits_anon  on initiatives for all to anon using (true) with check (true);
create policy rw_miles_anon  on milestones  for all to anon using (true) with check (true);

-- ---------- DOWN (run manually to harden once service-role key is set) ----------
-- drop policy rw_config_anon on config;
-- drop policy rw_stages_anon on stages;
-- drop policy rw_inits_anon  on initiatives;
-- drop policy rw_miles_anon  on milestones;
