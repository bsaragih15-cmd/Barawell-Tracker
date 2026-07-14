-- Separate anonymized queue snapshot for public previews. The table stores no
-- customer names, cities, contact details, or stable customer identifiers.

create table if not exists growth_public_queue (
  play_code text not null,
  source_rank integer not null,
  lifetime_revenue numeric not null,
  order_count integer not null,
  recency_days integer not null,
  value_tier text not null,
  lifecycle text not null,
  reason text not null,
  refreshed_at timestamptz not null default now(),
  primary key(play_code,source_rank)
);

alter table growth_public_queue enable row level security;
create policy anon_read_growth_public_queue on growth_public_queue for select to anon using (true);
grant select on growth_public_queue to anon;
grant select,insert,update,delete on growth_public_queue to service_role;

create or replace function refresh_growth_public_queue()
returns integer
language plpgsql
security invoker
set search_path=public
as $$
declare v_count integer;
begin
  insert into growth_public_queue(
    play_code,source_rank,lifetime_revenue,order_count,recency_days,
    value_tier,lifecycle,reason,refreshed_at
  )
  select queue,rn,spend,orders_n,recency_days,value_tier,lifecycle,reason,now()
  from v_action_queue
  union all
  select 'new_customer_conversion',rn,spend,orders_n,recency_days,value_tier,lifecycle,
         'One-order customer approaching the evidence-based refill window.',now()
  from v_action_queue
  where queue='refill_due' and orders_n=1
  on conflict(play_code,source_rank) do update set
    lifetime_revenue=excluded.lifetime_revenue,
    order_count=excluded.order_count,
    recency_days=excluded.recency_days,
    value_tier=excluded.value_tier,
    lifecycle=excluded.lifecycle,
    reason=excluded.reason,
    refreshed_at=excluded.refreshed_at;
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;

revoke all on function refresh_growth_public_queue() from public,anon,authenticated;
grant execute on function refresh_growth_public_queue() to service_role;

select refresh_growth_public_queue();

create or replace view v_crm_workspace_masked with (security_invoker = true) as
select play_code,source_rank,
       play_code||':'||source_rank::text as customer_key,
       'Customer '||lpad(source_rank::text,4,'0') as customer_name,
       null::text as city,
       lifetime_revenue,order_count,recency_days,value_tier,lifecycle,reason,
       lifetime_revenue/nullif(order_count,0) as aov,
       0.25::numeric as reorder_propensity,
       0.20::numeric as cross_sell_propensity,
       least(0.98,greatest(0.02,(recency_days-35)::numeric/140)) as churn_risk,
       0.25::numeric as response_propensity,
       0.20::numeric as action_propensity,
       (lifetime_revenue/nullif(order_count,0))*0.55*0.20*0.35 as expected_incremental_value,
       20+least(20,lifetime_revenue/200000) as priority_score,
       source_rank::bigint as rank,
       null::bigint as assignment_id,
       null::text as assigned_to,
       null::text as assignment_status,
       null::timestamptz as due_at,
       null::timestamptz as assignment_created_at
from growth_public_queue
where source_rank<=80;

grant select on v_crm_workspace_masked to anon;
