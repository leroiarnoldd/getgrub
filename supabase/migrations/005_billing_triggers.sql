-- Auto-create billing record for new restaurants
create or replace function handle_new_restaurant()
returns trigger as $$
begin
  insert into restaurant_billing (restaurant_id, tier_id, is_in_free_period)
  values (new.id, 'free', true);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_restaurant_created
  after insert on restaurants
  for each row execute function handle_new_restaurant();

-- Record a cover fee event when a claim is redeemed
create or replace function record_cover_fee()
returns trigger as $$
declare
  billing restaurant_billing%rowtype;
  period_start date;
begin
  if new.status != 'redeemed' or old.status = 'redeemed' then
    return new;
  end if;

  select * into billing
  from restaurant_billing
  where restaurant_id = new.restaurant_id;

  if billing.is_in_free_period and now() < billing.free_period_ends_at then
    return new;
  end if;

  if billing.is_in_free_period and now() >= billing.free_period_ends_at then
    update restaurant_billing
    set is_in_free_period = false, updated_at = now()
    where restaurant_id = new.restaurant_id;
  end if;

  period_start := date_trunc('month', now())::date;

  insert into cover_fee_events (
    restaurant_id,
    claim_id,
    covers,
    fee_per_cover_pence,
    total_fee_pence,
    period_month
  ) values (
    new.restaurant_id,
    new.id,
    coalesce(new.party_size, 1),
    billing.cover_fee_pence,
    coalesce(new.party_size, 1) * billing.cover_fee_pence,
    period_start
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_claim_redeemed_billing
  after update of status on claims
  for each row execute function record_cover_fee();

-- RLS for billing tables
alter table restaurant_billing enable row level security;
create policy "Owners view own billing"
  on restaurant_billing for select
  using (
    exists (
      select 1 from restaurants r
      where r.id = restaurant_billing.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

alter table invoices enable row level security;
create policy "Owners view own invoices"
  on invoices for select
  using (
    exists (
      select 1 from restaurants r
      where r.id = invoices.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

alter table cover_fee_events enable row level security;
create policy "Owners view own cover fees"
  on cover_fee_events for select
  using (
    exists (
      select 1 from restaurants r
      where r.id = cover_fee_events.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

-- Helper view: current month billing summary
create view restaurant_billing_summary as
select
  rb.restaurant_id,
  r.name as restaurant_name,
  st.name as tier_name,
  st.monthly_fee_pence,
  st.cover_fee_pence,
  rb.is_in_free_period,
  rb.free_period_ends_at,
  coalesce(sum(cfe.covers), 0) as covers_this_month,
  coalesce(sum(cfe.total_fee_pence), 0) as cover_fees_this_month_pence,
  case
    when rb.is_in_free_period and now() < rb.free_period_ends_at
    then 0
    else coalesce(sum(cfe.total_fee_pence), 0) + st.monthly_fee_pence
  end as estimated_bill_this_month_pence
from restaurant_billing rb
join restaurants r on r.id = rb.restaurant_id
join subscription_tiers st on st.id = rb.tier_id
left join cover_fee_events cfe
  on cfe.restaurant_id = rb.restaurant_id
  and cfe.period_month = date_trunc('month', now())::date
group by rb.restaurant_id, r.name, st.name, st.monthly_fee_pence,
         st.cover_fee_pence, rb.is_in_free_period, rb.free_period_ends_at;
