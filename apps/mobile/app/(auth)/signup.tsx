import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signUp(email, password);
      router.replace('/(auth)/onboarding');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !email || !password || !confirmPassword;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.brandBlock}>
              <Text style={styles.brandTitle}>Create account</Text>
              <Text style={styles.brandSub}>Join thousands saving on great food</Text>
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
                  placeholder="At least 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={disabled}
                style={[styles.primaryButton, disabled && styles.disabledButton]}
              >
                <Text style={styles.primaryButtonText}>{isLoading ? 'Creating account...' : 'Sign up free'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
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
    backgroundColor: '#FAF7F2',
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
    backgroundColor: '#1A1A2E',
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
  disabledButton: {
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
    color: '#1A1A2E',
    fontWeight: '600',
  },
});
