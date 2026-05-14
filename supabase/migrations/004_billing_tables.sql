-- Subscription tiers (reference table)
create table subscription_tiers (
  id text primary key,
  name text not null,
  monthly_fee_pence integer not null,
  cover_fee_pence integer not null,
  features text[] default '{}'
);

insert into subscription_tiers (id, name, monthly_fee_pence, cover_fee_pence, features) values
(
  'free',
  'Free',
  0,
  150,
  array[
    'Deal listing on Get Grub',
    'Basic redemption count',
    'Reliability score display',
    '£1.50 per redeemed cover'
  ]
),
(
  'grow',
  'Grow',
  4900,
  100,
  array[
    'Everything in Free',
    'Full analytics dashboard',
    'AI feedback themes',
    'Monthly insight report',
    '£1.00 per redeemed cover'
  ]
),
(
  'pro',
  'Pro',
  9900,
  75,
  array[
    'Everything in Grow',
    'Featured placement in app',
    'Group dining visibility',
    'Priority support',
    '£0.75 per redeemed cover'
  ]
);

-- Restaurant billing records
create table restaurant_billing (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade unique,
  tier_id text references subscription_tiers(id) default 'free',
  is_in_free_period boolean default true,
  free_period_ends_at timestamptz default now() + interval '3 months',
  monthly_fee_pence integer default 0,
  cover_fee_pence integer default 150,
  billing_email text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Monthly invoices
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  tier_id text references subscription_tiers(id),
  period_start date not null,
  period_end date not null,
  covers_count integer default 0,
  cover_fees_pence integer default 0,
  subscription_fee_pence integer default 0,
  total_pence integer default 0,
  status text default 'draft',
  waived_reason text,
  created_at timestamptz default now()
);

-- Cover fee events
create table cover_fee_events (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id),
  claim_id uuid references claims(id),
  invoice_id uuid references invoices(id),
  covers integer not null,
  fee_per_cover_pence integer not null,
  total_fee_pence integer not null,
  period_month date not null,
  created_at timestamptz default now()
);
