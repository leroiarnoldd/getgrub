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
  successful_redemptions: number;
  failed_redemptions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  user_id: string;
  deal_id: string;
  restaurant_id: string;
  status: 'claimed' | 'redeemed' | 'expired' | 'cancelled';
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

export interface Feedback {
  id: string;
  claim_id: string;
  user_id: string;
  restaurant_id: string;
  deal_id: string;
  food_rating: number;
  vibe_rating: number;
  value_rating: number;
  freetext: string | null;
  ai_themes: string[];
  ai_sentiment: string | null;
  would_return: boolean | null;
  created_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthly_fee_pence: number;
  cover_fee_pence: number;
  features: string[];
}

export interface RestaurantBilling {
  restaurant_id: string;
  tier_id: string;
  is_in_free_period: boolean;
  free_period_ends_at: string;
  monthly_fee_pence: number;
  cover_fee_pence: number;
  billing_email: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  restaurant_id: string;
  tier_id: string;
  period_start: string;
  period_end: string;
  covers_count: number;
  cover_fees_pence: number;
  subscription_fee_pence: number;
  total_pence: number;
  status: 'draft' | 'sent' | 'paid' | 'waived';
  waived_reason: string | null;
  created_at: string;
}

export interface BillingSummary {
  restaurant_id: string;
  restaurant_name: string;
  tier_name: string;
  monthly_fee_pence: number;
  cover_fee_pence: number;
  is_in_free_period: boolean;
  free_period_ends_at: string;
  covers_this_month: number;
  cover_fees_this_month_pence: number;
  estimated_bill_this_month_pence: number;
}
