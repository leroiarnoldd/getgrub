import { useState } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (e) {
      setError('Could not get location');
    } finally {
      setIsLoading(false);
    }
  };

  return { location, error, isLoading, requestLocation };
}
