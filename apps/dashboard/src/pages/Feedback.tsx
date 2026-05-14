import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Feedback, Restaurant } from '../types';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

interface FeedbackWithDeal extends Feedback {
  deal: { title: string } | null;
}

export function Feedback() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackWithDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avgRatings, setAvgRatings] = useState({ food: 0, vibe: 0, value: 0 });
  const [topThemes, setTopThemes] = useState<Array<{ theme: string; count: number }>>([]);

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

      const { data } = await supabase
        .from('feedback')
        .select('*, deal:deals(title)')
        .eq('restaurant_id', rest.id)
        .order('created_at', { ascending: false });

      const list = (data ?? []) as FeedbackWithDeal[];
      setFeedbackList(list);

      if (list.length > 0) {
        setAvgRatings({
          food: list.reduce((s, f) => s + f.food_rating, 0) / list.length,
          vibe: list.reduce((s, f) => s + f.vibe_rating, 0) / list.length,
          value: list.reduce((s, f) => s + f.value_rating, 0) / list.length,
        });

        // Aggregate AI themes
        const themeCounts: Record<string, number> = {};
        list.forEach(f => {
          f.ai_themes?.forEach(theme => {
            themeCounts[theme] = (themeCounts[theme] ?? 0) + 1;
          });
        });
        const sorted = Object.entries(themeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([theme, count]) => ({ theme, count }));
        setTopThemes(sorted);
      }

      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  if (!restaurant) return <div className="p-8 text-gray-500">No restaurant found.</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-getgrub-navy">Feedback</h2>
        <p className="text-gray-500 text-sm">{feedbackList.length} reviews</p>
      </div>

      {feedbackList.length > 0 ? (
        <>
          {/* Averages */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Food', value: avgRatings.food, color: 'text-orange-500' },
              { label: 'Vibe', value: avgRatings.vibe, color: 'text-purple-500' },
              { label: 'Value', value: avgRatings.value, color: 'text-teal-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className={`text-3xl font-black ${color}`}>{value.toFixed(1)}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
                <Stars rating={Math.round(value)} />
              </div>
            ))}
          </div>

          {/* Top themes */}
          {topThemes.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <h3 className="font-bold text-getgrub-navy mb-3">Common themes</h3>
              <div className="flex flex-wrap gap-2">
                {topThemes.map(({ theme, count }) => (
                  <span key={theme} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                    {theme} <span className="font-bold">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback list */}
          <div className="space-y-4">
            {feedbackList.map(f => (
              <div key={f.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-orange-500">Food <Stars rating={f.food_rating} /></span>
                      <span className="text-purple-500">Vibe <Stars rating={f.vibe_rating} /></span>
                      <span className="text-teal-500">Value <Stars rating={f.value_rating} /></span>
                    </div>
                    {f.deal?.title && (
                      <p className="text-xs text-gray-400 mt-1">Deal: {f.deal.title}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {f.ai_sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        f.ai_sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        f.ai_sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {f.ai_sentiment}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(f.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                {f.freetext && (
                  <p className="text-gray-600 text-sm italic">"{f.freetext}"</p>
                )}

                {f.ai_themes && f.ai_themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.ai_themes.map(theme => (
                      <span key={theme} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}

                {f.would_return !== null && (
                  <p className="text-xs text-gray-400 mt-2">
                    Would return: {f.would_return ? '✓ Yes' : '✗ No'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-400">No feedback yet. It will appear here once customers leave reviews after redeeming deals.</p>
        </div>
      )}
    </div>
  );
}
