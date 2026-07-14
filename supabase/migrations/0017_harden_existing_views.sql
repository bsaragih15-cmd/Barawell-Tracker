-- Harden legacy views and one legacy RPC that predate the Growth OS.
-- The underlying MVP tables retain their existing RLS policies, so switching
-- these views to security-invoker preserves intended access while removing
-- creator-role permission bypass.

alter view v_initiatives_scored set (security_invoker = true);
alter view v_coverage set (security_invoker = true);
alter view v_segment_summary set (security_invoker = true);
alter view v_segment_matrix set (security_invoker = true);
alter view v_segment_funnel set (security_invoker = true);
alter view v_refill_cohort set (security_invoker = true);
alter view v_channel_mix set (security_invoker = true);
alter view v_product_mix set (security_invoker = true);
alter view v_action_queue set (security_invoker = true);

revoke execute on function capture_coverage_snapshot() from public, anon, authenticated;
grant execute on function capture_coverage_snapshot() to service_role;
