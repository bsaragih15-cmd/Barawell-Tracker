create or replace view v_growth_monthly_performance with (security_invoker = true) as
select m.*,
       case when revenue > 0 then owned_orders::numeric / nullif(orders,0) else 0 end as owned_order_share,
       lag(revenue) over(order by metric_month) as prior_revenue,
       revenue - lag(revenue) over(order by metric_month) as revenue_change,
       repeat_rate - lag(repeat_rate) over(order by metric_month) as repeat_rate_change
from growth_monthly_metrics m;

create or replace view v_growth_cohorts with (security_invoker = true) as
select * from growth_cohort_metrics;

create or replace view v_growth_channel_trend with (security_invoker = true) as
select c.*,
       c.orders::numeric / nullif(sum(c.orders) over(partition by c.metric_month),0) as order_share,
       c.revenue / nullif(sum(c.revenue) over(partition by c.metric_month),0) as revenue_share
from growth_channel_monthly c;

create or replace view v_growth_product_trend with (security_invoker = true) as
select p.*,
       p.customers::numeric / nullif((select customers from growth_monthly_metrics m where m.metric_month=p.metric_month),0) as customer_penetration
from growth_product_monthly p;

create or replace view v_growth_segment_history with (security_invoker = true) as
select s.*,
       s.customers::numeric / nullif(sum(s.customers) over(partition by s.snapshot_month),0) as customer_share,
       s.revenue / nullif(sum(s.revenue) over(partition by s.snapshot_month),0) as revenue_share
from growth_segment_monthly s;

create or replace view v_growth_segment_movement with (security_invoker = true) as
select * from growth_segment_movement;

create or replace view v_growth_scorecard with (security_invoker = true) as
with ranked as (
  select m.*, row_number() over(order by metric_month desc) rn
  from growth_monthly_metrics m where is_complete
), cur as (select * from ranked where rn=1), prev as (select * from ranked where rn=2)
select cur.metric_month, cur.revenue, prev.revenue as prior_revenue,
       cur.revenue - prev.revenue as revenue_change,
       (cur.revenue - prev.revenue) / nullif(prev.revenue,0) as revenue_change_pct,
       cur.repeat_rate,
       cur.repeat_rate - prev.repeat_rate as repeat_rate_change,
       cur.repeat_revenue_share,
       cur.repeat_revenue_share - prev.repeat_revenue_share as repeat_revenue_share_change,
       cur.aov,
       cur.owned_orders::numeric / nullif(cur.orders,0) as owned_order_share,
       (select target from growth_metric_targets where metric='monthly_revenue') as revenue_target,
       (select target from growth_metric_targets where metric='repeat_rate') as repeat_rate_target
from cur cross join prev;

create or replace view v_customer_propensity with (security_invoker = true) as
with base as (
  select cust_key::text customer_key,
         max(name) customer_name,
         max(city) city,
         max(spend) lifetime_revenue,
         max(orders_n) order_count,
         max(recency_days) recency_days,
         max(value_tier) value_tier,
         max(lifecycle) lifecycle
  from v_action_queue
  group by cust_key
), acts as (
  select customer_key,
         count(*) filter(where outcome <> 'not_contacted') contacts,
         count(*) filter(where outcome in ('responded','interested','needs_consultation','follow_up_scheduled','ordered')) responses
  from crm_activities
  group by customer_key
)
select b.*,
       b.lifetime_revenue / nullif(b.order_count,0) as aov,
       least(0.95,greatest(0.05,
         0.58 - abs(b.recency_days-57)::numeric/140
         + ln(1+b.order_count)::numeric/12
         + case b.value_tier when 'Whale' then 0.12 when 'Core' then 0.06 else 0 end
       )) as reorder_propensity,
       least(0.90,greatest(0.02,
         case when b.order_count >= 2 then 0.22 else 0.08 end
         + case b.value_tier when 'Whale' then 0.12 when 'Core' then 0.06 else 0 end
       )) as cross_sell_propensity,
       least(0.98,greatest(0.02,
         (b.recency_days-35)::numeric/140
         + case when b.lifecycle='Dormant' then 0.25 when b.lifecycle='At-risk' then 0.12 else 0 end
       )) as churn_risk,
       coalesce(a.responses::numeric/nullif(a.contacts,0),0.25) as response_propensity
from base b left join acts a using(customer_key);

create or replace view v_crm_action_queue with (security_invoker = true) as
with queue_source as (
  select queue as play_code,rn as source_rank,cust_key::text customer_key,name customer_name,city,
         spend lifetime_revenue,orders_n order_count,recency_days,value_tier,lifecycle,reason
  from v_action_queue
  union all
  select 'new_customer_conversion',rn,cust_key::text,name,city,spend,orders_n,recency_days,
         value_tier,lifecycle,'One-order customer approaching the evidence-based refill window.'
  from v_action_queue
  where queue='refill_due' and orders_n=1
), scored as (
  select q.*,p.aov,p.reorder_propensity,p.cross_sell_propensity,p.churn_risk,p.response_propensity,
         case q.play_code
           when 'refill_due' then p.reorder_propensity
           when 'new_customer_conversion' then p.reorder_propensity * p.response_propensity
           when 'winback_value' then p.churn_risk * p.response_propensity
           when 'cross_sell' then p.cross_sell_propensity * p.response_propensity
           when 'aov_expand' then least(0.95,0.15 + ln(1+q.order_count)::numeric/8) * p.response_propensity
           when 'channel_migrate' then least(0.85,0.10 + q.order_count::numeric/15) * p.response_propensity
           else 0.10
         end as action_propensity
  from queue_source q join v_customer_propensity p using(customer_key)
), ranked as (
  select s.*,
         s.aov * 0.55 * s.action_propensity * 0.35 as expected_incremental_value,
         100*s.action_propensity + least(20,s.lifetime_revenue/200000)
           + case s.value_tier when 'Whale' then 15 when 'Core' then 8 else 0 end as priority_score,
         row_number() over(partition by s.play_code order by
           (100*s.action_propensity + least(20,s.lifetime_revenue/200000)
            + case s.value_tier when 'Whale' then 15 when 'Core' then 8 else 0 end) desc,
           s.lifetime_revenue desc,s.customer_key) as rank
  from scored s
)
select * from ranked where rank<=80;

create or replace view v_crm_workspace with (security_invoker = true) as
select q.*,
       a.id assignment_id,
       a.assigned_to,
       a.status assignment_status,
       a.due_at,
       a.created_at assignment_created_at
from v_crm_action_queue q
left join lateral (
  select x.* from crm_assignments x
  where x.customer_key=q.customer_key
    and x.play_code=q.play_code
    and x.status in ('open','in_progress','snoozed')
  order by x.created_at desc limit 1
) a on true;

create or replace view v_crm_play_effectiveness with (security_invoker = true) as
with activity as (
  select assignment_id,
         count(*) contacts,
         count(*) filter(where outcome in ('responded','interested','needs_consultation','follow_up_scheduled','ordered')) responses,
         count(*) filter(where outcome='ordered') ordered_outcomes
  from crm_activities group by assignment_id
), conv as (
  select assignment_id,count(*) conversions,
         sum(attributed_revenue) attributed_revenue,
         sum(attributed_gross_profit) attributed_gross_profit
  from crm_conversions group by assignment_id
)
select p.code play_code,p.name,
       count(a.id) assignments,
       coalesce(sum(ac.contacts),0) contacts,
       coalesce(sum(ac.responses),0) responses,
       coalesce(sum(cv.conversions),0) conversions,
       coalesce(sum(cv.attributed_revenue),0) attributed_revenue,
       coalesce(sum(cv.attributed_gross_profit),0) attributed_gross_profit,
       coalesce(sum(cv.conversions),0)::numeric/nullif(coalesce(sum(ac.contacts),0),0) as contact_to_order_rate
from crm_plays p
left join crm_assignments a on a.play_code=p.code
left join activity ac on ac.assignment_id=a.id
left join conv cv on cv.assignment_id=a.id
group by p.code,p.name,p.sort
order by p.sort;

create or replace view v_crm_experiment_readout with (security_invoker = true) as
with members as (
  select e.id,e.code,e.play_code,e.hypothesis,e.status,m.arm,m.customer_key
  from crm_experiments e left join crm_experiment_members m on m.experiment_id=e.id
), outcomes as (
  select a.experiment_id,a.customer_key,
         count(c.id) conversions,coalesce(sum(c.attributed_revenue),0) revenue
  from crm_assignments a left join crm_conversions c on c.assignment_id=a.id
  where a.experiment_id is not null
  group by a.experiment_id,a.customer_key
)
select m.id experiment_id,m.code,m.play_code,m.hypothesis,m.status,m.arm,
       count(m.customer_key) members,
       coalesce(sum(o.conversions),0) conversions,
       coalesce(sum(o.revenue),0) revenue,
       coalesce(sum(o.conversions),0)::numeric/nullif(count(m.customer_key),0) as conversion_rate
from members m
left join outcomes o on o.experiment_id=m.id and o.customer_key=m.customer_key
group by m.id,m.code,m.play_code,m.hypothesis,m.status,m.arm;

create or replace view v_growth_anomaly_history with (security_invoker = true) as
select m.*,
       avg(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) as expected_revenue,
       avg(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) - 2*stddev_samp(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) as expected_low,
       avg(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) + 2*stddev_samp(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) as expected_high,
       case when count(*) over(order by metric_month rows between 6 preceding and 1 preceding)>=3 and
         (revenue < avg(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) - 2*stddev_samp(revenue) over(order by metric_month rows between 6 preceding and 1 preceding)
          or revenue > avg(revenue) over(order by metric_month rows between 6 preceding and 1 preceding) + 2*stddev_samp(revenue) over(order by metric_month rows between 6 preceding and 1 preceding))
         then true else false end as is_anomaly
from growth_monthly_metrics m;

create or replace view v_growth_channel_drivers with (security_invoker = true) as
with months as (
  select metric_month,row_number() over(order by metric_month desc) rn from growth_monthly_metrics where is_complete
), cur as (select metric_month from months where rn=1), prev as (select metric_month from months where rn=2),
keys as (
  select channel from growth_channel_monthly where metric_month=(select metric_month from cur)
  union select channel from growth_channel_monthly where metric_month=(select metric_month from prev)
), vals as (
  select k.channel,coalesce(c.orders,0) current_orders,coalesce(p.orders,0) prior_orders,
         coalesce(c.revenue,0) current_revenue,coalesce(p.revenue,0) prior_revenue,
         coalesce(c.customers,0) current_customers,coalesce(p.customers,0) prior_customers,
         coalesce(c.channel_group,p.channel_group,'other') channel_group,
         (select metric_month from cur) current_month,(select metric_month from prev) prior_month
  from keys k
  left join growth_channel_monthly c on c.channel=k.channel and c.metric_month=(select metric_month from cur)
  left join growth_channel_monthly p on p.channel=k.channel and p.metric_month=(select metric_month from prev)
)
select *,current_orders-prior_orders as order_change,current_revenue-prior_revenue as revenue_change,
       (current_revenue-prior_revenue)/nullif(sum(current_revenue-prior_revenue) over(),0) as contribution_to_change
from vals;

create or replace view v_growth_product_drivers with (security_invoker = true) as
with months as (
  select metric_month,row_number() over(order by metric_month desc) rn from growth_monthly_metrics where is_complete
), cur as (select metric_month from months where rn=1), prev as (select metric_month from months where rn=2),
keys as (
  select product from growth_product_monthly where metric_month=(select metric_month from cur)
  union select product from growth_product_monthly where metric_month=(select metric_month from prev)
), vals as (
  select k.product,coalesce(c.orders,0) current_orders,coalesce(p.orders,0) prior_orders,
         coalesce(c.revenue,0) current_revenue,coalesce(p.revenue,0) prior_revenue,
         coalesce(c.customers,0) current_customers,coalesce(p.customers,0) prior_customers,
         (select metric_month from cur) current_month,(select metric_month from prev) prior_month
  from keys k
  left join growth_product_monthly c on c.product=k.product and c.metric_month=(select metric_month from cur)
  left join growth_product_monthly p on p.product=k.product and p.metric_month=(select metric_month from prev)
)
select *,current_orders-prior_orders as order_change,current_revenue-prior_revenue as revenue_change,
       (current_revenue-prior_revenue)/nullif(sum(current_revenue-prior_revenue) over(),0) as contribution_to_change
from vals;

grant select on v_growth_monthly_performance,v_growth_cohorts,v_growth_channel_trend,
  v_growth_product_trend,v_growth_segment_history,v_growth_segment_movement,v_growth_scorecard,
  v_customer_propensity,v_crm_action_queue,v_crm_workspace,v_crm_play_effectiveness,
  v_crm_experiment_readout,v_growth_anomaly_history,v_growth_channel_drivers,v_growth_product_drivers
  to service_role;
