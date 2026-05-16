import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Get Grub</Text>
        {city && (
          <Text style={styles.headerSub}>{city.name} · {deals.length} deals available</Text>
        )}
      </View>

      {/* Cuisine filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CUISINE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setCuisineFilter(f.value)}
            style={[
              styles.filterChip,
              cuisineFilter === f.value ? styles.filterChipActive : styles.filterChipInactive,
            ]}
          >
            <Text style={[
              styles.filterChipText,
              cuisineFilter === f.value ? styles.filterChipTextActive : styles.filterChipTextInactive,
            ]}>
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
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#e8593c',
  },
  filterChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipText: {
    fontWeight: '500',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  filterChipTextInactive: {
    color: '#1a1a2e',
  },
});
