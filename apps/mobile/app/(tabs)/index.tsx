import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useDeals } from '../../hooks/useDeals';
import { useUserStore } from '../../stores/userStore';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import type { DealWithRestaurant } from '../../types';
import { formatDaysRange } from '../../lib/utils';

interface Filters {
  cuisine: string;
  dietary: string[];
  minDiscount: string;
}
const DEFAULT_FILTERS: Filters = { cuisine: 'All', dietary: [], minDiscount: 'Any' };

export default function HomeScreen() {
  const { profile } = useUserStore();
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'distance' | 'discount'>('discount');

  const { data: deals = [], isLoading, refetch, isRefetching } = useDeals(
    profile?.city_id ?? undefined,
    undefined,
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

  const popular = [...filteredDeals].sort((a, b) => b.total_claims - a.total_claims).slice(0, 8);
  const allDeals = sortBy === 'discount'
    ? [...filteredDeals].sort((a, b) => b.discount_percent - a.discount_percent)
    : filteredDeals;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={allDeals}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.logo}>GET GRUB</Text>
              <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
                <Ionicons name="person" size={18} color="#1a1a2e" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" />
              <Text style={styles.searchPlaceholder}>Search venue name or cuisine</Text>
              <TouchableOpacity onPress={() => setShowFilter(true)}>
                <Ionicons name="options-outline" size={20} color="#1a1a2e" />
              </TouchableOpacity>
            </TouchableOpacity>

            {popular.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What's popular</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                  {popular.map(deal => (
                    <FeaturedCard key={deal.id} deal={deal} onPress={() => router.push(`/deal/${deal.id}`)} />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.countRow}>
              <Text style={styles.countText}>Showing {filteredDeals.length} deals</Text>
              <View style={styles.sortRow}>
                <TouchableOpacity
                  style={[styles.pill, sortBy === 'discount' && styles.pillActive]}
                  onPress={() => setSortBy('discount')}
                >
                  <Text style={[styles.pillText, sortBy === 'discount' && styles.pillTextActive]}>Sort: Top deals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pill, sortBy === 'distance' && styles.pillActive]}
                  onPress={() => setSortBy('distance')}
                >
                  <Text style={[styles.pillText, sortBy === 'distance' && styles.pillTextActive]}>Sort: Newest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ListDealCard deal={item} onPress={() => router.push(`/deal/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No deals near you yet</Text>
            </View>
          ) : null
        }
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

function FeaturedCard({ deal, onPress }: { deal: DealWithRestaurant; onPress: () => void }) {
  const r = deal.restaurant;
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
      {r.cover_image_url ? (
        <Image source={r.cover_image_url} style={styles.featuredImage} contentFit="cover" transition={300} />
      ) : (
        <View style={[styles.featuredImage, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 40 }}>🍽️</Text>
        </View>
      )}
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredBadgeText}>{deal.discount_percent}% Off</Text>
        <Text style={styles.featuredBadgeSub}>{deal.deal_type === 'dine_in' ? 'Dine In' : 'Takeaway'}</Text>
      </View>
      <View style={styles.featuredBottom}>
        <Text style={styles.featuredName} numberOfLines={1}>{r.name}</Text>
        <Text style={styles.featuredArea} numberOfLines={1}>
          {r.cuisine_tags[0] ? r.cuisine_tags[0].charAt(0).toUpperCase() + r.cuisine_tags[0].slice(1) : ''}
          {r.postcode ? ` · ${r.postcode}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ListDealCard({ deal, onPress }: { deal: DealWithRestaurant; onPress: () => void }) {
  const r = deal.restaurant;
  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.listImageWrap}>
        {r.cover_image_url ? (
          <Image source={r.cover_image_url} style={styles.listImage} contentFit="cover" transition={300} />
        ) : (
          <View style={[styles.listImage, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 32 }}>🍽️</Text>
          </View>
        )}
        <View style={styles.listBadge}>
          <Text style={styles.listBadgeText}>⚡ {deal.discount_percent}% Off</Text>
        </View>
      </View>
      <View style={styles.listBody}>
        <View style={styles.listTopRow}>
          <Text style={styles.listName} numberOfLines={1}>{r.name}</Text>
          <Ionicons name="heart-outline" size={20} color="#9ca3af" />
        </View>
        <Text style={styles.listMeta}>
          {r.cuisine_tags[0] ? r.cuisine_tags[0].charAt(0).toUpperCase() + r.cuisine_tags[0].slice(1) : ''}
          {r.address ? ` · ${r.address.split(',')[0]}` : ''}
        </Text>
        <Text style={styles.listDeal} numberOfLines={2}>{deal.title}</Text>
        <Text style={styles.listValid}>Valid {formatDaysRange(deal.valid_days)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF5' },
  listContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#FF0000', letterSpacing: 1 },
  profileBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchPlaceholder: { flex: 1, color: '#9ca3af', fontSize: 14 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', paddingHorizontal: 20, marginBottom: 12 },
  popularRow: { paddingHorizontal: 16, gap: 12 },
  featuredCard: {
    width: 240, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  featuredImage: { width: 240, height: 280 },
  featuredBadge: {
    position: 'absolute', top: 12, left: 12, backgroundColor: '#FF0000',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  featuredBadgeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  featuredBadgeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '500' },
  featuredBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10,
  },
  featuredName: { fontWeight: '700', fontSize: 15, color: '#1a1a2e' },
  featuredArea: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  countRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  countText: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  sortRow: { flexDirection: 'row', gap: 8 },
  pill: {
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  pillText: { fontSize: 13, fontWeight: '500', color: '#1a1a2e' },
  pillTextActive: { color: '#fff' },
  listCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  listImageWrap: { position: 'relative' },
  listImage: { width: '100%', height: 200 },
  listBadge: {
    position: 'absolute', top: 12, left: 12, backgroundColor: '#FF0000',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  listBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  listBody: { padding: 14, gap: 4 },
  listTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listName: { fontWeight: '800', fontSize: 16, color: '#1a1a2e', flex: 1, marginRight: 8 },
  listMeta: { fontSize: 13, color: '#6b7280' },
  listDeal: { fontSize: 14, color: '#1a1a2e', fontWeight: '500' },
  listValid: { fontSize: 12, color: '#9ca3af' },
  imagePlaceholder: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 15 },
});