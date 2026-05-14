import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ReliabilityBadge } from '../ui/ReliabilityBadge';
import { DietaryTags } from '../ui/DietaryTags';
import { Badge } from '../ui/Badge';
import type { DealWithRestaurant } from '../../types';
import { formatDaysRange } from '../../lib/utils';

interface Props {
  deal: DealWithRestaurant;
  userDietaryTags?: string[];
}

export function DealCard({ deal, userDietaryTags }: Props) {
  const router = useRouter();
  const r = deal.restaurant;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/deal/${deal.id}`)}
      className="mb-4"
      activeOpacity={0.85}
    >
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {r.cover_image_url ? (
          <Image
            source={r.cover_image_url}
            style={{ width: '100%', height: 192 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={300}
          />
        ) : (
          <View className="h-48 bg-gray-100 items-center justify-center">
            <Text className="text-4xl">🍽️</Text>
          </View>
        )}
        <View className="p-4 gap-2">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-getgrub-navy font-bold text-lg leading-tight">{r.name}</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                {r.cuisine_tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
              </Text>
            </View>
            <ReliabilityBadge score={r.reliability_score} />
          </View>

          <View className="bg-getgrub-coral/10 rounded-xl px-3 py-2">
            <Text className="text-getgrub-coral font-bold text-xl">{deal.title}</Text>
          </View>

          <DietaryTags tags={r.dietary_tags} userDietaryTags={userDietaryTags} />

          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-gray-500 text-xs">
              Valid {formatDaysRange(deal.valid_days)}
            </Text>
            {deal.includes_drinks && (
              <Badge label="Drinks incl." color="teal" />
            )}
            {deal.deal_type === 'dine_in' && (
              <Badge label="Dine-in" color="gray" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
