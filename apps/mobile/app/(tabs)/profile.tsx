import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores/userStore';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useUserStore();

  const handleTogglePush = async (value: boolean) => {
    if (!user) return;
    updateProfile({ push_enabled: value });
    await supabase.from('user_profiles').update({ push_enabled: value }).eq('id', user.id);
  };

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{profile?.display_name || 'Grubber'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>£{(profile?.total_saved ?? 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.total_redemptions ?? 0}</Text>
            <Text style={styles.statLabel}>Deals used</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.dietary_tags?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Preferences</Text>
          </View>
        </View>

        {profile && (profile.dietary_tags.length > 0 || profile.vibe_preferences.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your preferences</Text>
            {profile.dietary_tags.length > 0 && (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Dietary</Text>
                <View style={styles.tagRow}>
                  {profile.dietary_tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {profile.vibe_preferences.length > 0 && (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Vibes</Text>
                <View style={styles.tagRow}>
                  {profile.vibe_preferences.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <View>
                <Text style={styles.settingTitle}>Push notifications</Text>
                <Text style={styles.settingSub}>New deals and reminders</Text>
              </View>
            </View>
            <Switch
              value={profile?.push_enabled ?? true}
              onValueChange={handleTogglePush}
              trackColor={{ false: '#e5e7eb', true: '#1A1A2E' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a2e', marginBottom: 20 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },
  userInfo: { flex: 1 },
  displayName: { fontWeight: '800', fontSize: 18, color: '#1a1a2e' },
  email: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#1A1A2E' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, gap: 12 },
  cardTitle: { fontWeight: '800', fontSize: 15, color: '#1a1a2e' },
  prefRow: { gap: 6 },
  prefLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#f3f4f6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, color: '#1a1a2e', fontWeight: '500' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTitle: { fontWeight: '600', color: '#1a1a2e', fontSize: 14 },
  settingSub: { color: '#9ca3af', fontSize: 12, marginTop: 1 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#fee2e2' },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});