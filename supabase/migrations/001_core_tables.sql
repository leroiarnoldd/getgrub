create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Cities
create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  active boolean default true,
  created_at timestamptz default now()
);

insert into cities (name, slug) values
  ('Milton Keynes', 'milton-keynes'),
  ('Manchester',    'manchester'),
  ('Bristol',       'bristol'),
  ('Birmingham',    'birmingham'),
  ('Leeds',         'leeds');

-- Restaurants
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete set null,
  city_id uuid references cities(id),
  name text not null,
  slug text not null unique,
  description text,
  cuisine_tags text[] default '{}',
  dietary_tags text[] default '{}',
  vibe_tags text[] default '{}',
  address text,
  postcode text,
  lat numeric(9,6),
  lng numeric(9,6),
  phone text,
  website text,
  cover_image_url text,
  gallery_urls text[] default '{}',
  average_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  reliability_score integer default 100,
  is_verified boolean default false,
  is_active boolean default true,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deals
create table deals (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  title text not null,
  description text,
  discount_percent integer not null,
  discount_applies_to text default 'total_bill',
  includes_drinks boolean default true,
  min_spend numeric(8,2),
  max_party_size integer,
  deal_type text default 'dine_in',
  valid_days text[] default '{}',
  valid_from time,
  valid_until time,
  active_from date,
  active_until date,
  max_daily_claims integer,
  claims_today integer default 0,
  total_claims integer default 0,
  successful_redemptions integer default 0,
  failed_redemptions integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User profiles
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  city_id uuid references cities(id),
  dietary_tags text[] default '{}',
  allergy_tags text[] default '{}',
  vibe_preferences text[] default '{}',
  budget_max_per_head integer default 50,
  total_saved numeric(10,2) default 0,
  total_redemptions integer default 0,
  expo_push_token text,
  push_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Claims
create table claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  restaurant_id uuid references restaurants(id),
  status text default 'claimed',
  voucher_code text unique default upper(substring(md5(random()::text), 1, 8)),
  claimed_at timestamptz default now(),
  redeemed_at timestamptz,
  expires_at timestamptz default now() + interval '24 hours',
  party_size integer default 2,
  estimated_bill numeric(8,2),
  actual_bill numeric(8,2),
  amount_saved numeric(8,2),
  feedback_submitted boolean default false
);

-- Feedback
create table feedback (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid references claims(id) on delete cascade,
  user_id uuid references auth.users(id),
  restaurant_id uuid references restaurants(id),
  deal_id uuid references deals(id),
  food_rating integer check (food_rating between 1 and 5),
  vibe_rating integer check (vibe_rating between 1 and 5),
  value_rating integer check (value_rating between 1 and 5),
  freetext text,
  ai_themes text[] default '{}',
  ai_sentiment text,
  would_return boolean,
  created_at timestamptz default now()
);

-- Saved deals
create table saved_deals (
  user_id uuid references auth.users(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, deal_id)
);
