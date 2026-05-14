import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeal } from '../../hooks/useDeals';
import { useClaimDeal } from '../../hooks/useClaim';
import { RestaurantHero } from '../../components/restaurant/RestaurantHero';
import { ReliabilityBadge } from '../../components/ui/ReliabilityBadge';
import { DietaryTags } from '../../components/ui/DietaryTags';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { formatDaysRange, isDealValidNow } from '../../lib/utils';
import * as Haptics from 'expo-haptics';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { data: deal, isLoading } = useDeal(id);
  const { mutateAsync: claimDeal, isPending: isClaiming, claimId } = useClaimDeal();
  const [partySize, setPartySize] = useState(2);
  const [isSaved, setIsSaved] = useState(false);

  const handleClaim = async () => {
    if (!deal || !user) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const claim = await claimDeal({
        dealId: deal.id,
        restaurantId: deal.restaurant_id,
        partySize,
      });
      router.push(`/claim/${claim.id}`);
    } catch (e: unknown) {
      Alert.alert('Could not claim deal', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const handleToggleSave = async () => {
    if (!user || !deal) return;
    if (isSaved) {
      await supabase
        .from('saved_deals')
        .delete()
        .eq('user_id', user.id)
        .eq('deal_id', deal.id);
      setIsSaved(false);
    } else {
      await supabase
        .from('saved_deals')
        .insert({ user_id: user.id, deal_id: deal.id });
      setIsSaved(true);
    }
  };

  if (isLoading || !deal) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-getgrub-cream">
        <ActivityIndicator size="large" color="#e8593c" />
      </SafeAreaView>
    );
  }

  const r = deal.restaurant;
  const isValidNow = isDealValidNow(deal);

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream" edges={['bottom']}>
      <ScrollView>
        <RestaurantHero restaurant={r} isSaved={isSaved} onToggleSave={handleToggleSave} />

        <View className="p-4 gap-4">
          {/* Restaurant info */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-black text-getgrub-navy">{r.name}</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {r.cuisine_tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
              </Text>
              {r.address && (
                <Text className="text-gray-400 text-xs mt-1">{r.address}</Text>
              )}
            </View>
            <ReliabilityBadge score={r.reliability_score} />
          </View>

          {r.description && (
            <Text className="text-gray-600">{r.description}</Text>
          )}

          {/* Deal highlight */}
          <View className={`rounded-2xl px-4 py-4 ${isValidNow ? 'bg-getgrub-coral' : 'bg-gray-200'}`}>
            <Text className={`font-black text-2xl ${isValidNow ? 'text-white' : 'text-gray-500'}`}>
              {deal.title}
            </Text>
            {deal.description && (
              <Text className={`text-sm mt-1 ${isValidNow ? 'text-white/80' : 'text-gray-400'}`}>
                {deal.description}
              </Text>
            )}
            {!isValidNow && (
              <Text className="text-gray-500 text-sm mt-2">Not available right now</Text>
            )}
          </View>

          {/* Deal details */}
          <View className="bg-white rounded-2xl p-4 gap-3">
            <Text className="text-getgrub-navy font-bold">Deal details</Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge label={`Valid: ${formatDaysRange(deal.valid_days)}`} color="navy" />
              {deal.valid_from && deal.valid_until && (
                <Badge label={`${deal.valid_from}–${deal.valid_until}`} color="gray" />
              )}
              {deal.includes_drinks && <Badge label="Drinks included" color="teal" />}
              {deal.min_spend && <Badge label={`Min spend £${deal.min_spend}`} color="gray" />}
            </View>

            <DietaryTags tags={r.dietary_tags} userDietaryTags={profile?.dietary_tags} />
          </View>

          {/* Party size */}
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-getgrub-navy font-bold mb-3">Party size</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-getgrub-navy font-bold text-lg">−</Text>
              </TouchableOpacity>
              <Text className="text-getgrub-navy font-black text-2xl min-w-[40px] text-center">{partySize}</Text>
              <TouchableOpacity
                onPress={() => setPartySize(Math.min(deal.max_party_size ?? 20, partySize + 1))}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-getgrub-navy font-bold text-lg">+</Text>
              </TouchableOpacity>
              <Text className="text-gray-500 text-sm">people</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-4 pb-6 pt-3 bg-getgrub-cream border-t border-gray-100">
        <TouchableOpacity
          onPress={handleClaim}
          disabled={isClaiming || !isValidNow}
          className={`rounded-2xl py-4 items-center ${isValidNow ? 'bg-getgrub-coral' : 'bg-gray-300'} ${isClaiming ? 'opacity-50' : ''}`}
        >
          {isClaiming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isValidNow ? 'Claim this deal' : 'Not available now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
