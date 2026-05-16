import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  color?: 'coral' | 'navy' | 'teal' | 'gray';
}

const COLOR_MAP = {
  coral: { bg: '#fff7ed', text: '#9a3412' },
  navy:  { bg: '#eff6ff', text: '#1e40af' },
  teal:  { bg: '#f0fdfa', text: '#0f766e' },
  gray:  { bg: '#f3f4f6', text: '#374151' },
};

export function Badge({ label, color = 'gray' }: Props) {
  const { bg, text } = COLOR_MAP[color];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
