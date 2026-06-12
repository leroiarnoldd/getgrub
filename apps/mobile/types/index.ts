export interface City {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string | null;
  city_id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine_tags: string[];
  dietary_tags: string[];
  vibe_tags: string[];
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  average_rating: number;
  total_reviews: number;
  reliability_score: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  discount_percent: number;
  discount_applies_to: string;
  includes_drinks: boolean;
  min_spend: number | null;
  max_party_size: number | null;
  deal_type: string;
  valid_days: string[];
  valid_from: string | null;
  valid_until: string | null;
  active_from: string | null;
  active_until: string | null;
  max_daily_claims: number | null;
  claims_today: number;
  total_claims: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealWithRestaurant extends Deal {
  restaurant: Restaurant;
}

export interface DealSlot {
  id: string;
  deal_id: string;
  restaurant_id: string;
  starts_at: string;
  ends_at: string;
  discount_percent: number | null;
  total_covers: number;
  booked_covers: number;
  status: 'open' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city_id: string | null;
  dietary_tags: string[];
  allergy_tags: string[];
  vibe_preferences: string[];
  budget_max_per_head: number;
  total_saved: number;
  total_redemptions: number;
  expo_push_token: string | null;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  user_id: string;
  deal_id: string;
  restaurant_id: string;
  status: 'claimed' | 'redeemed' | 'expired' | 'cancelled';
  slot_id: string | null;
  voucher_code: string;
  claimed_at: string;
  redeemed_at: string | null;
  expires_at: string;
  party_size: number;
  estimated_bill: number | null;
  actual_bill: number | null;
  amount_saved: number | null;
  feedback_submitted: boolean;
}

export interface ConciergeResult {
  id: string;
  score: number;
  match_reason: string;
  highlight: string;
}

export interface FeedbackInput {
  freetext: string;
  food_rating: number;
  vibe_rating: number;
  value_rating: number;
}

export interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  themes: string[];
  would_improve_score: boolean;
  restaurant_insight: string;
}

export interface GroupResult {
  id: string;
  score: number;
  group_fit: string;
  compromise: string | null;
}

export interface RestaurantCandidate {
  id: string;
  name: string;
  description: string;
  cuisine_tags: string[];
  dietary_tags: string[];
  vibe_tags: string[];
  reliability_score: number;
  deals: Array<{
    title: string;
    discount_percent: number;
    includes_drinks: boolean;
    valid_days: string[];
    valid_from: string;
    valid_until: string;
  }>;
}
