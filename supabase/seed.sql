insert into restaurants (name, slug, city_id, description, cuisine_tags, dietary_tags, vibe_tags, address, postcode, lat, lng, reliability_score, is_verified, is_active)
values
(
  'The Hourglass',
  'the-hourglass-mk',
  (select id from cities where slug = 'milton-keynes'),
  'Modern British gastropub with seasonal menus and great local ales.',
  array['british','gastropub','burgers'],
  array['vegetarian-options','gluten-free-options'],
  array['casual','date-night','group-friendly'],
  '12 Midsummer Boulevard, Milton Keynes', 'MK9 3BP',
  52.040623, -0.759417, 94, true, true
),
(
  'Spice Garden',
  'spice-garden-mk',
  (select id from cities where slug = 'milton-keynes'),
  'Authentic Bangladeshi and Indian cuisine in the heart of MK.',
  array['indian','bangladeshi','curry'],
  array['halal','vegan-options','vegetarian-options'],
  array['casual','family-friendly','group-friendly'],
  '45 Grafton Gate, Milton Keynes', 'MK9 1AN',
  52.041800, -0.758200, 88, true, true
),
(
  'Lola''s Kitchen',
  'lolas-kitchen-mk',
  (select id from cities where slug = 'milton-keynes'),
  'Plant-based café and restaurant with creative seasonal dishes.',
  array['vegan','vegetarian','cafe'],
  array['vegan','vegetarian','gluten-free-options'],
  array['casual','quiet','date-night'],
  '8 Silbury Boulevard, Milton Keynes', 'MK9 3AH',
  52.039500, -0.760100, 97, true, true
);

insert into deals (restaurant_id, title, description, discount_percent, includes_drinks, deal_type, valid_days, valid_from, valid_until, is_active)
values
(
  (select id from restaurants where slug = 'the-hourglass-mk'),
  '30% off total bill',
  'Monday to Thursday lunchtime. Includes drinks. No minimum spend.',
  30, true, 'dine_in',
  array['monday','tuesday','wednesday','thursday'],
  '12:00', '17:00', true
),
(
  (select id from restaurants where slug = 'spice-garden-mk'),
  '40% off food',
  'Sunday to Thursday evenings. Dine-in only.',
  40, false, 'dine_in',
  array['sunday','monday','tuesday','wednesday','thursday'],
  '17:00', '22:00', true
),
(
  (select id from restaurants where slug = 'lolas-kitchen-mk'),
  '25% off total bill',
  'Any day, any time. Includes drinks and dessert.',
  25, true, 'both',
  array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  '09:00', '21:00', true
);

-- Dev slots: an early-bird and a late window for each active deal over the next 7 days
insert into deal_slots (deal_id, restaurant_id, starts_at, ends_at, total_covers)
select d.id, d.restaurant_id,
       (current_date + i)::timestamp + time '17:00',
       (current_date + i)::timestamp + time '18:30',
       12
from deals d, generate_series(0, 6) as i
where d.is_active;

insert into deal_slots (deal_id, restaurant_id, starts_at, ends_at, total_covers, discount_percent)
select d.id, d.restaurant_id,
       (current_date + i)::timestamp + time '20:30',
       (current_date + i)::timestamp + time '22:00',
       8,
       least(50, d.discount_percent + 10)
from deals d, generate_series(0, 6) as i
where d.is_active;
