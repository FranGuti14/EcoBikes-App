import * as Location from 'expo-location';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export default function CartScreen() {
  const { cart, clearCart, addToCart, removeFromCart } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState('boleta');
  const [documento, setDocumento] = useState('');
  const [nombreRazon, setNombreRazon] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [pinCoord, setPinCoord] = useState({ latitude: -13.0256, longitude: -76.4800 });

  // Cálculo de totales según CANTIDAD
  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const subtotal = (total / 1.18).toFixed(2);
  const igv = (total - subtotal).toFixed(2);

  const generarPDF = async () => {
    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 30px; color: #333;">
          <div style="text-align: center; border-bottom: 2px solid #16A34A; padding-bottom: 10px;">
            <h1 style="color: #16A34A; margin: 0;">ECOBIKES PERÚ</h1>
            <p>Comprobante Electrónico</p>
          </div>
          <div style="margin-top: 20px;">
            <h2>${tipoComprobante.toUpperCase()}</h2>
            <p><strong>Cliente:</strong> ${nombreRazon}</p>
            <p><strong>${tipoComprobante === 'boleta' ? 'DNI' : 'RUC'}:</strong> ${documento}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Dirección de entrega:</strong> ${direccion}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Cant.</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Precio Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.nombre}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.cantidad}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: right;">
            <p>Subtotal: S/ ${subtotal}</p>
            <p>IGV (18%): S/ ${igv}</p>
            <h2 style="color: #16A34A;">Total Pagado: S/ ${total.toFixed(2)}</h2>
          </div>
          <footer style="margin-top: 40px; text-align: center; font-size: 10px; color: #6B7280;">
            Gracias por su compra. EcoBikes apoyando la movilidad ecológica.
          </footer>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error("Error al generar PDF:", e);
    }
  };

  const confirmarCompra = async () => {
    if (!documento || !nombreRazon || !telefono || !direccion) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios.');
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

      const batchStock = cart.map(item => {
        const docRef = doc(db, 'productos', item.id);
        return updateDoc(docRef, { stock: increment(-item.cantidad) });
      });
      await Promise.all(batchStock);

      Alert.alert(
        '¡Compra Exitosa!', 
        `Se descontó el stock y se generará tu ${tipoComprobante}.`,
        [{ text: 'Ver Comprobante', onPress: () => generarPDF() }]
      );

      clearCart();
      setModalVisible(false);
      setDocumento(''); setNombreRazon(''); setTelefono(''); setDireccion('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo completar la transacción.');
    }
  };

  const traducirCoordenadasADireccion = async (lat, lng) => {
    try {
      let reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverse.length > 0) {
        const dir = reverse[0];
        setDireccion(`${dir.street || 'Calle s/n'} ${dir.name || ''}, ${dir.district || ''}`);
      }
    } catch (e) { console.log(e); }
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
    const { latitude, longitude } = location.coords;
    setPinCoord({ latitude, longitude });
    await traducirCoordenadasADireccion(latitude, longitude);
    setLoadingGps(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Tu selección</Text>
        <Text style={styles.headerTitle}>Mi Carrito 🛒</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚲</Text>
          <Text style={styles.emptyTitle}>El carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Añade productos para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <View style={styles.cartItemIcon}><Text style={{ fontSize: 22 }}>🚴</Text></View>
              <View style={styles.cartItemInfo}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemSub}>S/ {item.precio} c/u</Text>
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
                <TouchableOpacity 
                  style={[styles.qtyBtn, item.cantidad >= item.stock && {opacity: 0.4}]} 
                  onPress={() => {
                    if (item.cantidad < item.stock) {
                      addToCart(item);
                    } else {
                      Alert.alert('Límite alcanzado', 'No hay más stock disponible de este producto.');
                    }
                  }}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>S/ {subtotal}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>IGV (18%)</Text><Text style={styles.summaryValue}>S/ {igv}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text></View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.checkoutText}>Pagar Ahora →</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Datos de Facturación</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}><Text>✕</Text></TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'boleta' && styles.selectorActive]} onPress={() => setTipoComprobante('boleta')}>
                <Text style={[styles.selectorText, tipoComprobante === 'boleta' && styles.textActive]}>Boleta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorBtn, tipoComprobante === 'factura' && styles.selectorActive]} onPress={() => setTipoComprobante('factura')}>
                <Text style={[styles.selectorText, tipoComprobante === 'factura' && styles.textActive]}>Factura</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.modalInput} placeholder={tipoComprobante === 'boleta' ? 'DNI' : 'RUC'} value={documento} onChangeText={setDocumento} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder={tipoComprobante === 'boleta' ? 'Nombre Completo' : 'Razón Social'} value={nombreRazon} onChangeText={setNombreRazon} />
            <TextInput style={styles.modalInput} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
            
            <Text style={styles.modalSectionTitle}>Dirección de Entrega</Text>
            <View style={styles.mapContainerWrapper}>
              <MapView style={styles.miniMap} region={{ ...pinCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                <Marker draggable coordinate={pinCoord} onDragEnd={(e) => {
                  const coords = e.nativeEvent.coordinate;
                  setPinCoord(coords);
                  traducirCoordenadasADireccion(coords.latitude, coords.longitude);
                }} />
              </MapView>
            </View>
            <TouchableOpacity style={styles.gpsButton} onPress={centrarEnMiUbicacion}><Text style={styles.gpsButtonText}>{loadingGps ? '📍 Ubicando...' : '📍 Usar mi Ubicación'}</Text></TouchableOpacity>
            <TextInput style={styles.modalInput} placeholder="Dirección exacta" value={direccion} onChangeText={setDireccion} multiline />

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmarCompra}>
              <Text style={styles.confirmBtnText}>Confirmar y Generar PDF</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { backgroundColor: '#0D3320', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  headerSub: { fontSize: 13, color: '#86EFAC', fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: '#6B7280' },
  listContent: { padding: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  cartItemIcon: { width: 48, height: 48, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cartItemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 13, color: '#16A34A', fontWeight: '600', marginTop: 2 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: '#fff', elevation: 1 },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  qtyText: { marginHorizontal: 12, fontSize: 15, fontWeight: '700', color: '#111827' },
  footer: { backgroundColor: '#FFF', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#6B7280' },
  summaryValue: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#16A34A' },
  checkoutBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  checkoutText: { color: '#fff', fontWeight: '700' },
  modalScroll: { padding: 24, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, backgroundColor: '#F3F4F6', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  selectorContainer: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 4 },
  selectorBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  selectorActive: { backgroundColor: '#16A34A' },
  textActive: { color: '#fff' },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 13, marginBottom: 12 },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  mapContainerWrapper: { height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  miniMap: { ...StyleSheet.absoluteFillObject },
  gpsButton: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#BBF7D0' },
  gpsButtonText: { color: '#16A34A', textAlign: 'center', fontWeight: '700' },
  confirmBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  confirmBtnText: { color: '#fff', fontWeight: '700' }
});