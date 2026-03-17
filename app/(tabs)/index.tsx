import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useStations, Station } from '../../store/stations';
import MapPin from '../../components/MapPin';
import { logger } from '../../lib/logger';

const DR_CENTER: Region = {
  latitude: 18.7357, longitude: -70.1627,
  latitudeDelta: 3, longitudeDelta: 3,
};

export default function MapScreen() {
  const { stations } = useStations();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { width } = useWindowDimensions();
  const [located, setLocated] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { requestLocation(); }, []);

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { logger.warn('map', 'location denied'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      mapRef.current?.animateToRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 800);
      setLocated(true);
    } catch (e) { logger.error('map', 'location error', e); }
  }

  const filtered = search.trim()
    ? stations.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.brand?.toLowerCase().includes(search.toLowerCase()))
    : stations;

  return (
    <View style={s.wrap}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={DR_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelected(null)}
      >
        {filtered.map((st) => (
          <Marker
            key={st.id}
            coordinate={{ latitude: st.lat, longitude: st.lng }}
            onPress={() => setSelected(st)}
          >
            <MapPin brand={st.brand} avg_rating={st.avg_rating} selected={selected?.id === st.id} />
          </Marker>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={[s.searchBar, { width: width - 32 }]}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar estación..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* My location */}
      <TouchableOpacity style={s.locBtn} onPress={requestLocation}>
        <Text style={s.locIcon}>◎</Text>
      </TouchableOpacity>

      {/* Add station */}
      <TouchableOpacity style={s.addBtn} onPress={() => router.push('/station/new')}>
        <Text style={s.addTxt}>+ Bomba</Text>
      </TouchableOpacity>

      {/* Bottom card */}
      {selected && (
        <View style={[s.card, { width: width - 32 }]}>
          <View style={s.cardInfo}>
            <Text style={s.cardName} numberOfLines={1}>{selected.name}</Text>
            {selected.brand && <Text style={s.cardBrand}>{selected.brand}</Text>}
            {selected.avg_rating != null && (
              <View style={s.cardRating}>
                <Text style={s.cardStars}>{'★'.repeat(Math.round(selected.avg_rating))}</Text>
                <Text style={s.cardRatingVal}> {selected.avg_rating.toFixed(1)}</Text>
                {selected.total_reviews != null && <Text style={s.cardReviews}> ({selected.total_reviews})</Text>}
              </View>
            )}
          </View>
          <TouchableOpacity style={s.viewBtn} onPress={() => router.push(`/station/${selected.id}`)}>
            <Text style={s.viewTxt}>Ver</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:        { flex: 1 },
  map:         { flex: 1 },
  searchBar:   { position: 'absolute', top: 52, alignSelf: 'center', left: 16, backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },
  locBtn:      { position: 'absolute', bottom: 120, right: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  locIcon:     { fontSize: 22, color: '#fff' },
  addBtn:      { position: 'absolute', bottom: 120, left: 16, backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 24, elevation: 5 },
  addTxt:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  card:        { position: 'absolute', bottom: 24, alignSelf: 'center', left: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 },
  cardInfo:    { flex: 1 },
  cardName:    { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cardBrand:   { fontSize: 12, color: '#22c55e', fontWeight: '600', marginTop: 1 },
  cardRating:  { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardStars:   { color: '#f59e0b', fontSize: 13 },
  cardRatingVal:{ fontSize: 13, fontWeight: '700', color: '#1e293b' },
  cardReviews: { fontSize: 12, color: '#94a3b8' },
  viewBtn:     { backgroundColor: '#22c55e', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, marginLeft: 12 },
  viewTxt:     { color: '#fff', fontWeight: '700', fontSize: 14 },
});
