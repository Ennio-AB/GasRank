import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

const FUELS = ['Regular', 'Premium', 'Gasoil Óptimo', 'Gasoil Regular'];

type Price = { id: string; fuel_type: string; price: number; created_at: string };
type Props  = { stationId: string; prices: Price[]; onSubmit: () => void };

export default function PriceReport({ stationId, prices, onSubmit }: Props) {
  const [fuel,    setFuel]    = useState(FUELS[0]);
  const [price,   setPrice]   = useState('');
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  // Latest price per fuel type
  const latest: Record<string, Price> = {};
  for (const p of prices) {
    if (!latest[p.fuel_type]) latest[p.fuel_type] = p;
  }
  const cards = Object.values(latest);

  async function submit() {
    const val = parseFloat(price);
    if (!val || val <= 0) return Alert.alert('Ingresa un precio válido');
    setLoading(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) logger.error('prices', 'getUser failed', authErr.message);
      if (!user) { setLoading(false); return Alert.alert('Debes iniciar sesión'); }
      logger.info('prices', 'reporting price', { stationId, fuel, price: val });
      const { error } = await supabase.from('prices').insert({ station_id: stationId, user_id: user.id, fuel_type: fuel, price: val });
      if (error) { logger.error('prices', 'insert failed', error.message); Alert.alert('Error', error.message); }
      else { logger.info('prices', 'ok'); setPrice(''); setOpen(false); onSubmit(); }
    } catch (e) { logger.error('prices', 'exception', e); }
    finally { setLoading(false); }
  }

  return (
    <View>
      <Text style={s.section}>Precios Actuales</Text>

      {/* Price cards */}
      {cards.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cards}>
          {cards.map((p) => (
            <View key={p.id} style={s.card}>
              <Text style={s.cardFuel}>{p.fuel_type}</Text>
              <Text style={s.cardPrice}>RD${p.price}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={s.empty}>Sin precios reportados aún</Text>
      )}

      {/* Toggle form */}
      <TouchableOpacity style={s.reportBtn} onPress={() => setOpen(!open)}>
        <Text style={s.reportTxt}>{open ? 'Cancelar' : '+ Reportar precio'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={s.form}>
          <View style={s.fuels}>
            {FUELS.map((f) => (
              <TouchableOpacity key={f} style={[s.tag, f === fuel && s.tagOn]} onPress={() => setFuel(f)}>
                <Text style={[s.tagTxt, f === fuel && s.tagTxtOn]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            <TextInput style={s.input} placeholder="Precio RD$" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
              <Text style={s.btnTxt}>{loading ? '...' : 'Reportar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  section:    { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 14 },
  cards:      { flexDirection: 'row', marginBottom: 12 },
  card:       { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, marginRight: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', minWidth: 90 },
  cardFuel:   { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 6 },
  cardPrice:  { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  empty:      { color: '#94a3b8', fontSize: 14, marginBottom: 12 },
  reportBtn:  { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#22c55e' },
  reportTxt:  { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  form:       { marginTop: 14 },
  fuels:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:        { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagOn:      { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  tagTxt:     { fontSize: 12, color: '#64748b' },
  tagTxtOn:   { color: '#fff', fontWeight: '600' },
  row:        { flexDirection: 'row', gap: 8 },
  input:      { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15 },
  btn:        { backgroundColor: '#22c55e', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  btnTxt:     { color: '#fff', fontWeight: '700' },
});
