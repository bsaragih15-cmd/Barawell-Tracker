-- ============================================================
-- 0006 — Card fields (status note, next action, KPI, age-in-state)
--        + change_log (activity / governance)
-- ============================================================
-- Adds the fields the initiative card needs to carry the whole operating
-- conversation, and a change_log so nothing is silently altered (BACKLOG P1).
-- Additive: new nullable columns + one table + view recreate (so the new
-- columns flow through i.* into v_initiatives_scored). No math changes.
-- ============================================================

alter table initiatives
  add column if not exists note        text,        -- "where this stands" (latest status)
  add column if not exists next_action text,        -- the single next action
  add column if not exists next_due    date,         -- when that action is due
  add column if not exists kpi_label   text,        -- metric this initiative moves
  add column if not exists kpi_target  numeric,     -- target value of that metric
  add column if not exists kpi_actual  numeric,     -- current value
  add column if not exists kpi_unit    text,         -- '%', 'Rp', 'orders', …
  add column if not exists state_since timestamptz;  -- when stage last changed (age-in-state)

-- Backfill age-in-state so cards don't show "0d" on first load.
update initiatives set state_since = coalesce(state_since, updated_at, created_at, now());

-- ---------- change_log: every mutation appends a row ----------
create table if not exists change_log (
  id         bigint generated always as identity primary key,
  entity     text not null,               -- 'initiative' | 'config' | 'milestone'
  entity_id  text,
  field      text not null,
  old_val    text,
  new_val    text,
  who        text,                         -- null until Supabase Auth (D3)
  at         timestamptz not null default now()
);
create index if not exists change_log_entity_at on change_log(entity_id, at desc);

alter table change_log enable row level security;
drop policy if exists rw_log      on change_log;
drop policy if exists rw_log_anon on change_log;
create policy rw_log      on change_log for all to authenticated using (true) with check (true);
create policy rw_log_anon on change_log for all to anon          using (true) with check (true);

-- ============================================================
-- Recreate the engine view so the new initiative columns appear (i.* re-expands
-- at creation). Logic is byte-for-byte the same as 0004 — owner join, status,
-- rag_auto/effective. v_coverage depends on it, so drop that first.
-- ============================================================
drop view if exists v_coverage;
drop view if exists v_initiatives_scored;

create view v_initiatives_scored as
with c as (select * from config where id = 1),
base as (
  select i.*, s.code stage_code, s.name stage_name, s.confidence stage_conf,
         p.name as owner_name, coalesce(p.is_lead, false) as owner_is_lead,
         c.margin, c.target, c.current_rev cfg_rev,
         (case i.base_type
            when 'TOTAL'     then c.current_rev
            when 'REPEAT'    then c.current_rev * c.repeat_share
            when 'NEW'       then c.current_rev * (1 - c.repeat_share)
            when 'DTC'       then c.current_rev * c.dtc_share
            when 'MKT'       then c.current_rev * (1 - c.dtc_share)
            when 'TOKO_LOST' then c.toko_lost
            else i.direct_rp
          end) as base_rp
  from initiatives i
  join stages s on s.n = i.stage
  left join pics p on p.id = i.owner_id
  cross join c
),
s1 as (select base.*, (base_rp * uplift * coverage) as incr_rev from base),
s2 as (
  select s1.*,
         incr_rev * margin      as incr_gp,
         incr_rev * stage_conf  as ra_rev,
         (case when incr_rev >= 25000000 then 5
               when incr_rev >= 15000000 then 4
               when incr_rev >=  8000000 then 3
               when incr_rev >=  3000000 then 2 else 1 end) as impact
  from s1
),
scored as (
  select s2.*,
         incr_gp * stage_conf as ra_gp,
         3*incr_gp - build_cost - 3*monthly_cost as net_3mo,
         (case when (incr_gp - monthly_cost) <= 0 then null
               else build_cost / (incr_gp - monthly_cost) end) as payback_mo,
         impact * conf * ease as ice,
         (case
            when left(bucket,1) = 'G' then 'Enabler'
            when impact >= 4 and ease >= 4 then 'Quick Win'
            when impact >= 4 and ease <  4 then 'Big Bet'
            when impact <  4 and ease >= 4 then 'Fill-in'
            else 'Deprioritize' end) as quadrant,
         (select count(*) from milestones m where m.initiative_id = s2.id) as ms_total,
         (select count(*) from milestones m where m.initiative_id = s2.id and m.done) as ms_done,
         (case
            when exists (
              select 1 from milestones m
              where m.initiative_id = s2.id and not m.done
                and m.due_date is not null and m.due_date < current_date
            ) then 'Red'
            when (select count(*) from milestones m where m.initiative_id = s2.id) = 0 then null
            when (select count(*) from milestones m where m.initiative_id = s2.id and m.done)::numeric
                 / nullif((select count(*) from milestones m where m.initiative_id = s2.id), 0) < 0.5
                 and s2.stage >= 4 then 'Amber'
            else 'Green' end) as rag_auto
  from s2
)
select scored.*,
       (case when rag_override then rag else rag_auto end) as rag_effective
from scored;

create view v_coverage as
with c as (select * from config where id = 1),
agg as (
  select coalesce(sum(case when stage >= 4 then ra_rev end),0) as committed,
         coalesce(sum(case when stage  = 3 then ra_rev end),0) as planned,
         coalesce(sum(case when stage <= 2 then ra_rev end),0) as pipeline
  from v_initiatives_scored
  where status = 'Active'
)
select c.current_rev, c.target,
       (c.target - c.current_rev) as gap,
       a.committed, a.planned, a.pipeline,
       (a.committed + a.planned + a.pipeline) as total_ra,
       (c.current_rev + a.committed + a.planned + a.pipeline) as projected,
       round((a.committed + a.planned + a.pipeline) / nullif(c.target - c.current_rev,0) * 100) as coverage_pct,
       round(a.committed / nullif(c.target - c.current_rev,0) * 100) as committed_pct
from agg a cross join c;
