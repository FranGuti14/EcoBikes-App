import { addDoc, collection } from 'firebase/firestore';
import { useContext, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export default function CartScreen() {
  const { cart, clearCart, userRole } = useContext(AppContext);
  const total = cart.reduce((sum, item) => sum + item.precio, 0);

  const [modalVisible, setModalVisible] = useState(false);
  const [boletaVisible, setBoletaVisible] = useState(false);
  const [ordenGuardada, setOrdenGuardada] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── Datos del comprador ─────────────────────────────────────
  const [nombreComprador, setNombreComprador] = useState('');
  const [dniRuc, setDniRuc] = useState('');
  const [tipoDoc, setTipoDoc] = useState('boleta'); // 'boleta' | 'factura'
  const [razonSocial, setRazonSocial] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const abrirFormulario = () => {
    if (cart.length === 0) return Alert.alert('Aviso', 'El carrito está vacío.');
    setModalVisible(true);
  };

  // ─── Confirmar compra → guardar en Firestore ─────────────────
  const confirmarCompra = async () => {
    if (!nombreComprador || !dniRuc || !telefono || !direccion) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios.');
    }
    if (tipoDoc === 'factura' && !razonSocial) {
      return Alert.alert('Error', 'La factura requiere razón social.');
    }

    setLoading(true);
    try {
      const numeroOrden = 'ORD-' + Date.now().toString().slice(-6);
      const orden = {
        numeroOrden,
        tipoDocumento: tipoDoc,
        comprador: {
          nombre: nombreComprador,
          dniRuc,
          razonSocial: tipoDoc === 'factura' ? razonSocial : null,
          telefono,
          direccion,
        },
        productos: cart.map(p => ({
          id: p.id || '',
          nombre: p.nombre,
          precio: p.precio,
        })),
        total,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
      };

      await addDoc(collection(db, 'ordenes'), orden);
      setOrdenGuardada(orden);
      clearCart();
      setModalVisible(false);
      setBoletaVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Pantalla boleta/factura ──────────────────────────────────
  if (boletaVisible && ordenGuardada) {
    return (
      <ScrollView style={styles.boletaContainer}>
        <View style={styles.boletaCard}>
          <Text style={styles.boletaTitulo}>
            {ordenGuardada.tipoDocumento === 'factura' ? '🧾 FACTURA' : '🧾 BOLETA DE VENTA'}
          </Text>
          <Text style={styles.boletaEmpresa}>EcoBikes S.A.C.</Text>
          <Text style={styles.boletaRuc}>RUC: 20123456789</Text>
          <Text style={styles.boletaDireccion}>Av. Principal 123, Lima, Perú</Text>

          <View style={styles.separador} />

          <Text style={styles.boletaNumero}>N° {ordenGuardada.numeroOrden}</Text>
          <Text style={styles.boletaFecha}>
            Fecha: {new Date(ordenGuardada.fechaCreacion).toLocaleDateString('es-PE', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })}
          </Text>

          <View style={styles.separador} />

          <Text style={styles.boletaSeccion}>DATOS DEL CLIENTE</Text>
          <Text style={styles.boletaDato}>Nombre: {ordenGuardada.comprador.nombre}</Text>
          <Text style={styles.boletaDato}>
            {ordenGuardada.tipoDocumento === 'factura' ? 'RUC' : 'DNI'}: {ordenGuardada.comprador.dniRuc}
          </Text>
          {ordenGuardada.tipoDocumento === 'factura' && (
            <Text style={styles.boletaDato}>Razón Social: {ordenGuardada.comprador.razonSocial}</Text>
          )}
          <Text style={styles.boletaDato}>Teléfono: {ordenGuardada.comprador.telefono}</Text>
          <Text style={styles.boletaDato}>Dirección: {ordenGuardada.comprador.direccion}</Text>

          <View style={styles.separador} />

          <Text style={styles.boletaSeccion}>DETALLE DE PRODUCTOS</Text>
          {ordenGuardada.productos.map((p, i) => (
            <View key={i} style={styles.boletaProductoRow}>
              <Text style={styles.boletaProductoNombre}>{p.nombre}</Text>
              <Text style={styles.boletaProductoPrecio}>S/ {p.precio.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.separador} />

          <View style={styles.boletaTotalRow}>
            <Text style={styles.boletaTotalLabel}>Subtotal:</Text>
            <Text style={styles.boletaTotalValor}>S/ {(total / 1.18).toFixed(2)}</Text>
          </View>
          <View style={styles.boletaTotalRow}>
            <Text style={styles.boletaTotalLabel}>IGV (18%):</Text>
            <Text style={styles.boletaTotalValor}>S/ {(total - total / 1.18).toFixed(2)}</Text>
          </View>
          <View style={[styles.boletaTotalRow, styles.boletaTotalFinal]}>
            <Text style={styles.boletaTotalFinalLabel}>TOTAL:</Text>
            <Text style={styles.boletaTotalFinalValor}>S/ {total.toFixed(2)}</Text>
          </View>

          <View style={styles.separador} />
          <Text style={styles.boletaGracias}>¡Gracias por tu compra!</Text>
          <Text style={styles.boletaEstado}>Estado: {ordenGuardada.estado.toUpperCase()}</Text>

          <TouchableOpacity
            style={styles.btnVolver}
            onPress={() => setBoletaVisible(false)}
          >
            <Text style={styles.btnVolverText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─── Pantalla carrito ────────────────────────────────────────
  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioIcono}>🛒</Text>
          <Text style={styles.vacioTexto}>Tu carrito está vacío</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemPrice}>S/ {item.precio.toFixed(2)}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: S/ {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.btnComprar} onPress={abrirFormulario}>
          <Text style={styles.btnComprarText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Modal formulario datos del comprador ─── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <ScrollView
              style={styles.modalContainer}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Text style={styles.modalTitulo}>Datos para tu comprobante</Text>

              {/* Tipo de documento */}
              <Text style={styles.modalLabel}>Tipo de comprobante</Text>
              <View style={styles.tipoDocRow}>
                <TouchableOpacity
                  style={[styles.tipoDocBtn, tipoDoc === 'boleta' && styles.tipoDocActivo]}
                  onPress={() => setTipoDoc('boleta')}
                >
                  <Text style={[styles.tipoDocText, tipoDoc === 'boleta' && styles.tipoDocTextActivo]}>
                    Boleta
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tipoDocBtn, tipoDoc === 'factura' && styles.tipoDocActivo]}
                  onPress={() => setTipoDoc('factura')}
                >
                  <Text style={[styles.tipoDocText, tipoDoc === 'factura' && styles.tipoDocTextActivo]}>
                    Factura
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Nombre completo *</Text>
              <TextInput style={styles.modalInput} value={nombreComprador} onChangeText={setNombreComprador} placeholder="Juan Pérez" />

              <Text style={styles.modalLabel}>{tipoDoc === 'factura' ? 'RUC *' : 'DNI *'}</Text>
              <TextInput style={styles.modalInput} value={dniRuc} onChangeText={setDniRuc} keyboardType="numeric" placeholder={tipoDoc === 'factura' ? '20123456789' : '12345678'} maxLength={tipoDoc === 'factura' ? 11 : 8} />

              {tipoDoc === 'factura' && (
                <>
                  <Text style={styles.modalLabel}>Razón Social *</Text>
                  <TextInput style={styles.modalInput} value={razonSocial} onChangeText={setRazonSocial} placeholder="Mi Empresa S.A.C." />
                </>
              )}

              <Text style={styles.modalLabel}>Teléfono *</Text>
              <TextInput style={styles.modalInput} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholder="987654321" />

              <Text style={styles.modalLabel}>Dirección de entrega *</Text>
              <TextInput style={styles.modalInput} value={direccion} onChangeText={setDireccion} placeholder="Av. Los Olivos 123, Lima" />

              <View style={styles.modalResumen}>
                <Text style={styles.modalResumenTexto}>Total a pagar: S/ {total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.btnConfirmar, loading && { backgroundColor: '#95a5a6' }]}
                onPress={confirmarCompra}
                disabled={loading}
              >
                <Text style={styles.btnConfirmarText}>
                  {loading ? 'Procesando...' : 'Confirmar compra'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  vacio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vacioIcono: { fontSize: 60, marginBottom: 16 },
  vacioTexto: { fontSize: 18, color: '#7f8c8d' },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, elevation: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  itemPrice: { fontSize: 15, color: '#27ae60', fontWeight: 'bold' },
  footer: { padding: 15, backgroundColor: '#2c3e50', borderRadius: 12, marginTop: 10 },
  totalText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  btnComprar: { backgroundColor: '#e67e22', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnComprarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16, textAlign: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#2c3e50', marginTop: 12, marginBottom: 5 },
  modalInput: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15 },
  tipoDocRow: { flexDirection: 'row', gap: 10 },
  tipoDocBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f8f9fa' },
  tipoDocActivo: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  tipoDocText: { fontWeight: '600', color: '#7f8c8d' },
  tipoDocTextActivo: { color: '#fff' },
  modalResumen: { backgroundColor: '#f0faf4', padding: 14, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  modalResumenTexto: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  btnConfirmar: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, marginTop: 16, alignItems: 'center' },
  btnConfirmarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnCancelar: { padding: 14, alignItems: 'center', marginTop: 8 },
  btnCancelarText: { color: '#e74c3c', fontSize: 15 },

  // Boleta
  boletaContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  boletaCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 24, elevation: 3 },
  boletaTitulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 4 },
  boletaEmpresa: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#27ae60' },
  boletaRuc: { fontSize: 13, textAlign: 'center', color: '#7f8c8d' },
  boletaDireccion: { fontSize: 12, textAlign: 'center', color: '#7f8c8d', marginBottom: 4 },
  separador: { borderBottomWidth: 1, borderBottomColor: '#eee', marginVertical: 14 },
  boletaNumero: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  boletaFecha: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  boletaSeccion: { fontSize: 13, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 8, letterSpacing: 0.5 },
  boletaDato: { fontSize: 14, color: '#2c3e50', marginBottom: 3 },
  boletaProductoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  boletaProductoNombre: { fontSize: 14, color: '#2c3e50', flex: 1 },
  boletaProductoPrecio: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  boletaTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  boletaTotalLabel: { fontSize: 14, color: '#7f8c8d' },
  boletaTotalValor: { fontSize: 14, color: '#2c3e50' },
  boletaTotalFinal: { marginTop: 6 },
  boletaTotalFinalLabel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  boletaTotalFinalValor: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  boletaGracias: { textAlign: 'center', fontSize: 15, color: '#27ae60', fontWeight: 'bold', marginTop: 4 },
  boletaEstado: { textAlign: 'center', fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  btnVolver: { backgroundColor: '#27ae60', padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  btnVolverText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});