-- Restaurant-side redemption: staff mark a booking as used, which records the
-- bill, computes the saving, and (via existing triggers) updates the diner's
-- lifetime savings and the venue's reliability score.

-- Let venue owners see the bookings made against their restaurant.
drop policy if exists "Owners read restaurant claims" on claims;
create policy "Owners read restaurant claims"
  on claims for select using (
    exists (
      select 1 from restaurants r
      where r.id = claims.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

-- Redeem a voucher. Verifies the caller owns the venue, computes the saving
-- from the slot's discount (or the deal's), and marks the claim redeemed.
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
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_claim from claims
  where upper(voucher_code) = upper(trim(p_voucher_code));

  if v_claim.id is null then
    raise exception 'CLAIM_NOT_FOUND';
  end if;

  if not exists (
    select 1 from restaurants r
    where r.id = v_claim.restaurant_id and r.owner_id = auth.uid()
  ) then
    raise exception 'NOT_YOUR_VENUE';
  end if;

  if v_claim.status = 'redeemed' then
    raise exception 'ALREADY_REDEEMED';
  end if;
  if v_claim.status <> 'claimed' then
    raise exception 'CLAIM_NOT_ACTIVE';
  end if;

  -- Prefer the slot's discount override, else the deal's discount.
  select coalesce(s.discount_percent, d.discount_percent)
  into v_discount
  from deals d
  left join deal_slots s on s.id = v_claim.slot_id
  where d.id = v_claim.deal_id;

  v_saved := round(coalesce(p_actual_bill, 0) * coalesce(v_discount, 0) / 100.0, 2);

  update claims set
    status = 'redeemed',
    redeemed_at = now(),
    actual_bill = p_actual_bill,
    amount_saved = v_saved
  where id = v_claim.id
  returning * into v_claim;

  return v_claim;
end;
$$;

grant execute on function public.redeem_claim(text, numeric) to authenticated;
