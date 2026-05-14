import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { DealList } from '../../components/deals/DealList';
import { useUserStore } from '../../stores/userStore';
import type { DealWithRestaurant } from '../../types';

export default function SavedScreen() {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const [deals, setDeals] = useState<DealWithRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSaved = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_deals')
        .select(`
          deal_id,
          deal:deals(*, restaurant:restaurants(*))
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const savedDeals = (data ?? [])
        .map((row: { deal_id: string; deal: DealWithRestaurant }) => row.deal)
        .filter(Boolean) as DealWithRestaurant[];

      setDeals(savedDeals);
    } catch (e) {
      console.error('Saved deals error:', e);
    }
  };

  useEffect(() => {
    fetchSaved().finally(() => setIsLoading(false));
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSaved();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-black text-getgrub-navy">Saved deals</Text>
        <Text className="text-gray-500 text-sm">{deals.length} saved</Text>
      </View>

      <DealList
        deals={deals}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        userDietaryTags={profile?.dietary_tags}
        emptyMessage="You haven't saved any deals yet. Tap the heart on any deal to save it."
      />
    </SafeAreaView>
  );
}
