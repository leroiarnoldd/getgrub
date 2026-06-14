import { View, Text, StyleSheet } from 'react-native';
import type { Claim, DealSlot } from '../../types';
import { formatUKTime } from '../../lib/utils';

interface Props {
  claim: Claim;
  restaurantName: string;
  dealTitle: string;
  slot?: DealSlot | null;
}

function slotDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'today';
  if (d.toDateString() === tomorrow.toDateString()) return 'tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function VoucherDisplay({ claim, restaurantName, dealTitle, slot }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.restaurantName}>{restaurantName}</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Voucher code</Text>
        <Text style={styles.code}>{claim.voucher_code}</Text>
      </View>
      <Text style={styles.dealTitle}>{dealTitle}</Text>
      {slot && (
        <View style={styles.slotBox}>
          <Text style={styles.slotText}>
            Table for {claim.party_size} · {slotDayLabel(slot.starts_at)} {formatUKTime(slot.starts_at)}–{formatUKTime(slot.ends_at)}
          </Text>
        </View>
      )}
      <Text style={styles.instruction}>Show this screen to your server when you arrive</Text>
      <Text style={styles.expiry}>
        {slot
          ? `Valid until ${formatUKTime(slot.ends_at)} on the day of your booking`
          : `Valid until ${formatUKTime(claim.expires_at)} today`}
      </Text>
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
    borderColor: 'rgba(26, 26, 46, 0.15)',
  },
  restaurantName: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#FAF7F2',
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
    color: '#1A1A2E',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  slotBox: {
    backgroundColor: '#fef3f1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  slotText: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 14,
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
