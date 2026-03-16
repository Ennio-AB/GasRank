import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import ReviewForm from '../../components/ReviewForm';
import PriceReport from '../../components/PriceReport';

export default function StationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [station, setStation] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    loadStation();
  }, [id]);

  async function loadStation() {
    const [{ data: st }, { data: rv }, { data: pr }] = await Promise.all([
      supabase.from('stations').select('*').eq('id', id).single(),
      supabase.from('reviews').select('*').eq('station_id', id).order('created_at', { ascending: false }).limit(20),
      supabase.from('prices').select('*').eq('station_id', id).order('created_at', { ascending: false }).limit(5),
    ]);
    if (st) setStation(st);
    if (rv) setReviews(rv);
    if (pr) setPrices(pr);
  }

  if (!station) return <View style={s.wrap}><Text>Cargando...</Text></View>;

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.name}>{station.name}</Text>
      <Text style={s.addr}>{station.address}</Text>

      <PriceReport stationId={id} prices={prices} onSubmit={loadStation} />
      <ReviewForm stationId={id} reviews={reviews} onSubmit={loadStation} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:    { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  name:    { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  addr:    { fontSize: 14, color: '#666', marginBottom: 16 },
});
