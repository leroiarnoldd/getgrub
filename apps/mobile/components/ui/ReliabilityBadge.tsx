import { View, Text } from 'react-native';

interface Props {
  score: number;
}

function getReliabilityColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 90) return { bg: '#dcfce7', text: '#166534', label: 'Excellent' };
  if (score >= 75) return { bg: '#fef9c3', text: '#854d0e', label: 'Good' };
  if (score >= 60) return { bg: '#ffedd5', text: '#9a3412', label: 'Fair' };
  return { bg: '#fee2e2', text: '#991b1b', label: 'Poor' };
}

export function ReliabilityBadge({ score }: Props) {
  const { bg, text, label } = getReliabilityColor(score);

  return (
    <View style={{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' }}>
      <Text style={{ color: text, fontSize: 11, fontWeight: '700' }}>{score}%</Text>
      <Text style={{ color: text, fontSize: 9, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
