import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.card}>
      {restaurant.cover_image_url && (
        <Image
          source={restaurant.cover_image_url}
          style={{ width: '100%', height: 140 }}
          contentFit="cover"
          transition={300}
        />
      )}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <ReliabilityBadge score={restaurant.reliability_score} />
        </View>
        <View style={styles.reasonBox}>
          <Text style={styles.reason}>"{result.match_reason}"</Text>
        </View>
        <Text style={styles.highlight}>{result.highlight}</Text>
        {dealId && (
          <TouchableOpacity
            onPress={() => router.push(`/deal/${dealId}`)}
            style={styles.claimButton}
          >
            <Text style={styles.claimButtonText}>Claim this deal →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  reasonBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reason: {
    color: '#4b5563',
    fontSize: 14,
    fontStyle: 'italic',
  },
  highlight: {
    color: '#1A1A2E',
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  claimButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
