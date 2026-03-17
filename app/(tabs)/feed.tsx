import { useEffect, useState, useCallback } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

type Post = {
  id: string;
  type: 'review' | 'receipt' | 'price';
  station_id: string;
  station_name?: string;
  username?: string;
  rating?: number;
  comment?: string;
  fuel_type?: string;
  price?: number;
  image_url?: string;
  created_at: string;
};

export default function FeedScreen() {
  const [posts,      setPosts]     = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const load = useCallback(async () => {
    try {
      logger.info('feed', 'loading...');
      const [{ data: reviews }, { data: prices }, { data: receipts }] = await Promise.all([
        supabase.from('reviews').select('id, station_id, rating, comment, created_at, profiles(username), stations(name)')
          .order('created_at', { ascending: false }).limit(30),
        supabase.from('prices').select('id, station_id, fuel_type, price, created_at, profiles(username), stations(name)')
          .order('created_at', { ascending: false }).limit(30),
        supabase.from('receipts').select('id, station_id, fuel_type, price, image_url, created_at, profiles(username), stations(name)')
          .order('created_at', { ascending: false }).limit(30),
      ]);

      const all: Post[] = [
        ...(reviews ?? []).map((r: any) => ({
          id: `rv-${r.id}`, type: 'review' as const,
          station_id: r.station_id, station_name: r.stations?.name,
          username: r.profiles?.username, rating: r.rating, comment: r.comment,
          created_at: r.created_at,
        })),
        ...(prices ?? []).map((p: any) => ({
          id: `pr-${p.id}`, type: 'price' as const,
          station_id: p.station_id, station_name: p.stations?.name,
          username: p.profiles?.username, fuel_type: p.fuel_type, price: p.price,
          created_at: p.created_at,
        })),
        ...(receipts ?? []).map((rc: any) => ({
          id: `rc-${rc.id}`, type: 'receipt' as const,
          station_id: rc.station_id, station_name: rc.stations?.name,
          username: rc.profiles?.username, fuel_type: rc.fuel_type, price: rc.price,
          image_url: rc.image_url, created_at: rc.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      logger.info('feed', `loaded ${all.length} posts`);
      setPosts(all);
    } catch (e) {
      logger.error('feed', 'load exception', e);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'ahora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  function renderPost({ item }: { item: Post }) {
    return (
      <TouchableOpacity style={[s.card, { width: width - 32 }]} onPress={() => router.push(`/station/${item.station_id}`)}>
        {/* Header */}
        <View style={s.head}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{(item.username ?? '?')[0].toUpperCase()}</Text>
          </View>
          <View style={s.headInfo}>
            <Text style={s.username}>@{item.username ?? 'anónimo'}</Text>
            <Text style={s.stName}>{item.station_name ?? 'Bomba'}</Text>
          </View>
          <Text style={s.time}>{timeAgo(item.created_at)}</Text>
        </View>

        {/* Content */}
        {item.type === 'review' && (
          <View>
            <Text style={s.stars}>{'★'.repeat(item.rating ?? 0)}{'☆'.repeat(5 - (item.rating ?? 0))}</Text>
            {item.comment ? <Text style={s.comment}>{item.comment}</Text> : null}
          </View>
        )}

        {item.type === 'price' && (
          <View style={s.priceRow}>
            <Text style={s.tag}>{item.fuel_type}</Text>
            <Text style={s.priceVal}>RD${item.price}</Text>
          </View>
        )}

        {item.type === 'receipt' && (
          <View>
            {item.image_url && <Image source={{ uri: item.image_url }} style={[s.img, { width: width - 64 }]} />}
            {item.fuel_type && (
              <View style={s.priceRow}>
                <Text style={s.tag}>{item.fuel_type}</Text>
                {item.price ? <Text style={s.priceVal}>RD${item.price}</Text> : null}
              </View>
            )}
          </View>
        )}

        {/* Badge */}
        <View style={[s.badge, item.type === 'review' ? s.badgeReview : item.type === 'receipt' ? s.badgeReceipt : s.badgePrice]}>
          <Text style={s.badgeTxt}>
            {item.type === 'review' ? 'Review' : item.type === 'receipt' ? 'Factura' : 'Precio'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Feed</Text>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={renderPost}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={s.empty}>Sin actividad aún</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:        { flex: 1, backgroundColor: '#f8fafc' },
  title:       { fontSize: 22, fontWeight: '800', padding: 16, paddingBottom: 8, color: '#1e293b' },
  list:        { padding: 16, gap: 12 },
  card:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  head:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarTxt:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  headInfo:    { flex: 1 },
  username:    { fontWeight: '700', color: '#1e293b', fontSize: 14 },
  stName:      { fontSize: 12, color: '#64748b' },
  time:        { fontSize: 12, color: '#94a3b8' },
  stars:       { color: '#f59e0b', fontSize: 20, marginBottom: 4 },
  comment:     { color: '#334155', fontSize: 14 },
  priceRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  tag:         { backgroundColor: '#eff6ff', color: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 13, fontWeight: '600' },
  priceVal:    { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  img:         { height: 180, borderRadius: 10, marginBottom: 8, resizeMode: 'cover' },
  badge:       { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeReview: { backgroundColor: '#fef9c3' },
  badgeReceipt:{ backgroundColor: '#dcfce7' },
  badgePrice:  { backgroundColor: '#eff6ff' },
  badgeTxt:    { fontSize: 11, fontWeight: '600', color: '#475569' },
  empty:       { textAlign: 'center', color: '#94a3b8', marginTop: 60, fontSize: 15 },
});
