import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { useStations } from '../../store/stations';
import { useAuth } from '../../store/auth';
import ReviewForm from '../../components/ReviewForm';
import PriceReport from '../../components/PriceReport';
import ReceiptUpload from '../../components/ReceiptUpload';

export default function StationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { width } = useWindowDimensions();
  const { load: reloadStations } = useStations();
  const { user } = useAuth();

  const [station,  setStation]  = useState<any>(null);
  const [reviews,  setReviews]  = useState<any[]>([]);
  const [prices,   setPrices]   = useState<any[]>([]);
  const [rating,   setRating]   = useState<{ avg: number; total: number } | null>(null);
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());

  useEffect(() => { loadStation(); }, [id]);

  async function loadStation() {
    logger.info('station', 'loading', { id });
    const [{ data: st, error: stErr }, { data: rv }, { data: pr }, { data: rt }, { data: ph }] =
      await Promise.all([
        supabase.from('stations').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*, profiles(username)').eq('station_id', id).order('created_at', { ascending: false }).limit(20),
        supabase.from('prices').select('*').eq('station_id', id).order('created_at', { ascending: false }).limit(20),
        supabase.from('station_ratings').select('avg_rating, total').eq('station_id', id).maybeSingle(),
        supabase.from('photos').select('user_id').eq('station_id', id),
      ]);

    if (stErr) logger.error('station', 'load failed', stErr.message);
    if (st) setStation(st);
    if (rv) setReviews(rv);
    if (pr) setPrices(pr);
    if (rt) setRating({ avg: parseFloat(rt.avg_rating), total: parseInt(rt.total) });
    if (ph) setVerifiedUsers(new Set(ph.map((p: any) => p.user_id)));
  }

  async function onSubmit() {
    await loadStation();
    reloadStations();
  }

  if (!station) return (
    <View style={s.loading}><Text style={s.loadingTxt}>Cargando...</Text></View>
  );

  const stars = rating ? Math.round(rating.avg) : 0;

  return (
    <ScrollView style={s.wrap} stickyHeaderIndices={[0]}>
      {/* Mini mapa */}
      <View style={s.mapWrap}>
        <MapView
          style={s.map}
          initialRegion={{ latitude: station.lat, longitude: station.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
          showsUserLocation={false}
        >
          <Marker coordinate={{ latitude: station.lat, longitude: station.lng }} />
        </MapView>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={[s.info, { paddingHorizontal: width < 400 ? 16 : 20, maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
        <Text style={s.name}>{station.name}</Text>
        {station.brand && <Text style={s.brand}>{station.brand}</Text>}
        {station.address && <Text style={s.addr}>📍 {station.address}</Text>}

        {rating && (
          <View style={s.ratingRow}>
            <Text style={s.stars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>
            <Text style={s.ratingVal}> {rating.avg.toFixed(1)}</Text>
            <Text style={s.ratingCnt}> ({rating.total} reseñas)</Text>
          </View>
        )}

        <View style={s.divider} />
        <PriceReport   stationId={id} prices={prices}   onSubmit={onSubmit} />
        <View style={s.divider} />
        <ReceiptUpload stationId={id}                   onSubmit={onSubmit} />
        <View style={s.divider} />
        <ReviewForm    stationId={id} reviews={reviews} onSubmit={onSubmit} verifiedUsers={verifiedUsers} canReview={!!user && verifiedUsers.has(user.id)} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: '#fff' },
  loading:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingTxt: { color: '#64748b', fontSize: 15 },
  mapWrap:    { height: 200, position: 'relative' },
  map:        { flex: 1 },
  back:       { position: 'absolute', top: 44, left: 16, backgroundColor: '#fff', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 },
  backTxt:    { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  info:       { paddingTop: 16, paddingBottom: 40 },
  name:       { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  brand:      { fontSize: 13, color: '#22c55e', fontWeight: '700', marginBottom: 4 },
  addr:       { fontSize: 13, color: '#64748b', marginBottom: 10 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stars:      { color: '#f59e0b', fontSize: 18 },
  ratingVal:  { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  ratingCnt:  { fontSize: 13, color: '#94a3b8' },
  divider:    { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
});
