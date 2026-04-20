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

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
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
      setMapRegion({ latitude: sedeMasCercana.lat, longitude: sedeMasCercana.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      Alert.alert('Estación más Cercana', `Te recomendamos ir a  ${sedeMasCercana.distrito}, ${distanciaMinima.toFixed(1)} km de distancia.`);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={mapRegion}>
          {sedes.map(sede => (
            <Marker
              key={sede.id}
              coordinate={{ latitude: sede.lat, longitude: sede.lng }}
              title={`EcoBikes ${sede.distrito}`}
              description={sede.direccion}
              pinColor="#16A34A"
            />
          ))}
        </MapView>

        {/* Overlay header */}
        <View style={styles.mapOverlayHeader}>
          <Text style={styles.mapOverlayTitle}>🗺️ Encuentra una estación</Text>
          <Text style={styles.mapOverlaySub}>{sedes.length} locales cerca a ti</Text>
        </View>

        {/* Find nearest button */}
        <TouchableOpacity
          style={styles.nearestBtn}
          onPress={encontrarSedeCercana}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.nearestBtnText}>📍 Encuentra la estación más cercana a ti</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Stations List */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Nuestros Locales</Text>
        <Text style={styles.listHeaderCount}>{sedes.length} total</Text>
      </View>

      <FlatList
        data={sedes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.stationCard}>
            <View style={styles.stationIconWrap}>
              <Ionicons name="location" size={22} color="#16A34A" />
            </View>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>EcoBikes {item.distrito}</Text>
              <Text style={styles.stationAddress}>{item.direccion}</Text>
              <View style={styles.stationPhone}>
                <Ionicons name="call-outline" size={12} color="#6B7280" />
                <Text style={styles.stationPhoneText}> {item.tel}</Text>
              </View>
            </View>
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Open</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  mapContainer: { height: 320, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },

  mapOverlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13,51,32,0.85)',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  mapOverlayTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  mapOverlaySub: { fontSize: 13, color: '#86EFAC', marginTop: 2 },

  nearestBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 30,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearestBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  listHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  listHeaderCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },

  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  stationIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stationInfo: { flex: 1 },
  stationName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  stationAddress: { fontSize: 12, color: '#6B7280', marginBottom: 4, lineHeight: 16 },
  stationPhone: { flexDirection: 'row', alignItems: 'center' },
  stationPhoneText: { fontSize: 12, color: '#6B7280' },
  availBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 5 },
  availText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
});
