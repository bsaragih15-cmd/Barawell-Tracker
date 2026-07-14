create or replace view v_growth_pulse with (security_invoker = true) as
select * from growth_insights
where status='open' and (expires_at is null or expires_at >= current_date)
order by priority_score desc, generated_at desc;

create or replace function refresh_growth_insights(p_as_of date default current_date)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_month date;
  v_prev date;
  v_count integer := 0;
begin
  select max(metric_month) into v_month from growth_monthly_metrics where is_complete;
  select max(metric_month) into v_prev from growth_monthly_metrics where is_complete and metric_month < v_month;

  insert into growth_insights(insight_key,generated_for,metric,insight_type,headline,narrative,actual_value,comparison_value,delta_value,delta_pct,driver_dimension,driver_member,affected_customers,confidence,business_impact,actionability,urgency,recommended_play,expires_at)
  select 'revenue_mom',p_as_of,'monthly_revenue','period_change',
         case when c.revenue >= p.revenue then 'Revenue grew versus the previous complete month' else 'Revenue fell versus the previous complete month' end,
         'The complete-month comparison separates underlying performance from the current partial month.',
         c.revenue,p.revenue,c.revenue-p.revenue,(c.revenue-p.revenue)/nullif(p.revenue,0),
         'month',to_char(c.metric_month,'Mon YYYY'),c.customers,0.95,5,4,4,
         case when c.revenue < p.revenue then 'refill_due' else null end,p_as_of+7
  from growth_monthly_metrics c join growth_monthly_metrics p on p.metric_month=v_prev
  where c.metric_month=v_month
  on conflict(insight_key,generated_for) do update set
    headline=excluded.headline,narrative=excluded.narrative,actual_value=excluded.actual_value,
    comparison_value=excluded.comparison_value,delta_value=excluded.delta_value,delta_pct=excluded.delta_pct,
    driver_member=excluded.driver_member,affected_customers=excluded.affected_customers,
    generated_at=now(),expires_at=excluded.expires_at;
  get diagnostics v_count = row_count;

  insert into growth_insights(insight_key,generated_for,metric,insight_type,headline,narrative,actual_value,comparison_value,delta_value,delta_pct,affected_customers,confidence,business_impact,actionability,urgency,recommended_play,expires_at)
  select 'repeat_rate_gap',p_as_of,'repeat_rate','goal_gap',
         'The second order remains the main commercial leak',
         'Repeat customers are a minority of the base but contribute a disproportionate share of revenue. Prioritize first-to-second-order conversion.',
         s.repeat_rate/100.0,t.target,(s.repeat_rate/100.0)-t.target,
         ((s.repeat_rate/100.0)-t.target)/nullif(t.target,0),s.one_and_done,
         0.98,5,5,5,'new_customer_conversion',p_as_of+14
  from v_segment_summary s join growth_metric_targets t on t.metric='repeat_rate'
  on conflict(insight_key,generated_for) do update set
    headline=excluded.headline,narrative=excluded.narrative,actual_value=excluded.actual_value,
    comparison_value=excluded.comparison_value,delta_value=excluded.delta_value,delta_pct=excluded.delta_pct,
    affected_customers=excluded.affected_customers,generated_at=now(),expires_at=excluded.expires_at;

  insert into growth_insights(insight_key,generated_for,metric,insight_type,headline,narrative,actual_value,affected_customers,confidence,business_impact,actionability,urgency,recommended_play,expires_at)
  select 'dormant_value',p_as_of,'dormant_customers','concentrated_opportunity',
         'Dormant Core and Whale customers hold the highest-value winback pool',
         'Prioritize winback by historical value rather than contacting the dormant base uniformly.',
         sum(customers),sum(customers),0.94,5,5,4,'winback_value',p_as_of+7
  from v_segment_matrix where lifecycle='Dormant' and value_tier in ('Core','Whale')
  on conflict(insight_key,generated_for) do update set
    headline=excluded.headline,narrative=excluded.narrative,actual_value=excluded.actual_value,
    affected_customers=excluded.affected_customers,generated_at=now(),expires_at=excluded.expires_at;

  insert into growth_insights(insight_key,generated_for,metric,insight_type,headline,narrative,actual_value,comparison_value,delta_value,affected_customers,confidence,business_impact,actionability,urgency,recommended_play,expires_at)
  select 'baralast_headroom',p_as_of,'baralast_attach','cross_sell_headroom',
         'Baralast remains the clearest low-penetration cross-sell',
         'Use approved education-led targeting for Sildenafil customers without Baralast rather than a broad promotion.',
         p.bara_buyers::numeric/nullif(p.customers,0),t.target,
         p.bara_buyers::numeric/nullif(p.customers,0)-t.target,p.bara_crosssell_targets,
         0.96,4,5,3,'cross_sell',p_as_of+14
  from v_product_mix p join growth_metric_targets t on t.metric='baralast_attach'
  on conflict(insight_key,generated_for) do update set
    headline=excluded.headline,narrative=excluded.narrative,actual_value=excluded.actual_value,
    comparison_value=excluded.comparison_value,delta_value=excluded.delta_value,
    affected_customers=excluded.affected_customers,generated_at=now(),expires_at=excluded.expires_at;

  insert into growth_insights(insight_key,generated_for,metric,insight_type,headline,narrative,actual_value,comparison_value,delta_value,driver_dimension,driver_member,affected_customers,confidence,business_impact,actionability,urgency,recommended_play,expires_at)
  select 'channel_concentration',p_as_of,'channel_share','concentrated_contribution',
         initcap(c.channel) || ' is the largest order channel',
         'Track channel concentration and compare retention quality, not only first-order volume.',
         c.orders::numeric/nullif(sum(c.orders) over(),0),0.50,
         c.orders::numeric/nullif(sum(c.orders) over(),0)-0.50,
         'channel',c.channel,c.customers,0.93,4,4,3,
         case when c.channel in ('shopee','tokopedia','tiktok') then 'channel_migrate' else null end,p_as_of+14
  from v_channel_mix c
  order by c.orders desc limit 1
  on conflict(insight_key,generated_for) do update set
    headline=excluded.headline,narrative=excluded.narrative,actual_value=excluded.actual_value,
    comparison_value=excluded.comparison_value,delta_value=excluded.delta_value,
    driver_dimension=excluded.driver_dimension,driver_member=excluded.driver_member,
    affected_customers=excluded.affected_customers,generated_at=now(),expires_at=excluded.expires_at;

  return v_count;
end;
$$;

grant select on v_growth_pulse to service_role;
revoke all on function refresh_growth_insights(date) from public;
grant execute on function refresh_growth_insights(date) to service_role;
