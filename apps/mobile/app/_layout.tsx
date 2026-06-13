import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 15_000 },
  },
});

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="deal/[id]" />
            <Stack.Screen name="claim/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="feedback/[claimId]" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="dark" />
        </AuthBootstrap>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
