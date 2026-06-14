import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { DietaryTags } from '../ui/DietaryTags';
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
      style={styles.wrapper}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {r.cover_image_url ? (
            <Image
              source={r.cover_image_url}
              style={styles.image}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🍽️</Text>
            </View>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{deal.discount_percent}% OFF</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.nameBlock}>
              <Text style={styles.restaurantName} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.cuisineText} numberOfLines={1}>
                {r.cuisine_tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
              </Text>
            </View>
            {r.reliability_score >= 80 && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>⭐ Top rated</Text>
              </View>
            )}
          </View>

          <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>

          <DietaryTags tags={r.dietary_tags} userDietaryTags={userDietaryTags} />

          <View style={styles.footer}>
            <Text style={styles.validText}>📅 {formatDaysRange(deal.valid_days)}</Text>
            {deal.includes_drinks && (
              <View style={styles.drinksTag}>
                <Text style={styles.drinksText}>🍷 Drinks incl.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 200 },
  imagePlaceholder: {
    height: 200, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 48 },
  discountBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#1A1A2E', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  discountText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },
  body: { padding: 16, gap: 8 },
  topRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 8,
  },
  nameBlock: { flex: 1 },
  restaurantName: { color: '#1a1a2e', fontWeight: '800', fontSize: 17 },
  cuisineText: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: '#FFF7ED', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedText: { fontSize: 11, color: '#92400e', fontWeight: '600' },
  dealTitle: { color: '#1a1a2e', fontWeight: '600', fontSize: 15, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  validText: { color: '#6b7280', fontSize: 12 },
  drinksTag: {
    backgroundColor: '#F0FDF4', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  drinksText: { fontSize: 12, color: '#166534', fontWeight: '500' },
});