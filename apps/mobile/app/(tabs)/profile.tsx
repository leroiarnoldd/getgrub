import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores/userStore';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useUserStore();

  const handleTogglePush = async (value: boolean) => {
    if (!user) return;
    updateProfile({ push_enabled: value });
    await supabase
      .from('user_profiles')
      .update({ push_enabled: value })
      .eq('id', user.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-2xl font-black text-getgrub-navy mb-6">Profile</Text>

        {/* User info */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-getgrub-navy font-bold text-lg">
            {profile?.display_name || 'Grubber'}
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">{user?.email}</Text>
        </View>

        {/* Stats */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-getgrub-navy font-bold mb-4">Your savings</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-black text-getgrub-coral">
                £{(profile?.total_saved ?? 0).toFixed(2)}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Total saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-black text-getgrub-navy">
                {profile?.total_redemptions ?? 0}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Redemptions</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        {profile && (
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-getgrub-navy font-bold mb-3">Your preferences</Text>
            {profile.dietary_tags.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-500 text-xs mb-1">Dietary</Text>
                <Text className="text-getgrub-navy text-sm">{profile.dietary_tags.join(', ')}</Text>
              </View>
            )}
            {profile.vibe_preferences.length > 0 && (
              <View>
                <Text className="text-gray-500 text-xs mb-1">Vibes</Text>
                <Text className="text-getgrub-navy text-sm">{profile.vibe_preferences.join(', ')}</Text>
              </View>
            )}
            {profile.dietary_tags.length === 0 && profile.vibe_preferences.length === 0 && (
              <Text className="text-gray-400 text-sm">No preferences set</Text>
            )}
          </View>
        )}

        {/* Notifications */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-getgrub-navy font-semibold">Push notifications</Text>
              <Text className="text-gray-500 text-xs mt-0.5">New deals and reminders</Text>
            </View>
            <Switch
              value={profile?.push_enabled ?? true}
              onValueChange={handleTogglePush}
              trackColor={{ false: '#d1d5db', true: '#e8593c' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={signOut}
          className="bg-white rounded-2xl p-5 items-center border border-red-100"
        >
          <Text className="text-red-500 font-semibold">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
