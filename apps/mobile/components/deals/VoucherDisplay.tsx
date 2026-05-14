import { View, Text } from 'react-native';
import type { Claim } from '../../types';
import { formatUKTime } from '../../lib/utils';

interface Props {
  claim: Claim;
  restaurantName: string;
  dealTitle: string;
}

export function VoucherDisplay({ claim, restaurantName, dealTitle }: Props) {
  return (
    <View className="bg-white rounded-3xl p-8 items-center gap-4 border-2 border-getgrub-coral/20">
      <Text className="text-getgrub-navy font-bold text-2xl text-center">{restaurantName}</Text>
      <View className="bg-getgrub-cream rounded-2xl px-8 py-6 items-center w-full">
        <Text className="text-gray-500 text-sm mb-2 uppercase tracking-widest">Voucher code</Text>
        <Text className="font-mono text-getgrub-navy font-black text-4xl tracking-widest">
          {claim.voucher_code}
        </Text>
      </View>
      <Text className="text-getgrub-coral font-bold text-lg text-center">{dealTitle}</Text>
      <Text className="text-gray-400 text-sm text-center">
        Show this screen to your server when you arrive
      </Text>
      <Text className="text-gray-400 text-xs">
        Valid until {formatUKTime(claim.expires_at)} today
      </Text>
    </View>
  );
}
