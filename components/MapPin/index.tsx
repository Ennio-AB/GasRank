import { StyleSheet, Text, View } from 'react-native';

type Props = { brand?: string; avg_rating?: number; selected?: boolean };

export default function MapPin({ brand, avg_rating, selected }: Props) {
  const label = avg_rating != null
    ? `★ ${avg_rating.toFixed(1)}`
    : (brand ? brand.slice(0, 4) : '⛽');

  return (
    <View style={[s.bubble, selected && s.bubbleSel, avg_rating == null && !selected && s.bubbleGray]}>
      <Text style={s.txt}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bubble:    { backgroundColor: '#22c55e', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, minWidth: 52, alignItems: 'center' },
  bubbleSel: { backgroundColor: '#15803d', transform: [{ scale: 1.1 }] },
  bubbleGray:{ backgroundColor: '#64748b' },
  txt:       { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 18 },
});
