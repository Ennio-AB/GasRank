import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useStations } from '../../store/stations';
import StationCard from '../../components/StationCard';
import { searchByName, searchNearby, OsmStation } from '../../lib/osm';
import { logger } from '../../lib/logger';

type Tab = 'saved' | 'osm';

export default function SearchScreen() {
  const [tab, setTab]       = useState<Tab>('saved');
  const [query, setQuery]   = useState('');
  const [osm, setOsm]       = useState<OsmStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  const { stations } = useStations();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width < 400 ? 12 : 16;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get user location once for OSM nearby
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then((loc) =>
        setUserLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude })
      );
    });
  }, []);

  // Trigger OSM search when tab=osm or query changes
  useEffect(() => {
    if (tab !== 'osm') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runOsmSearch(query), 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [tab, query, userLoc]);

  async function runOsmSearch(q: string) {
    setLoading(true);
    try {
      const results = q.length >= 2
        ? await searchByName(q, userLoc?.lat, userLoc?.lng)
        : userLoc
          ? await searchNearby(userLoc.lat, userLoc.lng)
          : [];
      setOsm(results);
      logger.info('search-osm', `${results.length} results`, { q });
    } catch (e) {
      logger.error('search-osm', 'failed', e);
    } finally {
      setLoading(false);
    }
  }

  const saved = stations.filter((st) =>
    !query || st.name.toLowerCase().includes(query.toLowerCase()) ||
    st.brand?.toLowerCase().includes(query.toLowerCase())
  );

  // Filter out OSM results already in our DB (match by proximity ~50m)
  const osmFiltered = osm.filter((o) =>
    !stations.some((s) => Math.abs(s.lat - o.lat) < 0.0005 && Math.abs(s.lng - o.lng) < 0.0005)
  );

  function registerOsm(st: OsmStation) {
    router.push({
      pathname: '/station/new',
      params: {
        prefill_name: st.name,
        prefill_brand: st.brand ?? '',
        prefill_address: st.address ?? '',
        prefill_lat: String(st.lat),
        prefill_lng: String(st.lng),
      },
    });
  }

  return (
    <View style={[s.wrap, { padding: pad }]}>
      {/* Tabs */}
      <View style={s.tabs}>
        {(['saved', 'osm'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabOn]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtOn]}>
              {t === 'saved' ? 'Guardadas' : 'OpenStreetMap'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={s.input}
        placeholder={tab === 'saved' ? 'Buscar bomba o marca...' : 'Buscar en OpenStreetMap...'}
        value={query}
        onChangeText={setQuery}
      />

      {tab === 'saved' ? (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StationCard station={item} onPress={() => router.push(`/station/${item.id}`)} />
          )}
        />
      ) : (
        <>
          {loading && <ActivityIndicator style={{ marginTop: 20 }} color="#2563eb" />}
          {!loading && osmFiltered.length === 0 && query.length < 2 && !userLoc && (
            <Text style={s.hint}>Activa la ubicación para ver bombas cercanas</Text>
          )}
          {!loading && osmFiltered.length === 0 && query.length >= 2 && (
            <Text style={s.hint}>No se encontraron resultados en OpenStreetMap</Text>
          )}
          <FlatList
            data={osmFiltered}
            keyExtractor={(item) => item.osmId}
            renderItem={({ item }) => (
              <View style={s.osmCard}>
                <View style={s.osmInfo}>
                  <Text style={s.osmName}>{item.name}</Text>
                  {item.brand && <Text style={s.osmBrand}>{item.brand}</Text>}
                  {item.address && <Text style={s.osmAddr}>{item.address}</Text>}
                </View>
                <TouchableOpacity style={s.regBtn} onPress={() => registerOsm(item)}>
                  <Text style={s.regTxt}>+ Registrar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: '#f8fafc' },
  tabs:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab:        { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#e2e8f0' },
  tabOn:      { backgroundColor: '#2563eb' },
  tabTxt:     { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTxtOn:   { color: '#fff' },
  input:      { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 13, marginBottom: 12, backgroundColor: '#fff', fontSize: 15 },
  hint:       { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
  osmCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4 },
  osmInfo:    { flex: 1 },
  osmName:    { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  osmBrand:   { fontSize: 13, color: '#2563eb', fontWeight: '600', marginTop: 2 },
  osmAddr:    { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  regBtn:     { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 10 },
  regTxt:     { color: '#fff', fontWeight: '700', fontSize: 13 },
});
