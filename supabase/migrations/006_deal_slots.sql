-- Bookable, capacity-limited deal slots
-- A slot is a restaurant-defined window: "fill N covers between start and end at X% off".
-- Booking is done via the book_slot() RPC, which reserves covers atomically.

create table deal_slots (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references deals(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  discount_percent integer, -- overrides the deal's discount when set
  total_covers integer not null check (total_covers > 0),
  booked_covers integer not null default 0,
  status text not null default 'open' check (status in ('open', 'paused', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (ends_at > starts_at),
  check (booked_covers >= 0 and booked_covers <= total_covers),
  unique (deal_id, starts_at)
);

create index deal_slots_deal_time_idx on deal_slots (deal_id, starts_at);
create index deal_slots_restaurant_time_idx on deal_slots (restaurant_id, starts_at);

-- Claims made against a slot reserve covers from it
alter table claims add column slot_id uuid references deal_slots(id) on delete set null;
create index claims_slot_idx on claims (slot_id);

alter table deal_slots enable row level security;
create policy "Public read open slots"
  on deal_slots for select using (status = 'open');
create policy "Owners manage slots"
  on deal_slots for all using (
    exists (
      select 1 from restaurants r
      where r.id = deal_slots.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

-- Atomically reserve covers and create the claim.
-- The conditional update is the concurrency guard: two simultaneous bookings
-- for the last covers serialize on the row lock and the loser matches zero rows.
create or replace function book_slot(p_slot_id uuid, p_party_size integer)
returns claims as $$
declare
  v_slot deal_slots;
  v_claim claims;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if p_party_size < 1 or p_party_size > 20 then
    raise exception 'INVALID_PARTY_SIZE';
  end if;

  update deal_slots
  set booked_covers = booked_covers + p_party_size, updated_at = now()
  where id = p_slot_id
    and status = 'open'
    and ends_at > now()
    and booked_covers + p_party_size <= total_covers
  returning * into v_slot;

  if v_slot.id is null then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  insert into claims (user_id, deal_id, restaurant_id, slot_id, party_size, status, expires_at)
  values (auth.uid(), v_slot.deal_id, v_slot.restaurant_id, v_slot.id, p_party_size, 'claimed', v_slot.ends_at)
  returning * into v_claim;

  return v_claim;
end;
$$ language plpgsql security definer;

grant execute on function book_slot(uuid, integer) to authenticated;

-- Return covers to the slot when a booking is cancelled or expires unused
create or replace function release_slot_covers()
returns trigger as $$
begin
  if new.slot_id is not null
     and old.status = 'claimed'
     and new.status in ('cancelled', 'expired') then
    update deal_slots
    set booked_covers = greatest(0, booked_covers - new.party_size), updated_at = now()
    where id = new.slot_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_claim_released
  after update of status on claims
  for each row execute function release_slot_covers();
