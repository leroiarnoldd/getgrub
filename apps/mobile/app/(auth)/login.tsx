import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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

  return (
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            <View className="mb-10">
              <Text className="text-4xl font-black text-getgrub-navy">Get Grub</Text>
              <Text className="text-gray-500 mt-2 text-lg">Eat out more. Spend less.</Text>
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
                  placeholder="Your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="bg-white rounded-2xl px-4 py-4 text-getgrub-navy border border-gray-200"
                />
              </View>

              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isLoading || !email || !password}
                className={`bg-getgrub-coral rounded-2xl py-4 items-center mt-2 ${isLoading || !email || !password ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-bold text-lg">{isLoading ? 'Signing in...' : 'Get Grub'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} className="items-center py-2">
                <Text className="text-gray-500">No account? <Text className="text-getgrub-coral font-semibold">Sign up free</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
