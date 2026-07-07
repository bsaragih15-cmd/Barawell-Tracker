-- ============================================================
-- 0005 — Weekly coverage snapshots (the adherence flywheel)
-- ============================================================
-- Stores one row of v_coverage per ISO week so the cockpit can show
-- Δ coverage vs last week — the number that creates social pressure when it
-- doesn't move. Capture is idempotent-per-week: the app calls
-- capture_coverage_snapshot() on page load; first load of a new week writes
-- the row, later loads update it (so the week's snapshot tracks the latest
-- state until the week closes and the next row starts).
--
-- No math moves to the app (rule 1): the snapshot copies the SQL view.
-- ============================================================

create table if not exists coverage_snapshots (
  week_start   date primary key,          -- Monday of the ISO week
  captured_at  timestamptz not null default now(),
  current_rev  numeric not null,
  target       numeric not null,
  committed    numeric not null,
  planned      numeric not null,
  pipeline     numeric not null,
  total_ra     numeric not null,
  coverage_pct numeric
);

alter table coverage_snapshots enable row level security;
drop policy if exists rw_snaps      on coverage_snapshots;
drop policy if exists rw_snaps_anon on coverage_snapshots;
create policy rw_snaps      on coverage_snapshots for all to authenticated using (true) with check (true);
create policy rw_snaps_anon on coverage_snapshots for all to anon          using (true) with check (true);

-- Upsert this week's snapshot from the live coverage view.
create or replace function capture_coverage_snapshot()
returns void
language sql
security definer
set search_path = public
as $$
  insert into coverage_snapshots
    (week_start, captured_at, current_rev, target, committed, planned, pipeline, total_ra, coverage_pct)
  select date_trunc('week', current_date)::date, now(),
         current_rev, target, committed, planned, pipeline, total_ra, coverage_pct
  from v_coverage
  on conflict (week_start) do update set
    captured_at  = excluded.captured_at,
    current_rev  = excluded.current_rev,
    target       = excluded.target,
    committed    = excluded.committed,
    planned      = excluded.planned,
    pipeline     = excluded.pipeline,
    total_ra     = excluded.total_ra,
    coverage_pct = excluded.coverage_pct;
$$;

grant execute on function capture_coverage_snapshot() to anon, authenticated;
