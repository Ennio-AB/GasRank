import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStations } from '../../store/stations';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; iconOn: IconName }[] = [
  { name: 'index',   title: 'Inicio',  icon: 'home-outline',      iconOn: 'home' },
  { name: 'feed',    title: 'Feed',    icon: 'newspaper-outline',  iconOn: 'newspaper' },
  { name: 'search',  title: 'Buscar',  icon: 'search-outline',     iconOn: 'search' },
  { name: 'profile', title: 'Cuenta',  icon: 'person-outline',     iconOn: 'person' },
  { name: 'logs',    title: 'Logs',    icon: 'terminal-outline',   iconOn: 'terminal' },
];

export default function TabLayout() {
  const { load } = useStations();
  useEffect(() => { load(); }, []);

  return (
    <Tabs screenOptions={({ route }) => {
      const tab = TABS.find((t) => t.name === route.name);
      return {
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { borderTopColor: '#f1f5f9', backgroundColor: '#fff', height: 60 },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? tab?.iconOn ?? tab?.icon : tab?.icon ?? 'ellipse-outline'} size={size} color={color} />
        ),
      };
    }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}
