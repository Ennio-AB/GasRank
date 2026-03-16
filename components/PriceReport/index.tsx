import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const FUELS = ['Regular', 'Premium', 'Gasoil Óptimo', 'Gasoil Regular'];

type Price = { id: string; fuel_type: string; price: number; created_at: string };
type Props  = { stationId: string; prices: Price[]; onSubmit: () => void };

export default function PriceReport({ stationId, prices, onSubmit }: Props) {
  const [fuel,    setFuel]    = useState(FUELS[0]);
  const [price,   setPrice]   = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    const val = parseFloat(price);
    if (!val || val <= 0) return Alert.alert('Ingresa un precio válido');

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return Alert.alert('Debes iniciar sesión'); }

    await supabase.from('prices').insert({ station_id: stationId, user_id: user.id, fuel_type: fuel, price: val });
    setPrice('');
    setLoading(false);
    onSubmit();
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Precios</Text>

      {/* Recent prices */}
      {prices.map((p) => (
        <View key={p.id} style={s.row}>
          <Text style={s.fuel}>{p.fuel_type}</Text>
          <Text style={s.val}>RD${p.price}</Text>
        </View>
      ))}

      {/* Report form */}
      <View style={s.fuels}>
        {FUELS.map((f) => (
          <TouchableOpacity key={f} style={[s.tag, f === fuel && s.tagOn]} onPress={() => setFuel(f)}>
            <Text style={[s.tagTxt, f === fuel && s.tagTxtOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.form}>
        <TextInput style={s.input} placeholder="Precio RD$" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
          <Text style={s.btnTxt}>Reportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { marginBottom: 24 },
  title:     { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  fuel:      { fontSize: 14, color: '#555' },
  val:       { fontSize: 14, fontWeight: '600' },
  fuels:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
  tag:       { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagOn:     { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tagTxt:    { fontSize: 12, color: '#555' },
  tagTxtOn:  { color: '#fff' },
  form:      { flexDirection: 'row', gap: 8 },
  input:     { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  btn:       { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, justifyContent: 'center' },
  btnTxt:    { color: '#fff', fontWeight: '600' },
});
