import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useStations } from '../../store/stations';
import MapPin from '../../components/MapPin';

export default function MapScreen() {
  const { stations } = useStations();

  return (
    <View style={s.wrap}>
      <MapView style={s.map} initialRegion={DR_CENTER}>
        {stations.map((st) => (
          <Marker key={st.id} coordinate={{ latitude: st.lat, longitude: st.lng }}>
            <MapPin brand={st.brand} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const DR_CENTER = {
  latitude: 18.7357,
  longitude: -70.1627,
  latitudeDelta: 3,
  longitudeDelta: 3,
};

const s = StyleSheet.create({
  wrap: { flex: 1 },
  map: { flex: 1 },
});
