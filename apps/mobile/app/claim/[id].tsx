import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useClaim } from '../../hooks/useClaim';
import { useDeal } from '../../hooks/useDeals';
import { useSlot } from '../../hooks/useSlots';
import { VoucherDisplay } from '../../components/deals/VoucherDisplay';

export default function ClaimScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: claim, isLoading: claimLoading } = useClaim(id);
  const { data: deal, isLoading: dealLoading } = useDeal(claim?.deal_id ?? '');
  const { data: slot } = useSlot(claim?.slot_id);

  if (claimLoading || dealLoading || !claim || !deal) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#e8593c" />
      </SafeAreaView>
    );
  }

  const isExpired = new Date(claim.expires_at) < new Date();
  const isRedeemed = claim.status === 'redeemed';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Your voucher</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {isExpired ? (
          <View style={styles.expiredBox}>
            <Text style={styles.expiredTitle}>This voucher has expired</Text>
            <Text style={styles.expiredSub}>
              Claims are valid for 24 hours. Please claim a new deal.
            </Text>
          </View>
        ) : isRedeemed ? (
          <View style={styles.redeemedBox}>
            <Text style={styles.redeemedEmoji}>🎉</Text>
            <Text style={styles.redeemedTitle}>Deal redeemed!</Text>
            <Text style={styles.redeemedSub}>
              {claim.amount_saved ? `You saved £${claim.amount_saved.toFixed(2)}` : 'Enjoy your meal!'}
            </Text>
          </View>
        ) : (
          <VoucherDisplay
            claim={claim}
            restaurantName={deal.restaurant.name}
            dealTitle={deal.title}
            slot={slot}
          />

        )}

        {/* Instructions */}
        {!isExpired && !isRedeemed && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to use</Text>
            <View style={styles.stepList}>
              {[
                'Head to the restaurant during the deal hours',
                'Show your server this screen when seated',
                "They'll scan or enter your voucher code",
                'Enjoy your discounted meal!',
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leave feedback button for redeemed */}
        {isRedeemed && !claim.feedback_submitted && (
          <TouchableOpacity
            onPress={() => router.push(`/feedback/${claim.id}`)}
            style={styles.feedbackButton}
          >
            <Text style={styles.feedbackButtonText}>Leave feedback</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  closeText: {
    color: '#9ca3af',
  },
  expiredBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  expiredTitle: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 18,
  },
  expiredSub: {
    color: '#f87171',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  redeemedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  redeemedEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  redeemedTitle: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 18,
  },
  redeemedSub: {
    color: '#16a34a',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  instructionsTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  stepList: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#e8593c',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    color: '#4b5563',
    flex: 1,
  },
  feedbackButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
