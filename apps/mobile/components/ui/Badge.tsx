import { View, Text } from 'react-native';

interface Props {
  label: string;
  color?: 'coral' | 'navy' | 'teal' | 'gray';
}

export function Badge({ label, color = 'gray' }: Props) {
  const colors = {
    coral: 'bg-orange-100 text-orange-800',
    navy: 'bg-blue-100 text-blue-800',
    teal: 'bg-teal-100 text-teal-800',
    gray: 'bg-gray-100 text-gray-700',
  };
  const [bg, text] = colors[color].split(' ');
  return (
    <View className={`${bg} px-2 py-0.5 rounded-full`}>
      <Text className={`${text} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
