import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useDeal } from '../../hooks/useDeals';
import { useClaimDeal } from '../../hooks/useClaim';
import { DietaryTags } from '../../components/ui/DietaryTags';
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
  const { mutateAsync: claimDeal, isPending: isClaiming } = useClaimDeal();
  const [partySize, setPartySize] = useState(2);
  const [isSaved, setIsSaved] = useState(false);

  const handleClaim = async () => {
    if (!deal || !user) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const claim = await claimDeal({ dealId: deal.id, restaurantId: deal.restaurant_id, partySize });
      router.push(`/claim/${claim.id}`);
    } catch (e: unknown) {
      Alert.alert('Could not claim deal', e instanceof Error ? e.message : 'Please try again');
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

  if (isLoading || !deal) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#FF0000" />
      </SafeAreaView>
    );
  }

  const r = deal.restaurant;
  const isValidNow = isDealValidNow(deal);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView>
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
          <TouchableOpacity style={styles.saveBtn} onPress={handleToggleSave}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#FF0000' : '#1a1a2e'} />
          </TouchableOpacity>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{deal.discount_percent}% OFF</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View>
            <Text style={styles.restaurantName}>{r.name}</Text>
            <Text style={styles.cuisineText}>
              {r.cuisine_tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
            </Text>
            {r.address && <Text style={styles.addressText}>📍 {r.address}</Text>}
          </View>

          {r.description && <Text style={styles.description}>{r.description}</Text>}

          <View style={[styles.dealBox, isValidNow ? styles.dealBoxActive : styles.dealBoxInactive]}>
            <Text style={[styles.dealTitle, !isValidNow && styles.dealTitleInactive]}>{deal.title}</Text>
            {deal.description && (
              <Text style={[styles.dealDesc, !isValidNow && styles.dealDescInactive]}>{deal.description}</Text>
            )}
            {!isValidNow && <Text style={styles.notAvailable}>Not available right now</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Deal details</Text>
            <View style={styles.detailRows}>
              <DetailRow icon="calendar-outline" label={`Valid ${formatDaysRange(deal.valid_days)}`} />
              {deal.valid_from && deal.valid_until && (
                <DetailRow icon="time-outline" label={`${deal.valid_from} – ${deal.valid_until}`} />
              )}
              {deal.includes_drinks && <DetailRow icon="wine-outline" label="Drinks included" />}
              {deal.min_spend && <DetailRow icon="cash-outline" label={`Min spend £${deal.min_spend}`} />}
              {deal.max_party_size && <DetailRow icon="people-outline" label={`Up to ${deal.max_party_size} people`} />}
            </View>
            <DietaryTags tags={r.dietary_tags} userDietaryTags={profile?.dietary_tags} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Party size</Text>
            <View style={styles.partySizeRow}>
              <TouchableOpacity onPress={() => setPartySize(Math.max(1, partySize - 1))} style={styles.sizeBtn}>
                <Text style={styles.sizeBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.sizeValue}>{partySize} people</Text>
              <TouchableOpacity onPress={() => setPartySize(Math.min(deal.max_party_size ?? 20, partySize + 1))} style={styles.sizeBtn}>
                <Text style={styles.sizeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <TouchableOpacity
          onPress={handleClaim}
          disabled={isClaiming || !isValidNow}
          style={[styles.claimBtn, !isValidNow && styles.claimBtnDisabled]}
        >
          {isClaiming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.claimBtnText}>
              {isValidNow ? `Claim deal · ${deal.discount_percent}% off` : 'Not available now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={16} color="#6b7280" />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF5' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF5' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 300 },
  heroPlaceholder: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 52, left: 16, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 8 },
  saveBtn: { position: 'absolute', top: 52, right: 16, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 8 },
  discountBadge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: '#FF0000', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  discountText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  content: { padding: 20, gap: 16 },
  restaurantName: { fontSize: 26, fontWeight: '900', color: '#1a1a2e' },
  cuisineText: { color: '#6b7280', fontSize: 14, marginTop: 4 },
  addressText: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  description: { color: '#4b5563', fontSize: 14, lineHeight: 20 },
  dealBox: { borderRadius: 16, padding: 18 },
  dealBoxActive: { backgroundColor: '#FF0000' },
  dealBoxInactive: { backgroundColor: '#f3f4f6' },
  dealTitle: { fontWeight: '900', fontSize: 22, color: '#fff' },
  dealTitleInactive: { color: '#6b7280' },
  dealDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 6 },
  dealDescInactive: { color: '#9ca3af' },
  notAvailable: { color: '#9ca3af', fontSize: 13, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { fontWeight: '700', color: '#1a1a2e', fontSize: 15 },
  detailRows: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { color: '#4b5563', fontSize: 14 },
  partySizeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sizeBtn: { width: 44, height: 44, backgroundColor: '#f3f4f6', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sizeBtnText: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  sizeValue: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', flex: 1, textAlign: 'center' },
  ctaBar: { padding: 20, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  claimBtn: { backgroundColor: '#FF0000', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  claimBtnDisabled: { backgroundColor: '#d1d5db' },
  claimBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});