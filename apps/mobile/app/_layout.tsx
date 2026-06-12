import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="deal/[id]" />
          <Stack.Screen name="claim/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="feedback/[claimId]" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
