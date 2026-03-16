import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function login() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    router.replace('/(tabs)/');
  }

  async function register() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar tu cuenta.');
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>GasRank</Text>
      <TextInput style={s.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={s.btn} onPress={login} disabled={loading}>
        <Text style={s.btnTxt}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={register} disabled={loading}>
        <Text style={s.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:   { flex: 1, padding: 24, justifyContent: 'center' },
  title:  { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 32, color: '#2563eb' },
  input:  { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn:    { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnTxt: { color: '#fff', fontWeight: '600' },
  link:   { textAlign: 'center', color: '#2563eb' },
});
