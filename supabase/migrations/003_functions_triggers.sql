-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Recalculate reliability score
create or replace function recalculate_reliability_score()
returns trigger as $$
declare
  total_attempts integer;
  successful integer;
  new_score integer;
begin
  select
    count(*) filter (where status in ('redeemed','expired','cancelled')),
    count(*) filter (where status = 'redeemed')
  into total_attempts, successful
  from claims
  where restaurant_id = new.restaurant_id;

  new_score := case
    when total_attempts = 0 then 100
    else least(100, greatest(0, round((successful::numeric / total_attempts) * 100)))
  end;

  update restaurants
  set reliability_score = new_score, updated_at = now()
  where id = new.restaurant_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_claim_status_change
  after update of status on claims
  for each row execute function recalculate_reliability_score();

-- Increment claim counts
create or replace function increment_claim_count()
returns trigger as $$
begin
  update deals
  set claims_today = claims_today + 1, total_claims = total_claims + 1
  where id = new.deal_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_deal_claimed
  after insert on claims
  for each row execute function increment_claim_count();

-- Update user savings on redemption
create or replace function update_user_savings()
returns trigger as $$
begin
  if new.status = 'redeemed' and old.status != 'redeemed' then
    update user_profiles
    set
      total_saved = total_saved + coalesce(new.amount_saved, 0),
      total_redemptions = total_redemptions + 1,
      updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_claim_redeemed
  after update of status on claims
  for each row execute function update_user_savings();

-- Vector similarity search
create or replace function search_restaurants_by_embedding(
  query_embedding vector(1536),
  city_slug text,
  match_count int default 10,
  dietary_filter text[] default '{}'
)
returns table (id uuid, name text, similarity float) as $$
begin
  return query
  select
    r.id,
    r.name,
    1 - (r.embedding <=> query_embedding) as similarity
  from restaurants r
  join cities c on r.city_id = c.id
  where
    c.slug = city_slug
    and r.is_active = true
    and r.embedding is not null
    and (array_length(dietary_filter, 1) is null or r.dietary_tags && dietary_filter)
  order by r.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql;
