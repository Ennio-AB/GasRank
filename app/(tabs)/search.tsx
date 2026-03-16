import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStations } from '../../store/stations';
import StationCard from '../../components/StationCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { stations } = useStations();
  const router = useRouter();

  const results = stations.filter((st) =>
    st.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={s.wrap}>
      <TextInput
        style={s.input}
        placeholder="Buscar bomba..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StationCard station={item} onPress={() => router.push(`/station/${item.id}`)} />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
});
