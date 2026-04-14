import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const sedes = [
  { id: '1', distrito: 'Cerro Azul', direccion: 'Antigua Panamericana Sur Km 131', tel: '987 654 321', lat: -13.0256, lng: -76.4800 },
  { id: '2', distrito: 'San Vicente', direccion: 'Av. Benavides 450 (Plaza de Armas)', tel: '987 654 322', lat: -13.0768, lng: -76.3822 },
  { id: '3', distrito: 'Imperial', direccion: 'Jr. 28 de Julio 120 (A espaldas del mercado)', tel: '987 654 323', lat: -13.0594, lng: -76.3533 },
];

export default function UbicanosScreen() {
  const [mapRegion, setMapRegion] = useState({
    latitude: -13.0768,
    longitude: -76.3822,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [loading, setLoading] = useState(false);

  // Función matemática para calcular distancia entre dos coordenadas
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const encontrarSedeCercana = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación.');
      setLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const myLat = location.coords.latitude;
    const myLng = location.coords.longitude;

    let sedeMasCercana = null;
    let distanciaMinima = Infinity;

    sedes.forEach(sede => {
      const dist = calcularDistancia(myLat, myLng, sede.lat, sede.lng);
      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        sedeMasCercana = sede;
      }
    });

    if (sedeMasCercana) {
      setMapRegion({
        latitude: sedeMasCercana.lat,
        longitude: sedeMasCercana.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      Alert.alert('Sede más cercana', `Te recomendamos ir a la sede de ${sedeMasCercana.distrito}, a ${distanciaMinima.toFixed(1)} km de distancia.`);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={mapRegion}>
          {sedes.map(sede => (
            <Marker
              key={sede.id}
              coordinate={{ latitude: sede.lat, longitude: sede.lng }}
              title={`EcoBikes ${sede.distrito}`}
              description={sede.direccion}
              pinColor="#27ae60"
            />
          ))}
        </MapView>
        <TouchableOpacity style={styles.btnCercana} onPress={encontrarSedeCercana} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>📍 Encontrar sede más cercana</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={sedes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconContainer}><Ionicons name="location" size={30} color="#27ae60" /></View>
            <View style={styles.info}>
              <Text style={styles.distrito}>{item.distrito}</Text>
              <Text style={styles.direccion}>{item.direccion}</Text>
              <Text style={styles.tel}><Ionicons name="call-outline" size={14}/> {item.tel}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapContainer: { height: 300, width: '100%', position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  btnCercana: { position: 'absolute', bottom: 15, alignSelf: 'center', backgroundColor: '#2c3e50', padding: 12, borderRadius: 8, elevation: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 20, marginTop: 15, elevation: 2 },
  iconContainer: { justifyContent: 'center', marginRight: 15 },
  distrito: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  direccion: { fontSize: 14, color: '#7f8c8d', marginVertical: 4 },
  tel: { fontSize: 13, color: '#34495e', fontWeight: '500' }
});