import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { DealSlot } from '../../types';
import { formatUKTime } from '../../lib/utils';

interface Props {
  slots: DealSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: DealSlot) => void;
  baseDiscount: number;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function SlotPicker({ slots, selectedSlotId, onSelect, baseDiscount }: Props) {
  const byDay = new Map<string, DealSlot[]>();
  for (const slot of slots) {
    const label = dayLabel(slot.starts_at);
    byDay.set(label, [...(byDay.get(label) ?? []), slot]);
  }

  return (
    <View style={styles.container}>
      {[...byDay.entries()].map(([label, daySlots]) => (
        <View key={label}>
          <Text style={styles.dayLabel}>{label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {daySlots.map((slot) => {
              const left = slot.total_covers - slot.booked_covers;
              const soldOut = left <= 0;
              const selected = slot.id === selectedSlotId;
              const discount = slot.discount_percent ?? baseDiscount;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.chip, selected && styles.chipSelected, soldOut && styles.chipSoldOut]}
                  onPress={() => onSelect(slot)}
                  disabled={soldOut}
                >
                  <Text style={[styles.chipTime, selected && styles.chipTextSelected, soldOut && styles.chipTextSoldOut]}>
                    {formatUKTime(slot.starts_at)}
                  </Text>
                  <Text style={[styles.chipDiscount, selected && styles.chipTextSelected, soldOut && styles.chipTextSoldOut]}>
                    {discount}% off
                  </Text>
                  <Text style={[styles.chipLeft, selected && styles.chipTextSelected]}>
                    {soldOut ? 'Sold out' : left <= 4 ? `${left} left` : `${left} seats`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  dayLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 8, marginTop: 8 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', gap: 1,
    backgroundColor: '#fff',
  },
  chipSelected: { borderColor: '#FF0000', backgroundColor: '#FF0000' },
  chipSoldOut: { backgroundColor: '#f3f4f6', borderColor: '#f3f4f6' },
  chipTime: { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  chipDiscount: { fontSize: 12, fontWeight: '600', color: '#FF0000' },
  chipLeft: { fontSize: 11, color: '#6b7280' },
  chipTextSelected: { color: '#fff' },
  chipTextSoldOut: { color: '#9ca3af' },
});
