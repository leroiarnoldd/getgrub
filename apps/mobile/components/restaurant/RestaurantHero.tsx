import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Restaurant } from '../../types';

interface Props {
  restaurant: Restaurant;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function RestaurantHero({ restaurant, isSaved, onToggleSave }: Props) {
  const router = useRouter();
  return (
    <View>
      <View style={{ position: 'relative' }}>
        {restaurant.cover_image_url ? (
          <Image
            source={restaurant.cover_image_url}
            style={{ width: '100%', height: 260 }}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={{ width: '100%', height: 260, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 64 }}>🍽️</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 48, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
        </TouchableOpacity>
        {onToggleSave && (
          <TouchableOpacity
            onPress={onToggleSave}
            style={{ position: 'absolute', top: 48, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 8 }}
          >
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color="#1A1A2E" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
