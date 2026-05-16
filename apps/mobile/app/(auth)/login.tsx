import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) return;
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not sign in. Check your details and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !email || !password;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.brandBlock}>
              <Text style={styles.brandTitle}>Get Grub</Text>
              <Text style={styles.brandSub}>Eat out more. Spend less.</Text>
            </View>

            <View style={styles.formBlock}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={handleSignIn}
                disabled={disabled}
                style={[styles.primaryButton, disabled && styles.disabled]}
              >
                <Text style={styles.primaryButtonText}>{isLoading ? 'Signing in...' : 'Get Grub'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkButton}>
                <Text style={styles.linkText}>No account? <Text style={styles.linkAccent}>Sign up free</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  brandBlock: {
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  brandSub: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 18,
  },
  formBlock: {
    gap: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  label: {
    color: '#1a1a2e',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#e8593c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#6b7280',
  },
  linkAccent: {
    color: '#e8593c',
    fontWeight: '600',
  },
});
