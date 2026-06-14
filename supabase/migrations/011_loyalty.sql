-- Loyalty: diners earn in-app credit when they redeem, which pulls them back.
-- Escrowed value is the retention mechanic this market converges on.

alter table user_profiles add column if not exists credit_balance numeric(10,2) default 0;

create table if not exists loyalty_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric(8,2) not null,
  reason text not null,
  claim_id uuid references claims(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists loyalty_ledger_user_idx on loyalty_ledger (user_id, created_at desc);

alter table loyalty_ledger enable row level security;
drop policy if exists "Users read own ledger" on loyalty_ledger;
create policy "Users read own ledger"
  on loyalty_ledger for select using (auth.uid() = user_id);

-- Redeem a voucher: records the bill, computes the saving, marks redeemed, and
-- awards the diner 10% of their saving as credit.
create or replace function public.redeem_claim(p_voucher_code text, p_actual_bill numeric)
returns claims
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim claims;
  v_discount integer;
  v_saved numeric(8,2);
  v_credit numeric(8,2);
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into v_claim from claims
  where upper(voucher_code) = upper(trim(p_voucher_code));
  if v_claim.id is null then raise exception 'CLAIM_NOT_FOUND'; end if;

  if not exists (
    select 1 from restaurants r
    where r.id = v_claim.restaurant_id and r.owner_id = auth.uid()
  ) then raise exception 'NOT_YOUR_VENUE'; end if;

  if v_claim.status = 'redeemed' then raise exception 'ALREADY_REDEEMED'; end if;
  if v_claim.status <> 'claimed' then raise exception 'CLAIM_NOT_ACTIVE'; end if;

  select coalesce(s.discount_percent, d.discount_percent) into v_discount
  from deals d left join deal_slots s on s.id = v_claim.slot_id
  where d.id = v_claim.deal_id;

  v_saved := round(coalesce(p_actual_bill, 0) * coalesce(v_discount, 0) / 100.0, 2);
  v_credit := round(v_saved * 0.10, 2);

  update claims set
    status = 'redeemed', redeemed_at = now(),
    actual_bill = p_actual_bill, amount_saved = v_saved
  where id = v_claim.id
  returning * into v_claim;

  if v_credit > 0 then
    insert into loyalty_ledger (user_id, amount, reason, claim_id)
    values (v_claim.user_id, v_credit, 'Earned on redemption', v_claim.id);
    update user_profiles
      set credit_balance = coalesce(credit_balance, 0) + v_credit, updated_at = now()
      where id = v_claim.user_id;
  end if;

  return v_claim;
end;
$$;

grant execute on function public.redeem_claim(text, numeric) to authenticated;
