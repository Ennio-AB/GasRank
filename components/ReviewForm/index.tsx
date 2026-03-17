import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

type Review = { id: string; rating: number; comment?: string; created_at: string; profiles?: { username?: string } };
type Props   = { stationId: string; reviews: Review[]; onSubmit: () => void; verifiedUsers: Set<string>; canReview: boolean };

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1)  return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  if (days < 7)  return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'Hace 1 semana';
  if (weeks < 4)   return `Hace ${weeks} semanas`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
}

function Avatar({ name }: { name: string }) {
  const initial = (name?.[0] ?? '?').toUpperCase();
  return (
    <View style={s.avatar}>
      <Text style={s.avatarTxt}>{initial}</Text>
    </View>
  );
}

export default function ReviewForm({ stationId, reviews, onSubmit, verifiedUsers, canReview }: Props) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  async function submit() {
    if (!rating) return Alert.alert('Selecciona una calificación');
    setLoading(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) logger.error('reviews', 'getUser failed', authErr.message);
      if (!user) { setLoading(false); return Alert.alert('Debes iniciar sesión'); }

      logger.info('reviews', 'submitting', { stationId, rating });
      const { error } = await supabase.from('reviews').insert({ station_id: stationId, user_id: user.id, rating, comment });
      if (error) { logger.error('reviews', 'insert failed', error.message); Alert.alert('Error', error.message); }
      else { logger.info('reviews', 'ok'); setRating(0); setComment(''); setOpen(false); onSubmit(); }
    } catch (e) { logger.error('reviews', 'exception', e); }
    finally { setLoading(false); }
  }

  return (
    <View>
      <View style={s.header}>
        <Text style={s.section}>Reseñas Recientes</Text>
        {canReview && (
          <TouchableOpacity style={s.addBtn} onPress={() => setOpen(!open)}>
            <Text style={s.addTxt}>{open ? 'Cancelar' : '+ Reseña'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form */}
      {open && (
        <View style={s.form}>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={[s.star, n <= rating && s.starOn]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={s.input} placeholder="Comentario (opcional)" value={comment} onChangeText={setComment} multiline />
          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={submit} disabled={loading}>
            <Text style={s.btnTxt}>{loading ? 'Enviando...' : 'Enviar reseña'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Review list */}
      {reviews.map((rv) => {
        const username = rv.profiles?.username ?? 'Usuario';
        const verified = verifiedUsers.has((rv as any).user_id);
        return (
          <View key={rv.id} style={s.item}>
            <Avatar name={username} />
            <View style={s.itemBody}>
              <View style={s.itemTop}>
                <View>
                  <Text style={s.username}>{username}</Text>
                  <Text style={s.time}>{timeAgo(rv.created_at)}</Text>
                </View>
                {verified && (
                  <View style={s.badge}>
                    <Text style={s.badgeTxt}>✓ Verificada</Text>
                  </View>
                )}
              </View>
              <Text style={s.itemStars}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</Text>
              {rv.comment && <Text style={s.comment}>{rv.comment}</Text>}
            </View>
          </View>
        );
      })}

      {!canReview && (
        <View style={s.lockedBox}>
          <Text style={s.lockedTxt}>🔒 Sube tu factura para dejar una reseña</Text>
        </View>
      )}
      {reviews.length === 0 && (
        <Text style={s.empty}>Sin reseñas aún.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  section:   { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  addBtn:    { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#22c55e' },
  addTxt:    { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  form:      { marginBottom: 16 },
  stars:     { flexDirection: 'row', marginBottom: 10 },
  star:      { fontSize: 28, color: '#ddd', marginRight: 4 },
  starOn:    { color: '#f59e0b' },
  input:     { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15, minHeight: 70 },
  btn:       { backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnOff:    { backgroundColor: '#94a3b8' },
  btnTxt:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  item:      { flexDirection: 'row', paddingVertical: 14, borderTopWidth: 1, borderColor: '#f1f5f9', gap: 12 },
  avatar:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  itemBody:  { flex: 1 },
  itemTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  username:  { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  time:      { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  badge:     { backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:  { fontSize: 11, color: '#16a34a', fontWeight: '700' },
  itemStars: { color: '#f59e0b', fontSize: 16, marginBottom: 4 },
  comment:   { fontSize: 14, color: '#475569', lineHeight: 20 },
  empty:     { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },
  lockedBox: { backgroundColor: '#fef9c3', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  lockedTxt: { color: '#92400e', fontSize: 13, fontWeight: '600' },
});
