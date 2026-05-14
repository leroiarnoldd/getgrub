import { View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function RestaurantMap({ lat, lng, name }: Props) {
  return (
    <View className="h-48 rounded-2xl overflow-hidden">
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={name} pinColor="#e8593c" />
      </MapView>
    </View>
  );
}
