-- ============================================================
-- 0004 — Owners (PICs) + register lifecycle (add / edit / kill)
-- ============================================================
-- Two things ship here, both additive and idempotent:
--
--   1. OWNERS. A `pics` table (person-in-charge) + `initiatives.owner_id` FK.
--      Part of this already exists in the live project (created ad-hoc); this
--      migration formalises it so a fresh project reproduces the same schema.
--      `v_initiatives_scored` now joins the owner name/lead flag so the
--      frontend can show accountability without a second round-trip.
--
--   2. LIFECYCLE. A `status` column ('Active'/'Killed') so the register can be
--      pruned by KILLING, never deleting (non-negotiable rule 3 — stable IDs,
--      kill via status). Killed initiatives stay in the scored view (so the UI
--      can list/restore them) but drop out of `v_coverage` — killing a lever
--      removes its value from the bridge, which is the honest behaviour.
--
-- No math moved to the app: scoring stays in v_initiatives_scored (rule 1/D2).
-- ============================================================

-- ---------- 1. owners (person-in-charge) ----------
create table if not exists pics (
  id         text primary key,          -- stable slug, e.g. 'andrew'
  name       text not null,
  email      text,
  is_lead    boolean not null default false,
  created_at timestamptz default now()
);

alter table initiatives add column if not exists owner_id text references pics(id);

-- ---------- 2. register lifecycle ----------
alter table initiatives
  add column if not exists status text not null default 'Active'
  check (status in ('Active','Killed'));

-- ---------- RLS: 3-person team + anon MVP fallback (mirrors 0001/0003) ----------
alter table pics enable row level security;
drop policy if exists rw_pics      on pics;
drop policy if exists rw_pics_anon on pics;
create policy rw_pics      on pics for all to authenticated using (true) with check (true);
create policy rw_pics_anon on pics for all to anon          using (true) with check (true);

-- ============================================================
-- Recreate the engine view: adds owner_id/owner_name/owner_is_lead + status.
-- v_coverage depends on it, so drop that first.
-- ============================================================
drop view if exists v_coverage;
drop view if exists v_initiatives_scored;

create view v_initiatives_scored as
with c as (select * from config where id = 1),
base as (
  select i.*, s.code stage_code, s.name stage_name, s.confidence stage_conf,
         p.name owner_name, coalesce(p.is_lead,false) owner_is_lead,
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
         incr_rev * margin                              as incr_gp,
         incr_rev * stage_conf                          as ra_rev,
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

-- ============================================================
-- Coverage view — counts ACTIVE initiatives only. Killing a lever removes
-- its risk-adjusted value from committed/planned/pipeline.
-- ============================================================
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

-- ---------- seed PICs (idempotent; matches the live ad-hoc rows) ----------
insert into pics (id, name, is_lead) values
  ('andrew','Andrew',false),
  ('berthin','Berthin',false),
  ('jimmy','Jimmy',false)
on conflict (id) do nothing;
