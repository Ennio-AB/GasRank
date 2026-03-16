import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../store/auth';
import { useStations } from '../store/stations';

export default function RootLayout() {
  const { init } = useAuth();
  const { load } = useStations();

  useEffect(() => {
    init();
    load();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="station/[id]" options={{ headerShown: true, title: 'Bomba' }} />
      <Stack.Screen name="auth/login"   options={{ headerShown: false }} />
    </Stack>
  );
}
