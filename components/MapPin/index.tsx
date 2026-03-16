import { StyleSheet, Text, View } from 'react-native';

type Props = { brand?: string };

export default function MapPin({ brand }: Props) {
  return (
    <View style={s.pin}>
      <Text style={s.txt}>{brand ? brand[0] : '⛽'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pin: { backgroundColor: '#2563eb', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  txt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
