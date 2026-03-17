import { StyleSheet, Text, View } from 'react-native';

export default function MapScreenWeb() {
  return (
    <View style={s.wrap}>
      <Text style={s.icon}>⛽</Text>
      <Text style={s.title}>GasRank</Text>
      <Text style={s.sub}>Abre la app en tu celular con Expo Go para ver el mapa.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  icon:  { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  sub:   { fontSize: 15, color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },
});
