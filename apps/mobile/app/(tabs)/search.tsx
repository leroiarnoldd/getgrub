import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>AI Concierge</Text>
        <Text style={styles.subtitle}>Tell me what you fancy and I'll find the perfect deal</Text>

        <ConciergeInput
          value={query}
          onChangeText={setQuery}
          onSubmit={() => handleSearch()}
          isLoading={isLoading}
        />

        {!hasSearched && (
          <View style={styles.promptsBlock}>
            <Text style={styles.promptsLabel}>Try asking for...</Text>
            <View style={styles.promptChips}>
              {PROMPTS.map(p => (
                <View key={p} style={styles.promptChip}>
                  <Text
                    style={styles.promptChipText}
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
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#1A1A2E" />
            <Text style={styles.loadingText}>Finding your perfect match...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading && results.length > 0 && (
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsLabel}>
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
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyEmoji}>🤔</Text>
            <Text style={styles.emptyText}>
              No matches found. Try a different search or check back later for new deals.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  promptsBlock: {
    marginTop: 24,
  },
  promptsLabel: {
    color: '#1a1a2e',
    fontWeight: '600',
    marginBottom: 12,
  },
  promptChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  promptChipText: {
    color: '#1a1a2e',
    fontSize: 13,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  resultsBlock: {
    marginTop: 24,
  },
  resultsLabel: {
    color: '#1a1a2e',
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
