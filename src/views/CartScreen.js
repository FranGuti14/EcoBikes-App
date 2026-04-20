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
  const [loadingGps, setLoadingGps] = useState(false);
  const [pinCoord, setPinCoord] = useState({ latitude: -13.0256, longitude: -76.4800 });

  const total = cart.reduce((sum, item) => sum + item.precio, 0);
  const subtotal = (total / 1.18).toFixed(2);
  const igv = (total - subtotal).toFixed(2);

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
        contacto: { telefono, direccion, coordenadas: pinCoord },
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>Your selection</Text>
        <Text style={styles.headerTitle}>My Cart 🛒</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚲</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some bikes to get started</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <View style={styles.cartItemIcon}>
                <Text style={{ fontSize: 22 }}>🚴</Text>
              </View>
              <View style={styles.cartItemInfo}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemSub}>Electric bike</Text>
              </View>
              <Text style={styles.itemPrice}>S/ {item.precio}</Text>
            </View>
          )}
        />
      )}

      {/* Footer */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>S/ {subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IGV (18%)</Text>
            <Text style={styles.summaryValue}>S/ {igv}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>S/ {total}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Billing Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'boleta' && styles.selectorActive]} onPress={() => setTipoComprobante('boleta')}>
                <Text style={[styles.selectorText, tipoComprobante === 'boleta' && styles.textActive]}>Boleta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'factura' && styles.selectorActive]} onPress={() => setTipoComprobante('factura')}>
                <Text style={[styles.selectorText, tipoComprobante === 'factura' && styles.textActive]}>Factura</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.modalInput} placeholder={tipoComprobante === 'boleta' ? 'DNI' : 'RUC'} value={documento} onChangeText={setDocumento} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.modalInput} placeholder={tipoComprobante === 'boleta' ? 'Full Name' : 'Razón Social'} value={nombreRazon} onChangeText={setNombreRazon} placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.modalInput} placeholder="Phone" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

            <Text style={styles.modalSectionTitle}>Delivery Address</Text>

            <View style={styles.mapContainerWrapper}>
              <MapView
                style={styles.miniMap}
                initialRegion={{ ...pinCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                region={{ ...pinCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
              >
                <Marker draggable coordinate={pinCoord} onDragEnd={alMoverPin} pinColor="#16A34A" title="Delivery location" />
              </MapView>
            </View>

            <TouchableOpacity style={styles.gpsButton} onPress={centrarEnMiUbicacion} disabled={loadingGps}>
              <Text style={styles.gpsButtonText}>{loadingGps ? '📍 Locating...' : '📍 Use My Location'}</Text>
            </TouchableOpacity>

            <TextInput style={[styles.modalInput, { minHeight: 60 }]} placeholder="Delivery address" value={direccion} onChangeText={setDireccion} multiline placeholderTextColor="#9CA3AF" />

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmarCompra}>
              <Text style={styles.confirmBtnText}>Confirm Order · S/ {total}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    backgroundColor: '#0D3320',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerSub: { fontSize: 13, color: '#86EFAC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280' },
  listContent: { padding: 16 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cartItemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cartItemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#16A34A' },

  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#6B7280', fontSize: 14 },
  summaryValue: { color: '#374151', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#16A34A' },
  checkoutBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalScroll: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  closeBtn: { width: 36, height: 36, backgroundColor: '#F3F4F6', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#6B7280', fontSize: 16, fontWeight: '700' },
  selectorContainer: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 4 },
  selectorBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  selectorActive: { backgroundColor: '#16A34A' },
  selectorText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  textActive: { color: '#fff' },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 10 },
  mapContainerWrapper: { height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  miniMap: { ...StyleSheet.absoluteFillObject },
  gpsButton: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#BBF7D0' },
  gpsButtonText: { color: '#16A34A', textAlign: 'center', fontWeight: '700' },
  confirmBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
