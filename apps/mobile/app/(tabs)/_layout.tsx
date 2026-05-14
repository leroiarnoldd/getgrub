import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function TabsLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafaf8' }}>
        <ActivityIndicator color="#e8593c" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#e8593c',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f3f4f6',
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="saved"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
