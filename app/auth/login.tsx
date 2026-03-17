import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const [mode,     setMode]     = useState<Mode>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const narrow = width < 400;

  async function login() {
    setLoading(true);
    logger.info('auth', 'login attempt', { email });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { logger.error('auth', 'login failed', error.message); return Alert.alert('Error', error.message); }
    logger.info('auth', 'login ok');
    router.replace('/(tabs)/');
  }

  async function register() {
    if (!username.trim()) return Alert.alert('Error', 'Elige un nombre de usuario');
    if (username.length < 3)  return Alert.alert('Error', 'El usuario debe tener al menos 3 caracteres');
    setLoading(true);
    logger.info('auth', 'register attempt', { email, username });

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username.trim().toLowerCase() } },
    });
    if (error) {
      setLoading(false);
      logger.error('auth', 'signUp failed', error.message);
      return Alert.alert('Error', error.message);
    }

    logger.info('auth', 'register ok', { username });
    setLoading(false);
    Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar tu cuenta.');
  }

  return (
    <View style={s.wrap}>
      <Text style={[s.title, narrow && s.titleSm]}>⛽ GasRank</Text>

      {/* Toggle */}
      <View style={s.toggle}>
        <TouchableOpacity style={[s.tab, mode === 'login' && s.tabOn]} onPress={() => setMode('login')}>
          <Text style={[s.tabTxt, mode === 'login' && s.tabTxtOn]}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, mode === 'register' && s.tabOn]} onPress={() => setMode('register')}>
          <Text style={[s.tabTxt, mode === 'register' && s.tabTxtOn]}>Registrarse</Text>
        </TouchableOpacity>
      </View>

      {mode === 'register' && (
        <TextInput style={s.input} placeholder="Nombre de usuario" value={username}
          onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
      )}
      <TextInput style={s.input} placeholder="Correo" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Contraseña" value={password}
        onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={s.btn} onPress={mode === 'login' ? login : register} disabled={loading}>
        <Text style={s.btnTxt}>{loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title:     { fontSize: 36, fontWeight: '800', textAlign: 'center', marginBottom: 32, color: '#22c55e' },
  titleSm:   { fontSize: 28 },
  toggle:    { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, overflow: 'hidden' },
  tab:       { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#f8fafc' },
  tabOn:     { backgroundColor: '#22c55e' },
  tabTxt:    { color: '#64748b', fontWeight: '600' },
  tabTxtOn:  { color: '#fff' },
  input:     { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  btn:       { backgroundColor: '#22c55e', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnTxt:    { color: '#fff', fontWeight: '700', fontSize: 16 },
});
