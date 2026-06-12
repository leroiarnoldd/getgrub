import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        .map((row) => row.deal as unknown as DealWithRestaurant)
        .filter(Boolean);

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved deals</Text>
        <Text style={styles.headerSub}>{deals.length} saved</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  headerSub: {
    color: '#6b7280',
    fontSize: 14,
  },
});
