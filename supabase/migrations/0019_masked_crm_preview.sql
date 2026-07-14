-- Anonymized, read-only queue for public previews. It intentionally excludes
-- real names, cities, stable customer keys, assignments, activities, and experiments.

create or replace view v_crm_workspace_masked with (security_invoker = true) as
with q as (
  select queue play_code,rn source_rank,spend lifetime_revenue,orders_n order_count,
         recency_days,value_tier,lifecycle,reason
  from v_action_queue
  union all
  select 'new_customer_conversion',rn,spend,orders_n,recency_days,value_tier,lifecycle,
         'One-order customer approaching the evidence-based refill window.'
  from v_action_queue where queue='refill_due' and orders_n=1
), s as (
  select q.*,
    lifetime_revenue/nullif(order_count,0) aov,
    least(.95,greatest(.05,.58-abs(recency_days-57)::numeric/140+ln(1+order_count)::numeric/12+
      case value_tier when 'Whale' then .12 when 'Core' then .06 else 0 end)) reorder_propensity,
    least(.90,greatest(.02,case when order_count>=2 then .22 else .08 end+
      case value_tier when 'Whale' then .12 when 'Core' then .06 else 0 end)) cross_sell_propensity,
    least(.98,greatest(.02,(recency_days-35)::numeric/140+
      case when lifecycle='Dormant' then .25 when lifecycle='At-risk' then .12 else 0 end)) churn_risk,
    .25::numeric response_propensity
  from q
), a as (
  select s.*,
    case play_code
      when 'refill_due' then reorder_propensity
      when 'new_customer_conversion' then reorder_propensity*response_propensity
      when 'winback_value' then churn_risk*response_propensity
      when 'cross_sell' then cross_sell_propensity*response_propensity
      when 'aov_expand' then least(.95,.15+ln(1+order_count)::numeric/8)*response_propensity
      when 'channel_migrate' then least(.85,.10+order_count::numeric/15)*response_propensity
      else .10 end action_propensity
  from s
)
select play_code,source_rank,
  play_code||':'||source_rank::text customer_key,
  'Customer '||lpad(source_rank::text,4,'0') customer_name,
  null::text city,lifetime_revenue,order_count,recency_days,value_tier,lifecycle,reason,aov,
  reorder_propensity,cross_sell_propensity,churn_risk,response_propensity,action_propensity,
  aov*.55*action_propensity*.35 expected_incremental_value,
  100*action_propensity+least(20,lifetime_revenue/200000)+
    case value_tier when 'Whale' then 15 when 'Core' then 8 else 0 end priority_score,
  source_rank::bigint rank,null::bigint assignment_id,null::text assigned_to,
  null::text assignment_status,null::timestamptz due_at,null::timestamptz assignment_created_at
from a where source_rank<=80;

grant select on v_crm_workspace_masked to anon;
