import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DstackProvider } from '@dstack/react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

const dstackConfig = {
  apiEndpoint: process.env.EXPO_PUBLIC_API_ENDPOINT || 'http://localhost:4000',
  appNamespace: 'the-accountant-mobile',
  debug: __DEV__,
};

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#CDFF6A', // Phala lime
    background: '#0A0E27',
    surface: '#14182E',
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <DstackProvider config={dstackConfig}>
        <PaperProvider theme={theme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#14182E',
              },
              headerTintColor: '#CDFF6A',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'The Accountant',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="signup"
              options={{
                title: 'Create Wallet',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="sign"
              options={{
                title: 'Sign Message',
              }}
            />
            <Stack.Screen
              name="verify"
              options={{
                title: 'Verify Signature',
              }}
            />
            <Stack.Screen
              name="audit"
              options={{
                title: 'Audit Logs',
              }}
            />
          </Stack>
        </PaperProvider>
      </DstackProvider>
    </QueryClientProvider>
  );
}
