import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ReliabilityBadge } from '../ui/ReliabilityBadge';
import type { ConciergeResult, Restaurant } from '../../types';

interface Props {
  result: ConciergeResult;
  restaurant: Restaurant | undefined;
  dealId: string | undefined;
}

export function MatchResult({ result, restaurant, dealId }: Props) {
  const router = useRouter();
  if (!restaurant) return null;

  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
      {restaurant.cover_image_url && (
        <Image
          source={restaurant.cover_image_url}
          style={{ width: '100%', height: 140 }}
          contentFit="cover"
          transition={300}
        />
      )}
      <View className="p-4 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-getgrub-navy font-bold text-lg flex-1 mr-2">{restaurant.name}</Text>
          <ReliabilityBadge score={restaurant.reliability_score} />
        </View>
        <View className="bg-gray-50 rounded-xl px-3 py-2">
          <Text className="text-gray-600 text-sm italic">"{result.match_reason}"</Text>
        </View>
        <Text className="text-getgrub-coral font-semibold">{result.highlight}</Text>
        {dealId && (
          <TouchableOpacity
            onPress={() => router.push(`/deal/${dealId}`)}
            className="bg-getgrub-coral rounded-xl py-3 items-center mt-1"
          >
            <Text className="text-white font-semibold">Claim this deal →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
