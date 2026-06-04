import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Animated,
  ScrollView, StyleSheet, Pressable,
} from 'react-native';

const CUISINE_OPTIONS = ['All', 'Caribbean', 'African', 'British', 'Indian', 'Italian', 'Vegan', 'Burgers', 'Chinese', 'Mexican'];
const DIETARY_OPTIONS = ['Vegan', 'Vegetarian', 'Halal', 'Gluten-free'];
const DISCOUNT_OPTIONS = ['Any', '10%+', '20%+', '30%+', '50%+'];

interface Filters {
  cuisine: string;
  dietary: string[];
  minDiscount: string;
}

interface Props {
  visible: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

export function FilterDrawer({ visible, filters, onApply, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const localFilters = useRef<Filters>({ ...filters });

  useEffect(() => {
    if (visible) {
      localFilters.current = { ...filters };
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Filter deals</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Section label="Cuisine">
            <ChipGroup
              options={CUISINE_OPTIONS}
              selected={[localFilters.current.cuisine]}
              onSelect={(v) => { localFilters.current = { ...localFilters.current, cuisine: v }; }}
              single
            />
          </Section>

          <Section label="Dietary">
            <ChipGroup
              options={DIETARY_OPTIONS}
              selected={localFilters.current.dietary}
              onSelect={(v) => {
                const cur = localFilters.current.dietary;
                localFilters.current = {
                  ...localFilters.current,
                  dietary: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v],
                };
              }}
            />
          </Section>

          <Section label="Minimum discount">
            <ChipGroup
              options={DISCOUNT_OPTIONS}
              selected={[localFilters.current.minDiscount]}
              onSelect={(v) => { localFilters.current = { ...localFilters.current, minDiscount: v }; }}
              single
            />
          </Section>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetBtn} onPress={() => {
            localFilters.current = { cuisine: 'All', dietary: [], minDiscount: 'Any' };
            onApply(localFilters.current);
          }}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(localFilters.current)}>
            <Text style={styles.applyText}>Show results</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipGroup({ options, selected, onSelect, single }: {
  options: string[];
  selected: string[];
  onSelect: (v: string) => void;
  single?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={[styles.chip, selected.includes(opt) && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected.includes(opt) && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
  },
  chipActive: {
    backgroundColor: '#FF0000',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  chipTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  resetText: {
    fontWeight: '600',
    color: '#1a1a2e',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF0000',
    alignItems: 'center',
  },
  applyText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 15,
  },
});
