import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }

  if (!user) {
    return (
      <View style={s.wrap}>
        <TouchableOpacity style={s.btn} onPress={() => router.push('/auth/login')}>
          <Text style={s.btnTxt}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.email}>{user.email}</Text>
      <TouchableOpacity style={[s.btn, s.outline]} onPress={logout}>
        <Text style={s.outlineTxt}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  email:      { fontSize: 16, marginBottom: 24, color: '#333' },
  btn:        { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnTxt:     { color: '#fff', fontWeight: '600' },
  outline:    { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ef4444' },
  outlineTxt: { color: '#ef4444', fontWeight: '600' },
});
