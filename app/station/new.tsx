import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useStations } from '../../store/stations';
import { useAuth } from '../../store/auth';
import { logger } from '../../lib/logger';

const BRANDS = ['Esso', 'Shell', 'Puma', 'Maxim', 'Sunix', 'Otra'];

export default function NewStationScreen() {
  const params = useLocalSearchParams<{
    prefill_name?: string; prefill_brand?: string;
    prefill_address?: string; prefill_lat?: string; prefill_lng?: string;
  }>();

  const [name,    setName]    = useState(params.prefill_name    ?? '');
  const [brand,   setBrand]   = useState(params.prefill_brand   ?? '');
  const [address, setAddress] = useState(params.prefill_address ?? '');
  const [lat,     setLat]     = useState(params.prefill_lat     ?? '');
  const [lng,     setLng]     = useState(params.prefill_lng     ?? '');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const router = useRouter();
  const { add } = useStations();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  async function useMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permiso denegado', 'Activa la ubicación para usar esta función.');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLat(loc.coords.latitude.toFixed(6));
      setLng(loc.coords.longitude.toFixed(6));
      logger.info('new-station', 'location used', { lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (e) {
      logger.error('new-station', 'location error', e);
    } finally {
      setLocating(false);
    }
  }

  async function submit() {
    if (!name.trim()) return Alert.alert('Escribe el nombre de la bomba');
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) return Alert.alert('Coordenadas inválidas', 'Usa el botón de ubicación o escríbelas manualmente.');
    if (!user) return Alert.alert('Debes iniciar sesión');

    setLoading(true);
    const id = await add({ name: name.trim(), brand: brand || undefined, address: address.trim() || undefined, lat: latN, lng: lngN });
    setLoading(false);

    if (id) {
      router.replace(`/station/${id}`);
    } else {
      Alert.alert('Error', 'No se pudo agregar la bomba.');
    }
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={[s.content, { maxWidth: Math.min(width, 600), alignSelf: 'center', width: '100%' }]}>
      <Text style={s.title}>Nueva Bomba</Text>

      <Text style={s.label}>Nombre *</Text>
      <TextInput style={s.input} placeholder="Ej: Bomba La Nacional" value={name} onChangeText={setName} />

      <Text style={s.label}>Marca</Text>
      <View style={s.brands}>
        {BRANDS.map((b) => (
          <TouchableOpacity key={b} style={[s.tag, brand === b && s.tagOn]} onPress={() => setBrand(brand === b ? '' : b)}>
            <Text style={[s.tagTxt, brand === b && s.tagTxtOn]}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Dirección</Text>
      <TextInput style={s.input} placeholder="Ej: Av. 27 de Febrero, Santo Domingo" value={address} onChangeText={setAddress} />

      <Text style={s.label}>Ubicación *</Text>
      <TouchableOpacity style={s.locBtn} onPress={useMyLocation} disabled={locating}>
        <Text style={s.locTxt}>{locating ? 'Obteniendo ubicación...' : '📍  Usar mi ubicación actual'}</Text>
      </TouchableOpacity>

      <View style={s.coords}>
        <TextInput style={[s.input, s.coordInput]} placeholder="Latitud" value={lat} onChangeText={setLat} keyboardType="decimal-pad" />
        <TextInput style={[s.input, s.coordInput]} placeholder="Longitud" value={lng} onChangeText={setLng} keyboardType="decimal-pad" />
      </View>

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={submit} disabled={loading}>
        <Text style={s.btnTxt}>{loading ? 'Guardando...' : 'Agregar bomba'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: '#fff' },
  content:    { padding: 20 },
  title:      { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  label:      { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 14 },
  input:      { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 13, fontSize: 15, color: '#1e293b' },
  brands:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:        { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tagOn:      { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  tagTxt:     { fontSize: 13, color: '#64748b' },
  tagTxtOn:   { color: '#fff', fontWeight: '600' },
  locBtn:     { backgroundColor: '#eff6ff', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  locTxt:     { color: '#22c55e', fontWeight: '600', fontSize: 14 },
  coords:     { flexDirection: 'row', gap: 10, marginTop: 10 },
  coordInput: { flex: 1 },
  btn:        { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  btnOff:     { backgroundColor: '#94a3b8' },
  btnTxt:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
