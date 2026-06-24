import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Restaurant, Claim } from '../types';

interface Stats {
  totalClaims: number;
  redeemedClaims: number;
  coversBooked: number;
  coversSeated: number;
  revenueDelivered: number;
  totalSavedByUsers: number;
  reliabilityScore: number;
  claimsToday: number;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-black text-getgrub-navy mt-1">{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function Overview() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rest } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!rest) { setIsLoading(false); return; }
      setRestaurant(rest as Restaurant);

      const { data: claims } = await supabase
        .from('claims')
        .select('*')
        .eq('restaurant_id', rest.id);

      const claimList = (claims ?? []) as Claim[];
      const today = new Date().toISOString().split('T')[0];
      const redeemed = claimList.filter(c => c.status === 'redeemed');

      setStats({
        totalClaims: claimList.length,
        redeemedClaims: redeemed.length,
        coversBooked: claimList
          .filter(c => c.status === 'claimed' || c.status === 'redeemed')
          .reduce((acc, c) => acc + (c.party_size ?? 0), 0),
        coversSeated: redeemed.reduce((acc, c) => acc + (c.party_size ?? 0), 0),
        revenueDelivered: redeemed.reduce((acc, c) => acc + (c.actual_bill ?? 0), 0),
        totalSavedByUsers: claimList.reduce((acc, c) => acc + (c.amount_saved ?? 0), 0),
        reliabilityScore: rest.reliability_score,
        claimsToday: claimList.filter(c => c.claimed_at.startsWith(today)).length,
      });

      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 rounded-2xl p-6">
          <h2 className="text-getgrub-navy font-bold">No restaurant found</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your account is not associated with a restaurant. Contact support to get set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-getgrub-navy">{restaurant.name}</h2>
        <p className="text-gray-500">{restaurant.address}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Revenue delivered"
          value={`£${Math.round(stats?.revenueDelivered ?? 0).toLocaleString()}`}
          sub={`from ${stats?.coversSeated ?? 0} seated covers`}
        />
        <StatCard
          label="Covers booked"
          value={stats?.coversBooked.toString() ?? '0'}
          sub={`${stats?.claimsToday ?? 0} new today`}
        />
        <StatCard
          label="Redemption rate"
          value={`${stats ? Math.round((stats.redeemedClaims / Math.max(1, stats.totalClaims)) * 100) : 0}%`}
          sub={`${stats?.redeemedClaims ?? 0} of ${stats?.totalClaims ?? 0} bookings`}
        />
        <StatCard
          label="Reliability score"
          value={`${stats?.reliabilityScore ?? 100}%`}
          sub={stats && stats.reliabilityScore >= 90 ? 'Excellent' : stats && stats.reliabilityScore >= 75 ? 'Good' : 'Needs attention'}
        />
      </div>

      <div className="bg-getgrub-navy rounded-2xl p-6 mb-8 text-white">
        <p className="text-white/70 text-sm">Savings passed to your diners</p>
        <p className="text-3xl font-black mt-1">£{Math.round(stats?.totalSavedByUsers ?? 0).toLocaleString()}</p>
        <p className="text-white/60 text-xs mt-1">
          Off-peak demand you filled — covers that would otherwise have sat empty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-getgrub-navy mb-4">Restaurant status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Status</span>
              <span className={`text-sm font-semibold ${restaurant.is_active ? 'text-green-600' : 'text-red-500'}`}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Verified</span>
              <span className={`text-sm font-semibold ${restaurant.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {restaurant.is_verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total reviews</span>
              <span className="text-sm font-semibold text-getgrub-navy">{restaurant.total_reviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Average rating</span>
              <span className="text-sm font-semibold text-getgrub-navy">
                {restaurant.average_rating > 0 ? `${restaurant.average_rating}/5` : 'No ratings yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Cuisine & tags */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-getgrub-navy mb-4">Tags & categories</h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-xs mb-1">Cuisine</p>
              <div className="flex flex-wrap gap-1">
                {restaurant.cuisine_tags.map(tag => (
                  <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Dietary</p>
              <div className="flex flex-wrap gap-1">
                {restaurant.dietary_tags.map(tag => (
                  <span key={tag} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Vibe</p>
              <div className="flex flex-wrap gap-1">
                {restaurant.vibe_tags.map(tag => (
                  <span key={tag} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
