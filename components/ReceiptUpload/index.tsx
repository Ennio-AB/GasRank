import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

const FUELS = ['Regular', 'Premium', 'Gasoil Óptimo', 'Gasoil Regular'];

type Props = { stationId: string; onSubmit: () => void };

export default function ReceiptUpload({ stationId, onSubmit }: Props) {
  const [image,   setImage]   = useState<string | null>(null);
  const [fuel,    setFuel]    = useState(FUELS[0]);
  const [price,   setPrice]   = useState('');
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  async function pick() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) { setImage(result.assets[0].uri); setOpen(true); }
  }

  async function submit() {
    if (!image) return Alert.alert('Selecciona una foto de la factura');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return Alert.alert('Debes iniciar sesión'); }

      const name = `receipts/${stationId}/${Date.now()}.jpg`;
      logger.info('receipt', 'uploading', { name });
      const blob = await fetch(image).then((r) => r.blob());
      const { error: uploadErr } = await supabase.storage.from('photos').upload(name, blob, { contentType: 'image/jpeg' });
      if (uploadErr) { logger.error('receipt', 'upload failed', uploadErr.message); return Alert.alert('Error al subir la factura'); }

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(name);
      const val = parseFloat(price) || null;
      const { error: dbErr } = await supabase.from('receipts').insert({ station_id: stationId, user_id: user.id, image_url: publicUrl, fuel_type: fuel, price: val });
      if (dbErr) { logger.error('receipt', 'db insert failed', dbErr.message); return Alert.alert('Error', dbErr.message); }

      logger.info('receipt', 'uploaded ok');
      setImage(null); setPrice(''); setOpen(false);
      Alert.alert('✅ Factura subida');
      onSubmit();
    } catch (e) { logger.error('receipt', 'exception', e); }
    finally { setLoading(false); }
  }

  return (
    <View>
      {/* CTA card */}
      <View style={s.cta}>
        <Text style={s.ctaIcon}>🧾</Text>
        <Text style={s.ctaTitle}>Tu opinión importa</Text>
        <Text style={s.ctaSub}>Solo puedes opinar si muestras tu recibo de compra en esta estación.</Text>
        <TouchableOpacity style={s.ctaBtn} onPress={pick}>
          <Text style={s.ctaBtnTxt}>📷  Escanear factura</Text>
        </TouchableOpacity>
      </View>

      {/* Form (visible after picking image) */}
      {open && (
        <View style={s.form}>
          {image && <Image source={{ uri: image }} style={s.preview} />}

          <View style={s.fuels}>
            {FUELS.map((f) => (
              <TouchableOpacity key={f} style={[s.tag, f === fuel && s.tagOn]} onPress={() => setFuel(f)}>
                <Text style={[s.tagTxt, f === fuel && s.tagTxtOn]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={s.input} placeholder="Precio RD$ (opcional)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

          <View style={s.row}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setOpen(false); setImage(null); }}>
              <Text style={s.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={submit} disabled={loading}>
              <Text style={s.btnTxt}>{loading ? 'Subiendo...' : 'Subir factura'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  cta:       { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  ctaIcon:   { fontSize: 32, marginBottom: 8 },
  ctaTitle:  { fontSize: 16, fontWeight: '700', color: '#15803d', marginBottom: 4 },
  ctaSub:    { fontSize: 13, color: '#166534', textAlign: 'center', marginBottom: 14, lineHeight: 18 },
  ctaBtn:    { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  ctaBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  form:      { marginTop: 16 },
  preview:   { width: '100%', height: 160, borderRadius: 12, resizeMode: 'cover', marginBottom: 12 },
  fuels:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:       { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagOn:     { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  tagTxt:    { fontSize: 12, color: '#64748b' },
  tagTxtOn:  { color: '#fff', fontWeight: '600' },
  input:     { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  row:       { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  cancelTxt: { color: '#64748b', fontWeight: '600' },
  btn:       { flex: 2, backgroundColor: '#22c55e', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnOff:    { backgroundColor: '#94a3b8' },
  btnTxt:    { color: '#fff', fontWeight: '700' },
});
