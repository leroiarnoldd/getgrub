-- Richer Milton Keynes demo dataset — additive (new slugs), safe to run once.
-- Adds venues with cover images, a deal each, and a week of bookable slots so
-- the app looks like a real product for demos.

insert into restaurants (name, slug, city_id, description, cuisine_tags, dietary_tags, vibe_tags, address, postcode, lat, lng, cover_image_url, reliability_score, is_verified, is_active)
values
('Olio & Grano', 'olio-grano-mk', (select id from cities where slug='milton-keynes'),
 'Handmade pasta and wood-fired Neapolitan pizza in a buzzy trattoria.',
 array['italian','pizza','pasta'], array['vegetarian-options'], array['date-night','group-friendly','casual'],
 'The Hub, 800 Avebury Boulevard, Milton Keynes', 'MK9 3DT', 52.038900, -0.762300,
 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=60', 96, true, true),

('Bao & Bun', 'bao-bun-mk', (select id from cities where slug='milton-keynes'),
 'Taiwanese street food, fluffy bao and bubble tea.',
 array['asian','taiwanese','street-food'], array['vegan-options','vegetarian-options'], array['casual','quick-bite'],
 '5 Midsummer Arcade, Milton Keynes', 'MK9 3BB', 52.041100, -0.757800,
 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=60', 91, true, true),

('The Copper Pot', 'copper-pot-mk', (select id from cities where slug='milton-keynes'),
 'Cosy bistro doing seasonal British plates and Sunday roasts.',
 array['british','bistro'], array['gluten-free-options','vegetarian-options'], array['date-night','cosy'],
 '22 Newport Road, Milton Keynes', 'MK16 8NW', 52.078400, -0.722100,
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=60', 89, true, true),

('Saffron Lounge', 'saffron-lounge-mk', (select id from cities where slug='milton-keynes'),
 'Contemporary Indian dining with a tandoor and craft cocktails.',
 array['indian','curry'], array['halal','vegan-options','vegetarian-options'], array['date-night','group-friendly'],
 '14 Savoy Crescent, Milton Keynes', 'MK9 3PU', 52.040200, -0.764500,
 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=60', 93, true, true),

('Smoke & Char', 'smoke-char-mk', (select id from cities where slug='milton-keynes'),
 'Low-and-slow BBQ, burgers and bourbon.',
 array['american','bbq','burgers'], array['gluten-free-options'], array['group-friendly','casual'],
 '3 Lower Twelfth Street, Milton Keynes', 'MK9 1FA', 52.043500, -0.753900,
 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=60', 87, true, true),

('Verde', 'verde-mk', (select id from cities where slug='milton-keynes'),
 'Plant-based kitchen — bowls, mezze and natural wine.',
 array['vegan','healthy','mediterranean'], array['vegan-options','vegetarian-options','gluten-free-options'], array['casual','date-night'],
 '9 Secklow Gate, Milton Keynes', 'MK9 3GB', 52.042700, -0.758200,
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60', 90, true, true),

('Hokkaido Kitchen', 'hokkaido-kitchen-mk', (select id from cities where slug='milton-keynes'),
 'Ramen, donburi and fresh sushi rolls.',
 array['japanese','ramen','sushi'], array['vegetarian-options'], array['quick-bite','casual'],
 '18 Crown Walk, Milton Keynes', 'MK9 3AB', 52.039600, -0.760900,
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=60', 88, true, true),

('The Wharf Tavern', 'wharf-tavern-mk', (select id from cities where slug='milton-keynes'),
 'Canalside pub with stone-baked pizzas and a big terrace.',
 array['british','pub','pizza'], array['vegetarian-options'], array['group-friendly','casual','outdoor'],
 'Campbell Park Wharf, Milton Keynes', 'MK9 4AD', 52.037200, -0.751400,
 'https://images.unsplash.com/photo-1538488881038-e252a119ace7?auto=format&fit=crop&w=800&q=60', 85, true, true);

-- One deal per new venue
insert into deals (restaurant_id, title, description, discount_percent, includes_drinks, deal_type, valid_days, valid_from, valid_until, is_active)
values
((select id from restaurants where slug='olio-grano-mk'), '35% off food', 'Sun–Thu. Includes pizza and pasta.', 35, false, 'dine_in', array['sunday','monday','tuesday','wednesday','thursday'], '17:00','22:00', true),
((select id from restaurants where slug='bao-bun-mk'), '30% off total bill', 'Any day, lunch & early evening.', 30, true, 'both', array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], '11:30','19:00', true),
((select id from restaurants where slug='copper-pot-mk'), '40% off food', 'Mon–Wed evenings.', 40, false, 'dine_in', array['monday','tuesday','wednesday'], '17:30','21:30', true),
((select id from restaurants where slug='saffron-lounge-mk'), '30% off total bill', 'Sun–Thu. Includes drinks.', 30, true, 'dine_in', array['sunday','monday','tuesday','wednesday','thursday'], '17:00','22:30', true),
((select id from restaurants where slug='smoke-char-mk'), '25% off total bill', 'Any day. Drinks included.', 25, true, 'both', array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], '12:00','21:00', true),
((select id from restaurants where slug='verde-mk'), '35% off food', 'Mon–Fri lunch & dinner.', 35, false, 'dine_in', array['monday','tuesday','wednesday','thursday','friday'], '12:00','21:00', true),
((select id from restaurants where slug='hokkaido-kitchen-mk'), '30% off food', 'Sun–Thu.', 30, false, 'dine_in', array['sunday','monday','tuesday','wednesday','thursday'], '12:00','21:00', true),
((select id from restaurants where slug='wharf-tavern-mk'), '50% off pizza', 'Mon–Wed. Stone-baked pizzas half price.', 50, false, 'dine_in', array['monday','tuesday','wednesday'], '16:00','21:00', true);

-- Bookable slots for the new deals: an early-bird and a boosted late window, 7 days out
insert into deal_slots (deal_id, restaurant_id, starts_at, ends_at, total_covers)
select d.id, d.restaurant_id,
       (current_date + i)::timestamp + time '17:00',
       (current_date + i)::timestamp + time '18:30', 12
from deals d, generate_series(0,6) as i
where d.restaurant_id in (select id from restaurants where slug in
  ('olio-grano-mk','bao-bun-mk','copper-pot-mk','saffron-lounge-mk','smoke-char-mk','verde-mk','hokkaido-kitchen-mk','wharf-tavern-mk'));

insert into deal_slots (deal_id, restaurant_id, starts_at, ends_at, total_covers, discount_percent)
select d.id, d.restaurant_id,
       (current_date + i)::timestamp + time '20:30',
       (current_date + i)::timestamp + time '22:00', 8,
       least(50, d.discount_percent + 10)
from deals d, generate_series(0,6) as i
where d.restaurant_id in (select id from restaurants where slug in
  ('olio-grano-mk','bao-bun-mk','copper-pot-mk','saffron-lounge-mk','smoke-char-mk','verde-mk','hokkaido-kitchen-mk','wharf-tavern-mk'));
