alter table restaurants enable row level security;
create policy "Public read active restaurants"
  on restaurants for select using (is_active = true);
create policy "Owners manage restaurant"
  on restaurants for all using (auth.uid() = owner_id);

alter table deals enable row level security;
create policy "Public read active deals"
  on deals for select using (is_active = true);
create policy "Restaurant owners manage deals"
  on deals for all using (
    exists (
      select 1 from restaurants r
      where r.id = deals.restaurant_id
      and r.owner_id = auth.uid()
    )
  );

alter table claims enable row level security;
create policy "Users manage own claims"
  on claims for all using (auth.uid() = user_id);

alter table feedback enable row level security;
create policy "Users manage own feedback"
  on feedback for all using (auth.uid() = user_id);

alter table user_profiles enable row level security;
create policy "Users manage own profile"
  on user_profiles for all using (auth.uid() = id);
create policy "Public read profiles"
  on user_profiles for select using (true);

alter table saved_deals enable row level security;
create policy "Users manage own saved deals"
  on saved_deals for all using (auth.uid() = user_id);
