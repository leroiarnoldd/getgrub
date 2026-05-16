import { FlatList, RefreshControl, View, Text, StyleSheet } from 'react-native';
import { DealCard } from './DealCard';
import { DealCardSkeleton } from '../ui/LoadingSkeleton';
import type { DealWithRestaurant } from '../../types';

interface Props {
  deals: DealWithRestaurant[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  userDietaryTags?: string[];
  emptyMessage?: string;
}

export function DealList({ deals, isLoading, isRefreshing, onRefresh, userDietaryTags, emptyMessage }: Props) {
  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map(i => <DealCardSkeleton key={i} />)}
      </View>
    );
  }

  return (
    <FlatList
      data={deals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DealCard deal={item} userDietaryTags={userDietaryTags} />
      )}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#e8593c" />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyText}>
            {emptyMessage || "No deals near you yet — we're signing more restaurants every week"}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
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
