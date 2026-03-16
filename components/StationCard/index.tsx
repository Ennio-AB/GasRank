import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Station = { id: string; name: string; brand?: string; address?: string };

type Props = { station: Station; onPress: () => void };

export default function StationCard({ station, onPress }: Props) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <Text style={s.name}>{station.name}</Text>
      {station.brand   && <Text style={s.brand}>{station.brand}</Text>}
      {station.address && <Text style={s.addr}>{station.address}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:  { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  name:  { fontSize: 16, fontWeight: '600' },
  brand: { fontSize: 13, color: '#2563eb', marginTop: 2 },
  addr:  { fontSize: 12, color: '#888', marginTop: 2 },
});
