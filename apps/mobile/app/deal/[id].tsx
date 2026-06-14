import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useDeal } from '../../hooks/useDeals';
import { useClaimDeal } from '../../hooks/useClaim';
import { useDealSlots, useBookSlot } from '../../hooks/useSlots';
import { SlotPicker } from '../../components/deals/SlotPicker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { isDealValidNow } from '../../lib/utils';
import * as Haptics from 'expo-haptics';
import type { DealWithRestaurant, DealSlot } from '../../types';

function spotsLeft(deal: DealWithRestaurant) {
  if (!deal.max_daily_claims) return null;
  return Math.max(0, deal.max_daily_claims - deal.claims_today);
}

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: deal, isLoading } = useDeal(id);
  const { data: slots = [] } = useDealSlots(id);
  const { mutateAsync: claimDeal, isPending: isClaiming } = useClaimDeal();
  const { mutateAsync: bookSlot, isPending: isBooking } = useBookSlot();
  const [partySize, setPartySize] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DealSlot | null>(null);

  const hasSlots = slots.length > 0;

  const handleClaim = async () => {
    if (!deal || !user) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const claim = hasSlots
        ? await bookSlot({ slotId: selectedSlot!.id, partySize })
        : await claimDeal({ dealId: deal.id, restaurantId: deal.restaurant_id, partySize });
      router.push(`/claim/${claim.id}`);
    } catch (e: unknown) {
      setSelectedSlot(null);
      Alert.alert(
        hasSlots ? 'Could not book table' : 'Could not claim deal',
        e instanceof Error ? e.message : 'Please try again'
      );
    }
  };

  const handleToggleSave = async () => {
    if (!user || !deal) return;
    if (isSaved) {
      await supabase.from('saved_deals').delete().eq('user_id', user.id).eq('deal_id', deal.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_deals').insert({ user_id: user.id, deal_id: deal.id });
      setIsSaved(true);
    }
  };

  const handleShare = async () => {
    if (!deal) return;
    await Share.share({ message: `Check out ${deal.discount_percent}% off at ${deal.restaurant.name} on Get Grub!` });
  };

  if (isLoading || !deal) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#1A1A2E" />
      </SafeAreaView>
    );
  }

  const r = deal.restaurant;
  const isValidNow = isDealValidNow(deal);
  const spots = spotsLeft(deal);
  const isBusy = isClaiming || isBooking;
  const canRedeem = hasSlots ? !!selectedSlot : isValidNow;
  const cuisineLabel = r.cuisine_tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          {r.cover_image_url ? (
            <Image source={r.cover_image_url} style={styles.heroImage} contentFit="cover" transition={300} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={{ fontSize: 64 }}>🍽️</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Restaurant name + save */}
          <View style={styles.nameRow}>
            <Text style={styles.restaurantName}>{r.name}</Text>
            <TouchableOpacity onPress={handleToggleSave} style={styles.heartBtn}>
              <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? '#1A1A2E' : '#1a1a2e'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.cuisineText}>{cuisineLabel}</Text>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="reader-outline" size={16} color="#1a1a2e" />
              <Text style={styles.actionBtnText}>Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={16} color="#1a1a2e" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Hours + address */}
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              {isValidNow ? (
                <>
                  <Text style={styles.openText}>Open</Text>
                  {deal.valid_until && <Text style={styles.infoSub}>closes {deal.valid_until}</Text>}
                </>
              ) : (
                <>
                  <Text style={styles.closedText}>Closed</Text>
                  {deal.valid_from && <Text style={styles.infoSub}>Opens at {deal.valid_from}</Text>}
                </>
              )}
            </View>
            {r.address && (
              <>
                <View style={styles.infoDivider} />
                <View style={[styles.infoCell, { flexDirection: 'row', gap: 4 }]}>
                  <Ionicons name="location-outline" size={13} color="#6b7280" style={{ marginTop: 1 }} />
                  <Text style={styles.infoSub} numberOfLines={3}>{r.address}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.divider} />

          {/* Party size */}
          <View style={styles.partySizeRow}>
            <Text style={styles.partySizeLabel}>Party size</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setPartySize(Math.max(1, partySize - 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepValue}>{partySize}</Text>
              <TouchableOpacity
                onPress={() => setPartySize(Math.min(deal.max_party_size ?? 20, partySize + 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bookable slots */}
          {hasSlots && (
            <>
              <Text style={styles.sectionTitle}>Pick a time</Text>
              <SlotPicker
                slots={slots}
                selectedSlotId={selectedSlot?.id ?? null}
                onSelect={setSelectedSlot}
                baseDiscount={deal.discount_percent}
              />
              <View style={styles.divider} />
            </>
          )}

          {/* Deal card */}
          <View style={styles.dealCard}>
            <View style={styles.dealCardTop}>
              <View style={styles.dealCardLeft}>
                <View style={styles.dealTitleRow}>
                  <Text style={styles.lightning}>⚡</Text>
                  <Text style={styles.dealTitle}>
                    {(selectedSlot?.discount_percent ?? deal.discount_percent)}% Off – Dine In
                  </Text>
                </View>
                {hasSlots ? (
                  <Text style={styles.dealSub}>
                    {selectedSlot ? 'Table held for 15 min after start time' : 'Pick a time above to book'}
                  </Text>
                ) : (
                  deal.valid_from && deal.valid_until && (
                    <Text style={styles.dealSub}>Arrive before {deal.valid_until}</Text>
                  )
                )}
                {!hasSlots && spots !== null && spots <= 5 && (
                  <View style={styles.spotsBadge}>
                    <Text style={styles.spotsText}>{spots} Left</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, (!canRedeem || isBusy) && styles.redeemBtnDisabled]}
                onPress={handleClaim}
                disabled={!canRedeem || isBusy}
              >
                {isBusy ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.redeemBtnText}>{hasSlots ? 'Book' : 'Redeem'}</Text>
                )}
              </TouchableOpacity>
            </View>
            {deal.description ? <Text style={styles.dealDesc}>{deal.description}</Text> : null}
            {deal.includes_drinks && <Text style={styles.dealPerk}>🍷 Drinks included</Text>}
            {deal.min_spend ? <Text style={styles.dealPerk}>💳 Min spend £{deal.min_spend}</Text> : null}
          </View>

          {/* About */}
          {r.description && (
            <View style={styles.descCard}>
              <Text style={styles.descTitle}>About</Text>
              <Text style={styles.descText}>{r.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF7F2' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 280 },
  heroPlaceholder: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 8,
  },
  content: { padding: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  restaurantName: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', flex: 1 },
  heartBtn: { padding: 4 },
  cuisineText: { color: '#6b7280', fontSize: 14, marginTop: 4, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 999, paddingVertical: 10,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoCell: { flex: 1, gap: 3 },
  infoDivider: { width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16 },
  openText: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  closedText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  infoSub: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  partySizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partySizeLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 36, height: 36, backgroundColor: '#f3f4f6',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  stepValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', minWidth: 24, textAlign: 'center' },
  dealCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#f3f4f6', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  dealCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dealCardLeft: { flex: 1, gap: 4 },
  dealTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lightning: { fontSize: 16 },
  dealTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  dealSub: { fontSize: 13, color: '#6b7280' },
  spotsBadge: {
    alignSelf: 'flex-start', backgroundColor: '#f3f4f6',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
  },
  spotsText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  redeemBtn: { backgroundColor: '#1a1a2e', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  redeemBtnDisabled: { backgroundColor: '#d1d5db' },
  redeemBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dealDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  dealPerk: { fontSize: 13, color: '#374151' },
  descCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 12, borderWidth: 1, borderColor: '#f3f4f6', gap: 8,
  },
  descTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  descText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
});
