import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-getgrub-cream">
        <ActivityIndicator color="#e8593c" size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
