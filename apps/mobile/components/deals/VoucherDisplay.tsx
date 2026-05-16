import { View, Text, StyleSheet } from 'react-native';
import type { Claim } from '../../types';
import { formatUKTime } from '../../lib/utils';

interface Props {
  claim: Claim;
  restaurantName: string;
  dealTitle: string;
}

export function VoucherDisplay({ claim, restaurantName, dealTitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.restaurantName}>{restaurantName}</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Voucher code</Text>
        <Text style={styles.code}>{claim.voucher_code}</Text>
      </View>
      <Text style={styles.dealTitle}>{dealTitle}</Text>
      <Text style={styles.instruction}>Show this screen to your server when you arrive</Text>
      <Text style={styles.expiry}>Valid until {formatUKTime(claim.expires_at)} today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'rgba(232, 89, 60, 0.2)',
  },
  restaurantName: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#fafaf8',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
    width: '100%',
  },
  codeLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  code: {
    fontFamily: 'monospace',
    color: '#1a1a2e',
    fontWeight: '900',
    fontSize: 36,
    letterSpacing: 4,
  },
  dealTitle: {
    color: '#e8593c',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  instruction: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  expiry: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
