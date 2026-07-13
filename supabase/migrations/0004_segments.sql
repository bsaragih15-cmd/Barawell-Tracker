-- 0004_segments.sql — customer Value × Lifecycle evidence layer
-- Additive and re-runnable. Frontend reads only v_segment_* contracts.

create table if not exists segment_customers (
  customer_id text primary key,
  name text not null,
  city text,
  first_order date not null,
  last_order date not null,
  order_count integer not null check (order_count > 0),
  lifetime_rp bigint not null check (lifetime_rp >= 0),
  total_boxes integer not null default 0,
  product_text text,
  primary_channel text,
  owned_orders integer not null default 0,
  marketplace_orders integer not null default 0,
  has_s50 boolean not null default false,
  has_s100 boolean not null default false,
  has_bara boolean not null default false,
  has_tada boolean not null default false,
  dataset_max_date date not null,
  recency_days integer generated always as (dataset_max_date - last_order) stored,
  value_tier text generated always as (
    case when lifetime_rp >= 2000000 then 'Whale'
         when lifetime_rp >= 400000 then 'Core'
         else 'Entry' end
  ) stored,
  lifecycle text generated always as (
    case when dataset_max_date - last_order > 90 then 'Dormant'
         when dataset_max_date - last_order between 46 and 90 then 'At-risk'
         when order_count >= 2 and dataset_max_date - last_order <= 45 then 'Active-repeat'
         when order_count = 1 and dataset_max_date - last_order <= 45 then 'New'
         else 'At-risk' end
  ) stored,
  loaded_at timestamptz not null default now()
);

create table if not exists segment_orders (
  order_id text primary key,
  customer_id text not null references segment_customers(customer_id) on delete cascade,
  order_date date not null,
  order_number integer not null,
  revenue_rp bigint not null default 0,
  boxes integer not null default 0,
  status text,
  channel text,
  channel_group text not null check (channel_group in ('owned','marketplace','other')),
  product_text text,
  has_s50 boolean not null default false,
  has_s100 boolean not null default false,
  has_bara boolean not null default false,
  has_tada boolean not null default false
);

create index if not exists ix_segment_customers_matrix on segment_customers(value_tier,lifecycle);
create index if not exists ix_segment_orders_customer_date on segment_orders(customer_id,order_date);
create index if not exists ix_segment_orders_channel on segment_orders(channel_group,channel);

alter table segment_customers enable row level security;
alter table segment_orders enable row level security;

drop policy if exists segment_customers_anon_read on segment_customers;
create policy segment_customers_anon_read on segment_customers for select to anon using (true);
drop policy if exists segment_orders_anon_read on segment_orders;
create policy segment_orders_anon_read on segment_orders for select to anon using (true);

grant select on segment_customers, segment_orders to anon, authenticated;

create or replace view v_segment_summary as
select
  count(*)::integer as customers,
  count(*) filter (where order_count >= 2)::integer as repeat_customers,
  round(100.0 * count(*) filter (where order_count >= 2) / nullif(count(*),0),1) as repeat_rate_pct,
  sum(lifetime_rp)::bigint as lifetime_revenue_rp,
  sum(lifetime_rp) filter (where order_count >= 2)::bigint as repeater_revenue_rp,
  round(100.0 * sum(lifetime_rp) filter (where order_count >= 2) / nullif(sum(lifetime_rp),0),1) as repeater_revenue_pct,
  count(*) filter (where lifecycle='Dormant')::integer as dormant_customers,
  round(100.0 * count(*) filter (where has_bara) / nullif(count(*),0),1) as bara_attach_pct,
  count(*) filter (where not has_bara and has_s50)::integer as bara_cross_sell_headroom,
  max(dataset_max_date) as dataset_max_date
from segment_customers;

create or replace view v_segment_matrix as
with tiers as (select unnest(array['Whale','Core','Entry']) value_tier),
life as (select unnest(array['New','Active-repeat','At-risk','Dormant']) lifecycle),
agg as (
 select value_tier,lifecycle,count(*)::integer customers,sum(lifetime_rp)::bigint revenue_rp,
        round(avg(lifetime_rp))::bigint avg_lifetime_rp
 from segment_customers group by 1,2)
select t.value_tier,l.lifecycle,coalesce(a.customers,0) customers,
       coalesce(a.revenue_rp,0) revenue_rp,coalesce(a.avg_lifetime_rp,0) avg_lifetime_rp
from tiers t cross join life l left join agg a using(value_tier,lifecycle);

create or replace view v_segment_funnel as
with b as (select count(*) acquired,
 count(*) filter(where order_count>=2) second_order,
 count(*) filter(where order_count>=3) third_plus,
 count(*) filter(where order_count>=5) fifth_plus from segment_customers)
select * from (values
 ('Acquired',1,(select acquired from b)),
 ('2nd order',2,(select second_order from b)),
 ('3rd+',3,(select third_plus from b)),
 ('5th+',4,(select fifth_plus from b))) v(stage,sort,customers);

create or replace view v_refill_cohort as
with gaps as (
 select customer_id,(order_date-lag(order_date) over(partition by customer_id order by order_date,order_number))::integer gap_days,
        row_number() over(partition by customer_id order by order_date,order_number) rn
 from segment_orders), first_gap as (select gap_days from gaps where rn=2 and gap_days>=0),
bins as (select generate_series(0,180,15) bin_start)
select b.bin_start,b.bin_start+14 bin_end,count(f.gap_days)::integer customers,
       percentile_cont(.5) within group(order by f.gap_days) over()::numeric(10,1) median_gap_days
from bins b left join first_gap f on f.gap_days between b.bin_start and b.bin_start+14
group by b.bin_start,f.gap_days order by b.bin_start;

create or replace view v_channel_mix as
select channel_group,coalesce(nullif(lower(channel),''),'unknown') channel,
 count(*)::integer orders,sum(revenue_rp)::bigint revenue_rp,
 round(100.0*count(*)/sum(count(*)) over(),1) order_share_pct
from segment_orders group by 1,2;

create or replace view v_product_mix as
select * from (values
 ('Sildenafil 50mg',(select count(*) from segment_customers where has_s50),(select count(*) from segment_customers where not has_s50)),
 ('Sildenafil 100mg',(select count(*) from segment_customers where has_s100),(select count(*) from segment_customers where has_s50 and not has_s100)),
 ('Baralast',(select count(*) from segment_customers where has_bara),(select count(*) from segment_customers where has_s50 and not has_bara)),
 ('Tadalafil',(select count(*) from segment_customers where has_tada),(select count(*) from segment_customers where not has_tada))
) p(product,adopters,cross_sell_headroom);

create or replace view v_action_queue as
with ranked as (
 select *,
 case
  when lifecycle in ('Active-repeat','At-risk') and recency_days between 35 and 60 then 'refill_due'
  when lifecycle in ('At-risk','Dormant') and value_tier in ('Whale','Core') then 'winback_value'
  when has_s50 and not has_bara then 'cross_sell'
  when order_count>=2 and lifetime_rp/order_count < 400000 then 'aov_expand'
  when marketplace_orders>owned_orders then 'channel_migrate'
 end play,
 row_number() over(partition by
 case
  when lifecycle in ('Active-repeat','At-risk') and recency_days between 35 and 60 then 'refill_due'
  when lifecycle in ('At-risk','Dormant') and value_tier in ('Whale','Core') then 'winback_value'
  when has_s50 and not has_bara then 'cross_sell'
  when order_count>=2 and lifetime_rp/order_count < 400000 then 'aov_expand'
  when marketplace_orders>owned_orders then 'channel_migrate'
 end order by lifetime_rp desc,recency_days asc,customer_id) rank
 from segment_customers)
select play,rank,customer_id,name,city,value_tier,lifecycle,recency_days,order_count,lifetime_rp,
       round(lifetime_rp/nullif(order_count,0))::bigint aov_rp,primary_channel,
       has_s50,has_s100,has_bara,has_tada
from ranked where play is not null and rank<=80;

grant select on v_segment_summary,v_segment_matrix,v_segment_funnel,v_refill_cohort,
 v_channel_mix,v_product_mix,v_action_queue to anon,authenticated;
