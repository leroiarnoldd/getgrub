import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* User info */}
        <View style={styles.card}>
          <Text style={styles.displayName}>
            {profile?.display_name || 'Grubber'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your savings</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValueCoral}>
                £{(profile?.total_saved ?? 0).toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total saved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueNavy}>
                {profile?.total_redemptions ?? 0}
              </Text>
              <Text style={styles.statLabel}>Redemptions</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        {profile && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your preferences</Text>
            {profile.dietary_tags.length > 0 && (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Dietary</Text>
                <Text style={styles.prefValue}>{profile.dietary_tags.join(', ')}</Text>
              </View>
            )}
            {profile.vibe_preferences.length > 0 && (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Vibes</Text>
                <Text style={styles.prefValue}>{profile.vibe_preferences.join(', ')}</Text>
              </View>
            )}
            {profile.dietary_tags.length === 0 && profile.vibe_preferences.length === 0 && (
              <Text style={styles.noPrefs}>No preferences set</Text>
            )}
          </View>
        )}

        {/* Notifications */}
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View>
              <Text style={styles.notifTitle}>Push notifications</Text>
              <Text style={styles.notifSub}>New deals and reminders</Text>
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
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  displayName: {
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: 18,
  },
  email: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  cardTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValueCoral: {
    fontSize: 24,
    fontWeight: '900',
    color: '#e8593c',
  },
  statValueNavy: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  prefRow: {
    marginBottom: 8,
  },
  prefLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 2,
  },
  prefValue: {
    color: '#1a1a2e',
    fontSize: 14,
  },
  noPrefs: {
    color: '#9ca3af',
    fontSize: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    color: '#1a1a2e',
    fontWeight: '600',
  },
  notifSub: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
