import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
      style={styles.wrapper}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {r.cover_image_url ? (
          <Image
            source={r.cover_image_url}
            style={{ width: '100%', height: 192 }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={300}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.cuisineText}>
                {r.cuisine_tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
              </Text>
            </View>
            <ReliabilityBadge score={r.reliability_score} />
          </View>

          <View style={styles.dealHighlight}>
            <Text style={styles.dealTitle}>{deal.title}</Text>
          </View>

          <DietaryTags tags={r.dietary_tags} userDietaryTags={userDietaryTags} />

          <View style={styles.metaRow}>
            <Text style={styles.validText}>Valid {formatDaysRange(deal.valid_days)}</Text>
            {deal.includes_drinks && <Badge label="Drinks incl." color="teal" />}
            {deal.deal_type === 'dine_in' && <Badge label="Dine-in" color="gray" />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imagePlaceholder: {
    height: 192,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  restaurantName: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
  },
  cuisineText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  dealHighlight: {
    backgroundColor: 'rgba(232, 89, 60, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dealTitle: {
    color: '#e8593c',
    fontWeight: '700',
    fontSize: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  validText: {
    color: '#6b7280',
    fontSize: 12,
  },
});
