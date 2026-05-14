import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useClaim } from '../../hooks/useClaim';
import { useDeal } from '../../hooks/useDeals';
import { VoucherDisplay } from '../../components/deals/VoucherDisplay';

export default function ClaimScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: claim, isLoading: claimLoading } = useClaim(id);
  const { data: deal, isLoading: dealLoading } = useDeal(claim?.deal_id ?? '');

  if (claimLoading || dealLoading || !claim || !deal) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-getgrub-cream">
        <ActivityIndicator size="large" color="#e8593c" />
      </SafeAreaView>
    );
  }

  const isExpired = new Date(claim.expires_at) < new Date();
  const isRedeemed = claim.status === 'redeemed';

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-black text-getgrub-navy">Your voucher</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-gray-400">Close</Text>
          </TouchableOpacity>
        </View>

        {isExpired ? (
          <View className="bg-red-50 rounded-2xl p-6 items-center mb-4">
            <Text className="text-red-500 font-bold text-lg">This voucher has expired</Text>
            <Text className="text-red-400 text-sm mt-1 text-center">
              Claims are valid for 24 hours. Please claim a new deal.
            </Text>
          </View>
        ) : isRedeemed ? (
          <View className="bg-green-50 rounded-2xl p-6 items-center mb-4">
            <Text className="text-2xl mb-2">🎉</Text>
            <Text className="text-green-700 font-bold text-lg">Deal redeemed!</Text>
            <Text className="text-green-600 text-sm mt-1 text-center">
              {claim.amount_saved ? `You saved £${claim.amount_saved.toFixed(2)}` : 'Enjoy your meal!'}
            </Text>
          </View>
        ) : (
          <VoucherDisplay
            claim={claim}
            restaurantName={deal.restaurant.name}
            dealTitle={deal.title}
          />
        )}

        {/* Instructions */}
        {!isExpired && !isRedeemed && (
          <View className="bg-white rounded-2xl p-4 mt-4 gap-3">
            <Text className="text-getgrub-navy font-bold">How to use</Text>
            <View className="gap-2">
              {[
                'Head to the restaurant during the deal hours',
                'Show your server this screen when seated',
                'They\'ll scan or enter your voucher code',
                'Enjoy your discounted meal!',
              ].map((step, i) => (
                <View key={i} className="flex-row gap-3 items-start">
                  <View className="w-6 h-6 bg-getgrub-coral rounded-full items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-bold">{i + 1}</Text>
                  </View>
                  <Text className="text-gray-600 flex-1">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leave feedback button for redeemed */}
        {isRedeemed && !claim.feedback_submitted && (
          <TouchableOpacity
            onPress={() => router.push(`/feedback/${claim.id}`)}
            className="bg-getgrub-navy rounded-2xl py-4 items-center mt-4"
          >
            <Text className="text-white font-bold">Leave feedback</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
