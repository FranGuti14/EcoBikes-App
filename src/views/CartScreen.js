import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button as PaperButton } from 'react-native-paper';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export default function CartScreen() {
  const { cart, clearCart } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [tipoComprobante, setTipoComprobante] = useState('boleta');
  const [documento, setDocumento] = useState('');
  const [nombreRazon, setNombreRazon] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // Estados para el minimapa
  const [loadingGps, setLoadingGps] = useState(false);
  const [pinCoord, setPinCoord] = useState({ latitude: -13.0256, longitude: -76.4800 }); // Inicia en Cerro Azul

  const total = cart.reduce((sum, item) => sum + item.precio, 0);
  const subtotal = (total / 1.18).toFixed(2);
  const igv = (total - subtotal).toFixed(2);

  // Convierte coordenadas a texto (calle)
  const traducirCoordenadasADireccion = async (lat, lng) => {
    try {
      let reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverse.length > 0) {
        const dir = reverse[0];
        setDireccion(`${dir.street || 'Calle s/n'} ${dir.name || ''}, ${dir.district || ''}`);
      }
    } catch (e) {
      console.log("Error al geocodificar", e);
    }
  };

  // Se activa al presionar el botón de GPS
  const centrarEnMiUbicacion = async () => {
    setLoadingGps(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación.');
      setLoadingGps(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;
    
    setPinCoord({ latitude: lat, longitude: lng });
    await traducirCoordenadasADireccion(lat, lng);
    setLoadingGps(false);
  };

  // Se activa cuando el usuario arrastra el pin por el mapa
  const alMoverPin = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setPinCoord(coords);
    await traducirCoordenadasADireccion(coords.latitude, coords.longitude);
  };

  const confirmarCompra = async () => {
    if (!documento || !nombreRazon || !telefono || !direccion) {
      return Alert.alert('Error', 'Completa todos los campos.');
    }
    try {
      await addDoc(collection(db, "ordenes"), {
        userId: auth.currentUser ? auth.currentUser.uid : 'invitado',
        productos: cart,
        montos: { subtotal: Number(subtotal), igv: Number(igv), total: total },
        comprobante: { tipo: tipoComprobante, documento, cliente: nombreRazon },
        contacto: { telefono, direccion, coordenadas: pinCoord }, // Guardamos también las coords exactas
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
      });
      Alert.alert('¡Compra Exitosa!', `Pedido en ruta hacia:\n${direccion}`);
      clearCart();
      setModalVisible(false);
      setDocumento(''); setNombreRazon(''); setTelefono(''); setDireccion('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la orden.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemPrice}>S/ {item.precio}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Tu carrito está vacío.</Text>}
      />
      
      <View style={styles.footer}>
        <View style={styles.montosContainer}>
          <Text style={styles.montoText}>Subtotal: S/ {subtotal}</Text>
          <Text style={styles.montoText}>IGV (18%): S/ {igv}</Text>
          <Text style={styles.totalText}>Total: S/ {total}</Text>
        </View>
        <PaperButton mode="contained" buttonColor="#e67e22" onPress={() => setModalVisible(true)} disabled={cart.length === 0}>
          Procesar Pago
        </PaperButton>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalTitle}>Datos de Facturación</Text>

            <View style={styles.selectorContainer}>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'boleta' && styles.selectorActive]} onPress={() => setTipoComprobante('boleta')}>
                <Text style={[styles.selectorText, tipoComprobante === 'boleta' && styles.textActive]}>Boleta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'factura' && styles.selectorActive]} onPress={() => setTipoComprobante('factura')}>
                <Text style={[styles.selectorText, tipoComprobante === 'factura' && styles.textActive]}>Factura</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder={tipoComprobante === 'boleta' ? 'DNI' : 'RUC'} value={documento} onChangeText={setDocumento} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder={tipoComprobante === 'boleta' ? 'Nombre completo' : 'Razón Social'} value={nombreRazon} onChangeText={setNombreRazon} />
            <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

            <Text style={styles.modalTitle2}>Dirección de Envío</Text>

            <View style={styles.mapContainerWrapper}>
              <MapView 
                style={styles.miniMap} 
                initialRegion={{ ...pinCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                region={{ ...pinCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
              >
                <Marker draggable coordinate={pinCoord} onDragEnd={alMoverPin} pinColor="red" title="Destino de entrega" description="Mantén presionado para mover" />
              </MapView>
            </View>

            <TouchableOpacity style={styles.gpsButton} onPress={centrarEnMiUbicacion} disabled={loadingGps}>
              <Text style={styles.gpsButtonText}>{loadingGps ? '📍 Buscando...' : '📍 Centrar en mi ubicación'}</Text>
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Ubicación (arrastra el pin o escribe aquí)" value={direccion} onChangeText={setDireccion} multiline />

            <View style={styles.actionButtons}>
              <PaperButton mode="contained" onPress={confirmarCompra} style={styles.confirmBtn} buttonColor="#27ae60">Confirmar S/ {total}</PaperButton>
              <PaperButton mode="text" onPress={() => setModalVisible(false)} textColor="#e74c3c">Cancelar</PaperButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#7f8c8d' },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, elevation: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  itemPrice: { fontSize: 16, color: '#27ae60', fontWeight: 'bold' },
  footer: { marginTop: 10, padding: 15, backgroundColor: '#2c3e50', borderRadius: 10 },
  montosContainer: { marginBottom: 15 },
  montoText: { color: '#bdc3c7', fontSize: 14, textAlign: 'right' },
  totalText: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginTop: 5 },
  modalScroll: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  modalTitle2: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginTop: 10, marginBottom: 10, textAlign: 'center' },
  selectorContainer: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#ecf0f1', borderRadius: 8, padding: 4 },
  selectorBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  selectorActive: { backgroundColor: '#fff', elevation: 2 },
  selectorText: { fontSize: 16, color: '#7f8c8d', fontWeight: 'bold' },
  textActive: { color: '#2980b9' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  mapContainerWrapper: { height: 180, width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  miniMap: { ...StyleSheet.absoluteFillObject },
  gpsButton: { backgroundColor: '#e8f6f3', padding: 10, borderRadius: 8, marginBottom: 15 },
  gpsButtonText: { color: '#27ae60', textAlign: 'center', fontWeight: 'bold' },
  actionButtons: { marginTop: 10 },
  confirmBtn: { marginBottom: 10 }
});