import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

type Review = { id: string; rating: number; comment?: string };
type Props  = { stationId: string; reviews: Review[]; onSubmit: () => void };

export default function ReviewForm({ stationId, reviews, onSubmit }: Props) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!rating) return Alert.alert('Selecciona una calificación');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return Alert.alert('Debes iniciar sesión'); }

    await supabase.from('reviews').insert({ station_id: stationId, user_id: user.id, rating, comment });
    setRating(0);
    setComment('');
    setLoading(false);
    onSubmit();
  }

  async function pickPhoto() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert('Debes iniciar sesión');

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled) return;

    const uri  = result.assets[0].uri;
    const name = `${stationId}/${Date.now()}.jpg`;
    const blob = await fetch(uri).then((r) => r.blob());

    const { data, error } = await supabase.storage.from('photos').upload(name, blob, { contentType: 'image/jpeg' });
    if (error) return Alert.alert('Error al subir foto');

    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(name);
    await supabase.from('photos').insert({ station_id: stationId, user_id: user.id, url: publicUrl });
    Alert.alert('Foto subida');
    onSubmit();
  }

  return (
    <View>
      <Text style={s.title}>Reviews ({reviews.length})</Text>

      {/* Stars */}
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Text style={[s.star, n <= rating && s.starOn]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={s.input} placeholder="Comentario (opcional)" value={comment} onChangeText={setComment} multiline />

      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
          <Text style={s.btnTxt}>Enviar review</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.outline]} onPress={pickPhoto}>
          <Text style={s.outlineTxt}>+ Foto</Text>
        </TouchableOpacity>
      </View>

      {reviews.map((rv) => (
        <View key={rv.id} style={s.item}>
          <Text style={s.stars2}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</Text>
          {rv.comment && <Text style={s.comment}>{rv.comment}</Text>}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  title:    { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  stars:    { flexDirection: 'row', marginBottom: 10 },
  star:     { fontSize: 28, color: '#ddd', marginRight: 4 },
  starOn:   { color: '#f59e0b' },
  input:    { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  row:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btn:      { flex: 1, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnTxt:   { color: '#fff', fontWeight: '600' },
  outline:  { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2563eb' },
  outlineTxt: { color: '#2563eb', fontWeight: '600' },
  item:     { borderTopWidth: 1, borderColor: '#f0f0f0', paddingVertical: 8 },
  stars2:   { color: '#f59e0b', fontSize: 16 },
  comment:  { fontSize: 14, color: '#444', marginTop: 2 },
});
