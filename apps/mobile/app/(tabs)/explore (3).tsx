import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDeals } from '../../hooks/useDeals';
import { useUserStore } from '../../stores/userStore';
import { isDealValidNow } from '../../lib/utils';

const LONDON_REGION = {
  latitude: 51.505,
  longitude: -0.09,
  latitudeDelta: 0.14,
  longitudeDelta: 0.14,
};

export default function ExploreScreen() {
  const { profile } = useUserStore();
  const router = useRouter();
  const [liveNow, setLiveNow] = useState(true);
  const [search, setSearch] = useState('');
  const mapRef = useRef<MapView>(null);

  const { data: deals = [] } = useDeals(profile?.city_id ?? undefined, 'all');

  // Best deal per restaurant
  const restaurantDeals = Object.values(
    deals.reduce((acc, deal) => {
      const rid = deal.restaurant_id;
      if (!acc[rid] || deal.discount_percent > acc[rid].discount_percent) {
        acc[rid] = deal;
      }
      return acc;
    }, {} as Record<string, (typeof deals)[0]>)
  );

  const filtered = restaurantDeals.filter(d => {
    const r = d.restaurant;
    if (!r.lat || !r.lng) return false;
    if (liveNow && !isDealValidNow(d)) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.cuisine_tags.some(t => t.includes(q));
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={LONDON_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {filtered.map(deal => (
          <Marker
            key={deal.restaurant_id}
            coordinate={{ latitude: deal.restaurant.lat!, longitude: deal.restaurant.lng! }}
            onPress={() => router.push(`/deal/${deal.id}`)}
            tracksViewChanges={false}
          >
            <View style={styles.markerBubble}>
              <Text style={styles.markerText}>{deal.discount_percent}%</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top controls */}
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search venue name or cuisine"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={20} color="#1a1a2e" />
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, liveNow && styles.chipActive]}
            onPress={() => setLiveNow(v => !v)}
          >
            <Text style={[styles.chipText, liveNow && styles.chipTextActive]}>Live now</Text>
            {liveNow && (
              <Ionicons name="close" size={13} color="#fff" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom count bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>{filtered.length} active venues in this area</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a2e',
  },
  iconBtn: {
    backgroundColor: '#fff',
    width: 46, height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: { backgroundColor: '#1a1a2e' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  chipTextActive: { color: '#fff' },
  markerBubble: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingVertical: 18,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bottomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
});
