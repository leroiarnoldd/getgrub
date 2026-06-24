-- Housekeeping: expire stale bookings and close finished slots.
-- Expiring a 'claimed' booking fires the existing triggers, which release the
-- held covers back to the slot and update the venue's reliability score.

create or replace function public.expire_stale()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update claims set status = 'expired'
  where status = 'claimed' and expires_at < now();

  update deal_slots set status = 'closed', updated_at = now()
  where status in ('open', 'paused') and ends_at < now();
end;
$$;

-- Schedule it every 15 minutes if pg_cron is available; skip quietly otherwise
-- (you can enable pg_cron in the Supabase dashboard and re-run this block).
do $$
begin
  perform cron.schedule('getgrub-expire-stale', '*/15 * * * *', $cron$ select public.expire_stale(); $cron$);
exception when others then
  raise notice 'pg_cron not enabled; enable it and re-run, or call expire_stale() on a schedule.';
end $$;

-- Clean current state immediately.
select public.expire_stale();
