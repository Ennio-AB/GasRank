import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';
import { useProfile } from '../../store/profile';

type MenuItem = { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; action?: () => void; danger?: boolean; right?: string };

export default function ProfileScreen() {
  const { user }    = useAuth();
  const { profile } = useProfile();
  const router      = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={s.hint}>Inicia sesión para ver tu perfil</Text>
        <TouchableOpacity style={s.greenBtn} onPress={() => router.push('/auth/login')}>
          <Text style={s.greenBtnTxt}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'Usuario';
  const initial = displayName[0].toUpperCase();

  const sections: MenuItem[][] = [
    [
      { icon: 'person-outline',   label: 'Información personal' },
      { icon: 'shield-outline',   label: 'Seguridad' },
      { icon: 'language-outline', label: 'Idioma', right: 'Español' },
    ],
    [
      { icon: 'help-circle-outline', label: 'Centro de ayuda' },
      { icon: 'document-text-outline', label: 'Política de privacidad' },
      { icon: 'information-circle-outline', label: 'Acerca de GasRank' },
    ],
    [
      { icon: 'log-out-outline', label: 'Cerrar sesión', action: logout, danger: true },
    ],
  ];

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.header}>Cuenta</Text>

      {/* Avatar row */}
      <TouchableOpacity style={s.avatarRow}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initial}</Text>
        </View>
        <View style={s.avatarInfo}>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </TouchableOpacity>

      {/* Menu sections */}
      {sections.map((group, gi) => (
        <View key={gi} style={s.section}>
          {group.map((item, ii) => (
            <TouchableOpacity key={ii} style={[s.item, ii < group.length - 1 && s.itemBorder]} onPress={item.action}>
              <View style={[s.iconWrap, item.danger && s.iconDanger]}>
                <Ionicons name={item.icon} size={18} color={item.danger ? '#ef4444' : '#22c55e'} />
              </View>
              <Text style={[s.itemLabel, item.danger && s.itemDanger]}>{item.label}</Text>
              <View style={s.itemRight}>
                {item.right && <Text style={s.itemRightTxt}>{item.right}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:        { flex: 1, backgroundColor: '#f8fafc' },
  content:     { padding: 20, paddingBottom: 40 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header:      { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  hint:        { fontSize: 15, color: '#64748b', marginBottom: 24, textAlign: 'center' },
  greenBtn:    { backgroundColor: '#22c55e', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  greenBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  avatarRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  avatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarTxt:   { color: '#fff', fontSize: 24, fontWeight: '800' },
  avatarInfo:  { flex: 1 },
  name:        { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  email:       { fontSize: 13, color: '#64748b', marginTop: 2 },
  section:     { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  item:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  itemBorder:  { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconWrap:    { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconDanger:  { backgroundColor: '#fef2f2' },
  itemLabel:   { flex: 1, fontSize: 14, fontWeight: '500', color: '#1e293b' },
  itemDanger:  { color: '#ef4444' },
  itemRight:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemRightTxt:{ fontSize: 13, color: '#94a3b8' },
});
