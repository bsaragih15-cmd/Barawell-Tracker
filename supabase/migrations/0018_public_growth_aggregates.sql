-- Public preview access is limited to aggregate, non-PII Growth OS history.
-- CRM execution tables and experiments remain service-role only.

create policy anon_read_growth_monthly on growth_monthly_metrics for select to anon using (true);
create policy anon_read_growth_cohorts on growth_cohort_metrics for select to anon using (true);
create policy anon_read_growth_channels on growth_channel_monthly for select to anon using (true);
create policy anon_read_growth_products on growth_product_monthly for select to anon using (true);
create policy anon_read_growth_segments on growth_segment_monthly for select to anon using (true);
create policy anon_read_growth_movements on growth_segment_movement for select to anon using (true);
create policy anon_read_growth_targets on growth_metric_targets for select to anon using (true);
create policy anon_read_growth_insights on growth_insights for select to anon using (true);

grant select on growth_monthly_metrics,growth_cohort_metrics,growth_channel_monthly,
  growth_product_monthly,growth_segment_monthly,growth_segment_movement,
  growth_metric_targets,growth_insights to anon;

grant select on v_growth_monthly_performance,v_growth_cohorts,v_growth_channel_trend,
  v_growth_product_trend,v_growth_segment_history,v_growth_segment_movement,
  v_growth_scorecard,v_growth_pulse,v_growth_anomaly_history,
  v_growth_channel_drivers,v_growth_product_drivers to anon;
