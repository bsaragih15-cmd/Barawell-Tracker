-- Public preview access for aggregate segmentation marts only.
-- The customer-level seg_action_queue remains private.

create policy anon_read_seg_summary on seg_summary for select to anon using (true);
create policy anon_read_seg_matrix on seg_matrix for select to anon using (true);
create policy anon_read_seg_funnel on seg_funnel for select to anon using (true);
create policy anon_read_seg_refill on seg_refill for select to anon using (true);
create policy anon_read_seg_channel on seg_channel_stat for select to anon using (true);
create policy anon_read_seg_product on seg_product for select to anon using (true);

grant select on seg_summary,seg_matrix,seg_funnel,seg_refill,seg_channel_stat,seg_product to anon;
grant select on v_segment_summary,v_segment_matrix,v_segment_funnel,v_refill_cohort,v_channel_mix,v_product_mix to anon;
