-- ============================================================
-- 0002 — Milestone-driven auto-RAG
-- RAG derives from milestone status in SQL (single source of truth),
-- unless a manual override is set. Additive migration: adds one column,
-- recreates the two views. Does NOT touch table data except a few
-- illustrative milestone due dates so the auto-Red path is demonstrable.
--
-- Rule (BACKLOG P1):
--   Red   — any milestone past its due_date and not done
--   Amber — milestone progress < 50% AND stage >= L4 (in-flight but slipping)
--   Green — has milestones, none of the above
--   null  — no milestones (no delivery signal yet)
--   Manual override always wins (rag_override = true → show the manual rag).
-- ============================================================

-- ---------- manual-override flag ----------
alter table initiatives add column if not exists rag_override boolean not null default false;

-- Preserve intent: rows that carried a hand-set RAG in the seed keep it as a
-- manual override. (Auto happens to reproduce these colours, but the operator
-- set them deliberately, so honour that until they clear it.)
update initiatives set rag_override = true where rag is not null;

-- ---------- illustrative due dates (so auto-RAG visibly fires) ----------
-- E1's diagnosis has slipped past due while still open → auto-Red once cleared to auto.
update milestones set due_date = current_date - 7  where initiative_id = 'E1' and title = 'Root-cause diagnosis of blocks';
update milestones set due_date = current_date + 14 where initiative_id = 'A2' and title = 'First reorder flow live';
update milestones set due_date = current_date + 5  where initiative_id = 'G1' and title = 'WA conversion event firing';

-- ============================================================
-- Recreate the engine view with rag_auto + rag_effective.
-- v_coverage depends on it, so drop that first.
-- ============================================================
drop view if exists v_coverage;
drop view if exists v_initiatives_scored;

create view v_initiatives_scored as
with c as (select * from config where id = 1),
base as (
  select i.*, s.code stage_code, s.name stage_name, s.confidence stage_conf,
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
         -- milestone-derived RAG (before override)
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
-- Coverage view — unchanged logic, recreated on top of the new engine view.
-- ============================================================
create view v_coverage as
with c as (select * from config where id = 1),
agg as (
  select coalesce(sum(case when stage >= 4 then ra_rev end),0) as committed,
         coalesce(sum(case when stage  = 3 then ra_rev end),0) as planned,
         coalesce(sum(case when stage <= 2 then ra_rev end),0) as pipeline
  from v_initiatives_scored
)
select c.current_rev, c.target,
       (c.target - c.current_rev) as gap,
       a.committed, a.planned, a.pipeline,
       (a.committed + a.planned + a.pipeline) as total_ra,
       (c.current_rev + a.committed + a.planned + a.pipeline) as projected,
       round((a.committed + a.planned + a.pipeline) / nullif(c.target - c.current_rev,0) * 100) as coverage_pct,
       round(a.committed / nullif(c.target - c.current_rev,0) * 100) as committed_pct
from agg a cross join c;
