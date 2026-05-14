import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConciergeInput } from '../../components/search/ConciergeInput';
import { MatchResult } from '../../components/search/MatchResult';
import { aiConcierge } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';
import type { ConciergeResult, DealWithRestaurant, Restaurant, RestaurantCandidate } from '../../types';

const PROMPTS = [
  'Romantic dinner tonight',
  'Halal curry with friends',
  'Quick vegan lunch',
  'Sunday roast with family',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ConciergeResult[]>([]);
  const [deals, setDeals] = useState<DealWithRestaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { profile } = useUserStore();

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Fetch candidates: active deals with restaurants
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*, restaurant:restaurants(*)')
        .eq('is_active', true)
        .limit(20);

      if (dealsError) throw dealsError;

      const fetchedDeals = (dealsData as DealWithRestaurant[]).filter(d => d.restaurant?.is_active);
      setDeals(fetchedDeals);

      const fetchedRestaurants = fetchedDeals
        .map(d => d.restaurant)
        .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i);
      setRestaurants(fetchedRestaurants);

      // Build candidates for AI
      const candidates: RestaurantCandidate[] = fetchedRestaurants.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        cuisine_tags: r.cuisine_tags,
        dietary_tags: r.dietary_tags,
        vibe_tags: r.vibe_tags,
        reliability_score: r.reliability_score,
        deals: fetchedDeals
          .filter(d => d.restaurant_id === r.id)
          .map(d => ({
            title: d.title,
            discount_percent: d.discount_percent,
            includes_drinks: d.includes_drinks,
            valid_days: d.valid_days,
            valid_from: d.valid_from ?? '',
            valid_until: d.valid_until ?? '',
          })),
      }));

      const aiResults = await aiConcierge({
        query: q,
        userProfile: profile ?? {
          id: '',
          display_name: null,
          avatar_url: null,
          city_id: null,
          dietary_tags: [],
          allergy_tags: [],
          vibe_preferences: [],
          budget_max_per_head: 50,
          total_saved: 0,
          total_redemptions: 0,
          expo_push_token: null,
          push_enabled: true,
          created_at: '',
          updated_at: '',
        },
        candidates,
      });

      setResults(aiResults);
    } catch (e) {
      setError('Something went wrong. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <Text className="text-2xl font-black text-getgrub-navy mb-1">AI Concierge</Text>
        <Text className="text-gray-500 mb-4 text-sm">Tell me what you fancy and I'll find the perfect deal</Text>

        <ConciergeInput
          value={query}
          onChangeText={setQuery}
          onSubmit={() => handleSearch()}
          isLoading={isLoading}
        />

        {/* Quick prompts */}
        {!hasSearched && (
          <View className="mt-6">
            <Text className="text-getgrub-navy font-semibold mb-3">Try asking for...</Text>
            <View className="flex-row flex-wrap gap-2">
              {PROMPTS.map(p => (
                <View
                  key={p}
                  style={{ borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' }}
                >
                  <Text
                    style={{ color: '#1a1a2e', fontSize: 13 }}
                    onPress={() => { setQuery(p); handleSearch(p); }}
                  >
                    {p}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {isLoading && (
          <View className="items-center py-12 gap-3">
            <ActivityIndicator size="large" color="#e8593c" />
            <Text className="text-gray-500">Finding your perfect match...</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-50 rounded-xl px-4 py-3 mt-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {!isLoading && results.length > 0 && (
          <View className="mt-6">
            <Text className="text-getgrub-navy font-semibold mb-3">
              {results.length} match{results.length !== 1 ? 'es' : ''} for "{query}"
            </Text>
            {results.map(result => {
              const restaurant = restaurants.find(r => r.id === result.id);
              const deal = deals.find(d => d.restaurant_id === result.id);
              return (
                <MatchResult
                  key={result.id}
                  result={result}
                  restaurant={restaurant}
                  dealId={deal?.id}
                />
              );
            })}
          </View>
        )}

        {!isLoading && hasSearched && results.length === 0 && !error && (
          <View className="items-center py-16">
            <Text className="text-4xl mb-4">🤔</Text>
            <Text className="text-gray-500 text-center px-8">
              No matches found. Try a different search or check back later for new deals.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
