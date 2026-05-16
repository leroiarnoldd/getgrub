import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#e8593c" />
      </SafeAreaView>
    );
  }

  const r = deal.restaurant;
  const isValidNow = isDealValidNow(deal);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView>
        <RestaurantHero restaurant={r} isSaved={isSaved} onToggleSave={handleToggleSave} />

        <View style={styles.content}>
          {/* Restaurant info */}
          <View style={styles.restaurantRow}>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.cuisineText}>
                {r.cuisine_tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
              </Text>
              {r.address && (
                <Text style={styles.addressText}>{r.address}</Text>
              )}
            </View>
            <ReliabilityBadge score={r.reliability_score} />
          </View>

          {r.description && (
            <Text style={styles.description}>{r.description}</Text>
          )}

          {/* Deal highlight */}
          <View style={[styles.dealHighlight, isValidNow ? styles.dealHighlightActive : styles.dealHighlightInactive]}>
            <Text style={[styles.dealTitle, isValidNow ? styles.dealTitleActive : styles.dealTitleInactive]}>
              {deal.title}
            </Text>
            {deal.description && (
              <Text style={[styles.dealDesc, isValidNow ? styles.dealDescActive : styles.dealDescInactive]}>
                {deal.description}
              </Text>
            )}
            {!isValidNow && (
              <Text style={styles.notAvailableText}>Not available right now</Text>
            )}
          </View>

          {/* Deal details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Deal details</Text>
            <View style={styles.badgeRow}>
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
          <View style={styles.partySizeCard}>
            <Text style={styles.partySizeTitle}>Party size</Text>
            <View style={styles.partySizeRow}>
              <TouchableOpacity
                onPress={() => setPartySize(Math.max(1, partySize - 1))}
                style={styles.partySizeButton}
              >
                <Text style={styles.partySizeButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.partySizeValue}>{partySize}</Text>
              <TouchableOpacity
                onPress={() => setPartySize(Math.min(deal.max_party_size ?? 20, partySize + 1))}
                style={styles.partySizeButton}
              >
                <Text style={styles.partySizeButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.partySizeLabel}>people</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          onPress={handleClaim}
          disabled={isClaiming || !isValidNow}
          style={[
            styles.claimButton,
            isValidNow ? styles.claimButtonActive : styles.claimButtonInactive,
            isClaiming && styles.claimButtonDisabled,
          ]}
        >
          {isClaiming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.claimButtonText}>
              {isValidNow ? 'Claim this deal' : 'Not available now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 16,
    gap: 16,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  cuisineText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  addressText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    color: '#4b5563',
  },
  dealHighlight: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dealHighlightActive: {
    backgroundColor: '#e8593c',
  },
  dealHighlightInactive: {
    backgroundColor: '#e5e7eb',
  },
  dealTitle: {
    fontWeight: '900',
    fontSize: 24,
  },
  dealTitleActive: {
    color: '#ffffff',
  },
  dealTitleInactive: {
    color: '#6b7280',
  },
  dealDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  dealDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dealDescInactive: {
    color: '#9ca3af',
  },
  notAvailableText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  detailsTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partySizeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  partySizeTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
    marginBottom: 12,
  },
  partySizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  partySizeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partySizeButtonText: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 18,
  },
  partySizeValue: {
    color: '#1a1a2e',
    fontWeight: '900',
    fontSize: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  partySizeLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  ctaBar: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#fafaf8',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  claimButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  claimButtonActive: {
    backgroundColor: '#e8593c',
  },
  claimButtonInactive: {
    backgroundColor: '#d1d5db',
  },
  claimButtonDisabled: {
    opacity: 0.5,
  },
  claimButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
});
