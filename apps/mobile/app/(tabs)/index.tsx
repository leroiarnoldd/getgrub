import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeals } from '../../hooks/useDeals';
import { useUserStore } from '../../stores/userStore';
import { DealList } from '../../components/deals/DealList';
import { FilterDrawer } from '../../components/ui/FilterDrawer';

const CATEGORIES = [
  { label: 'All', value: 'all', emoji: '🍽️' },
  { label: 'British', value: 'british', emoji: '🫖' },
  { label: 'Indian', value: 'indian', emoji: '🍛' },
  { label: 'Italian', value: 'italian', emoji: '🍕' },
  { label: 'Vegan', value: 'vegan', emoji: '🥗' },
  { label: 'Burgers', value: 'burgers', emoji: '🍔' },
  { label: 'Chinese', value: 'chinese', emoji: '🥡' },
];

interface Filters {
  cuisine: string;
  dietary: string[];
  minDiscount: string;
}

const DEFAULT_FILTERS: Filters = { cuisine: 'All', dietary: [], minDiscount: 'Any' };

export default function HomeScreen() {
  const { profile } = useUserStore();
  const [category, setCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const activeFilterCount = [
    filters.cuisine !== 'All' ? 1 : 0,
    filters.dietary.length,
    filters.minDiscount !== 'Any' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const { data: deals = [], isLoading, refetch, isRefetching } = useDeals(
    profile?.city_id ?? undefined,
    category,
  );

  const filteredDeals = deals.filter(deal => {
    if (filters.dietary.length > 0) {
      const hasAll = filters.dietary.every(tag =>
        deal.restaurant?.dietary_tags?.map(t => t.toLowerCase()).includes(tag.toLowerCase())
      );
      if (!hasAll) return false;
    }
    if (filters.minDiscount !== 'Any') {
      const min = parseInt(filters.minDiscount);
      if (deal.discount_percent < min) return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>GET GRUB</Text>
          <Text style={styles.tagline}>{filteredDeals.length} deals near you</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? '#fff' : '#1a1a2e'} />
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            Filter
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            style={[styles.chip, category === cat.value && styles.chipActive]}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DealList
        deals={filteredDeals}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
        userDietaryTags={profile?.dietary_tags}
      />

      <FilterDrawer
        visible={showFilter}
        filters={filters}
        onApply={(f) => { setFilters(f); setShowFilter(false); }}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: '#FF0000',
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#F5F0E8', letterSpacing: 1 },
  tagline: { fontSize: 12, color: 'rgba(245,240,232,0.8)', marginTop: 1 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F0E8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  filterBtnActive: { backgroundColor: '#1a1a2e' },
  filterBtnText: { fontWeight: '600', fontSize: 14, color: '#1a1a2e' },
  filterBtnTextActive: { color: '#fff' },
  badge: {
    backgroundColor: '#FF0000', borderRadius: 999, width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#FF0000', borderColor: '#FF0000' },
  chipEmoji: { fontSize: 14 },
  chipText: { fontWeight: '500', fontSize: 13, color: '#1a1a2e' },
  chipTextActive: { color: '#fff' },
});