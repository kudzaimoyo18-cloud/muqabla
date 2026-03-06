import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not signed in and not on an auth screen — redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Signed in but still on an auth screen — go to feed
      router.replace('/(tabs)/feed');
    }
  }, [user, isInitialized, isLoading, segments]);
}

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useProtectedRoute();

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <View style={styles.logo}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
