create or replace function create_crm_assignments(
  p_play_code text,
  p_limit integer default 20,
  p_assigned_to text default null,
  p_experiment_id bigint default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare v_inserted integer;
begin
  insert into crm_assignments(
    customer_key,customer_name,city,play_code,assigned_to,priority_score,
    expected_incremental_value,reason,experiment_id,due_at
  )
  select q.customer_key,q.customer_name,q.city,q.play_code,p_assigned_to,q.priority_score,
         q.expected_incremental_value,q.reason,p_experiment_id,
         now() + make_interval(days => coalesce(p.default_due_days,1))
  from v_crm_action_queue q
  join crm_plays p on p.code=q.play_code
  where q.play_code=p_play_code
    and not exists (
      select 1 from crm_assignments a
      where a.customer_key=q.customer_key and a.play_code=q.play_code
        and a.status in ('open','in_progress','snoozed')
    )
  order by q.rank
  limit greatest(1,least(p_limit,80));
  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function seed_crm_experiment(p_experiment_id bigint,p_limit integer default 200)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare v_count integer;
begin
  insert into crm_experiment_members(experiment_id,customer_key,arm)
  select e.id,q.customer_key,
         case when mod(abs(hashtext(q.customer_key || e.code)),10000) < e.treatment_share*10000
              then 'treatment' else 'holdout' end
  from crm_experiments e
  join v_crm_action_queue q on q.play_code=e.play_code
  where e.id=p_experiment_id
  order by q.rank
  limit greatest(2,least(p_limit,400))
  on conflict do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function create_crm_assignments(text,integer,text,bigint) from public;
revoke all on function seed_crm_experiment(bigint,integer) from public;
grant execute on function create_crm_assignments(text,integer,text,bigint) to service_role;
grant execute on function seed_crm_experiment(bigint,integer) to service_role;
