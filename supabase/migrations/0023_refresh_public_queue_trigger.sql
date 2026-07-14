create or replace function trg_refresh_growth_public_queue()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  perform refresh_growth_public_queue();
  return null;
end;
$$;

drop trigger if exists seg_action_queue_refresh_public on seg_action_queue;
create trigger seg_action_queue_refresh_public
after insert or update or delete or truncate on seg_action_queue
for each statement execute function trg_refresh_growth_public_queue();
