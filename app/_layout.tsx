import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../store/auth';
import { useStations } from '../store/stations';
import { logger } from '../lib/logger';

// Catch unhandled JS errors globally
if (typeof ErrorUtils !== 'undefined') {
  const prev = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error('global', isFatal ? 'FATAL' : 'unhandled error', {
      message: error?.message,
      stack:   error?.stack,
    });
    prev?.(error, isFatal);
  });
}

export default function RootLayout() {
  const { init, user } = useAuth();
  const { load }       = useStations();
  const router         = useRouter();
  const segments       = useSegments();

  useEffect(() => {
    logger.load().then(() => {
      logger.info('app', 'started');
      init();
      load();
    });
  }, []);

  // Redirect authenticated users away from login
  useEffect(() => {
    const inAuth = segments[0] === 'auth';
    if (user && inAuth) {
      router.replace('/(tabs)/');
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="station/[id]" options={{ headerShown: true, title: 'Bomba' }} />
      <Stack.Screen name="station/new"  options={{ headerShown: true, title: 'Nueva Bomba' }} />
      <Stack.Screen name="auth/login"   options={{ headerShown: false }} />
    </Stack>
  );
}
