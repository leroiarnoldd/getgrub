import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeals } from '../../hooks/useDeals';
import { useUserStore } from '../../stores/userStore';
import { useAuthStore } from '../../stores/authStore';
import { DealList } from '../../components/deals/DealList';
import { supabase } from '../../lib/supabase';
import type { UserProfile, City } from '../../types';

const CUISINE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'British', value: 'british' },
  { label: 'Indian', value: 'indian' },
  { label: 'Italian', value: 'italian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Burgers', value: 'burgers' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { profile, setProfile } = useUserStore();
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [city, setCity] = useState<City | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as UserProfile);
      });
  }, [user]);

  useEffect(() => {
    if (!profile?.city_id) return;
    supabase
      .from('cities')
      .select('*')
      .eq('id', profile.city_id)
      .single()
      .then(({ data }) => {
        if (data) setCity(data as City);
      });
  }, [profile?.city_id]);

  const { data: deals = [], isLoading, refetch, isRefetching } = useDeals(profile?.city_id, cuisineFilter);

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-black text-getgrub-navy">Get Grub</Text>
        {city && (
          <Text className="text-gray-500 text-sm">{city.name} · {deals.length} deals available</Text>
        )}
      </View>

      {/* Cuisine filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
      >
        {CUISINE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setCuisineFilter(f.value)}
            className={`rounded-full px-4 py-2 ${cuisineFilter === f.value ? 'bg-getgrub-coral' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`font-medium text-sm ${cuisineFilter === f.value ? 'text-white' : 'text-getgrub-navy'}`}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DealList
        deals={deals}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
        userDietaryTags={profile?.dietary_tags}
      />
    </SafeAreaView>
  );
}
