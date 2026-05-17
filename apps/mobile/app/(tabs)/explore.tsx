import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useDeals } from '../../hooks/useDeals';
import { useUserStore } from '../../stores/userStore';
import type { DealWithRestaurant } from '../../types';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'British', value: 'british' },
  { label: 'Indian', value: 'indian' },
  { label: 'Italian', value: 'italian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Burgers', value: 'burgers' },
  { label: 'Chinese', value: 'chinese' },
];

export default function ExploreScreen() {
  const { profile } = useUserStore();
  const router = useRouter();
  const [category, setCategory] = useState('all');

  const { data: deals = [], isLoading, refetch, isRefetching } = useDeals(
    profile?.city_id ?? undefined,
    category,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.sub}>{deals.length} deals available</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => setCategory(cat.value)}
            style={[styles.chip, category === cat.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.categoryList}
      />

      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <GridCard deal={item} onPress={() => router.push(`/deal/${item.id}`)} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No deals in this category yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function GridCard({ deal, onPress }: { deal: DealWithRestaurant; onPress: () => void }) {
  const r = deal.restaurant;
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
      {r.cover_image_url ? (
        <Image source={r.cover_image_url} style={styles.gridImage} contentFit="cover" transition={300} />
      ) : (
        <View style={[styles.gridImage, styles.placeholder]}>
          <Text style={{ fontSize: 32 }}>🍽️</Text>
        </View>
      )}
      <View style={styles.gridBadge}>
        <Text style={styles.gridBadgeText}>{deal.discount_percent}% Off</Text>
      </View>
      <View style={styles.gridBody}>
        <Text style={styles.gridName} numberOfLines={1}>{r.name}</Text>
        <Text style={styles.gridCuisine} numberOfLines={1}>
          {r.cuisine_tags[0] ? r.cuisine_tags[0].charAt(0).toUpperCase() + r.cuisine_tags[0].slice(1) : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF5' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a2e' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  categoryList: { flexGrow: 0 },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#FF0000', borderColor: '#FF0000' },
  chipText: { fontWeight: '500', fontSize: 13, color: '#1a1a2e' },
  chipTextActive: { color: '#fff' },
  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12 },
  gridCard: {
    flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  gridImage: { width: '100%', height: 140 },
  placeholder: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  gridBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: '#FF0000',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  gridBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  gridBody: { padding: 10 },
  gridName: { fontWeight: '700', fontSize: 13, color: '#1a1a2e' },
  gridCuisine: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 15 },
});