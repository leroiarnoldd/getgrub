import { FlatList, RefreshControl, View, Text } from 'react-native';
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
      <View className="px-4 pt-4">
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
        <View className="items-center py-16">
          <Text className="text-4xl mb-4">🍽️</Text>
          <Text className="text-gray-500 text-center px-8">
            {emptyMessage || "No deals near you yet — we're signing more restaurants every week"}
          </Text>
        </View>
      }
    />
  );
}
