import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Station = { id: string; name: string; brand?: string; address?: string; avg_rating?: number; total_reviews?: number };
type Props = { station: Station; onPress: () => void; distance?: string; hours?: string };

export default function StationCard({ station, onPress, distance, hours }: Props) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.iconWrap}>
        <Ionicons name="car" size={20} color="#22c55e" />
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{station.name}</Text>
        {station.brand && <Text style={s.brand}>{station.brand}</Text>}
        {station.avg_rating != null && (
          <View style={s.ratingRow}>
            <Text style={s.stars}>{'★'.repeat(Math.round(station.avg_rating))}</Text>
            <Text style={s.ratingVal}> {station.avg_rating.toFixed(1)}</Text>
            {station.total_reviews != null && <Text style={s.reviews}> ({station.total_reviews})</Text>}
          </View>
        )}
      </View>
      <View style={s.right}>
        {distance && <Text style={s.dist}>{distance}</Text>}
        {hours && <Text style={[s.hours, hours === 'Open 24h' && s.open]}>{hours}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  iconWrap:  { width: 42, height: 42, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  brand:     { fontSize: 12, color: '#22c55e', fontWeight: '600', marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  stars:     { color: '#f59e0b', fontSize: 12 },
  ratingVal: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  reviews:   { fontSize: 11, color: '#94a3b8' },
  right:     { alignItems: 'flex-end', marginLeft: 8 },
  dist:      { fontSize: 12, color: '#64748b', fontWeight: '600' },
  hours:     { fontSize: 11, color: '#94a3b8', marginTop: 3 },
  open:      { color: '#22c55e', fontWeight: '600' },
});
