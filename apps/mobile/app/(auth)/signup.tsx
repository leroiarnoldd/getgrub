import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            <View className="mb-10">
              <Text className="text-4xl font-black text-getgrub-navy">Create account</Text>
              <Text className="text-gray-500 mt-2 text-lg">Join thousands saving on great food</Text>
            </View>

            <View className="gap-4">
              {error ? (
                <View className="bg-red-50 rounded-xl px-4 py-3">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              ) : null}

              <View>
                <Text className="text-getgrub-navy font-medium mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="bg-white rounded-2xl px-4 py-4 text-getgrub-navy border border-gray-200"
                />
              </View>

              <View>
                <Text className="text-getgrub-navy font-medium mb-2">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="bg-white rounded-2xl px-4 py-4 text-getgrub-navy border border-gray-200"
                />
              </View>

              <View>
                <Text className="text-getgrub-navy font-medium mb-2">Confirm password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="bg-white rounded-2xl px-4 py-4 text-getgrub-navy border border-gray-200"
                />
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading || !email || !password || !confirmPassword}
                className={`bg-getgrub-coral rounded-2xl py-4 items-center mt-2 ${isLoading || !email || !password || !confirmPassword ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-bold text-lg">{isLoading ? 'Creating account...' : 'Sign up free'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} className="items-center py-2">
                <Text className="text-gray-500">Already have an account? <Text className="text-getgrub-coral font-semibold">Sign in</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
