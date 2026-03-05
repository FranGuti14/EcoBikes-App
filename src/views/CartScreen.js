import { useContext } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { AppContext } from '../context/AppContext';

export default function CartScreen() {
const { cart, clearCart } = useContext(AppContext);
const total = cart.reduce((sum, item) => sum + item.precio, 0);

const finalizarCompra = () => {
if (cart.length === 0) return Alert.alert('Aviso', 'El carrito está vacío');
Alert.alert('Compra Exitosa', 'Pagaste S/ ' + total + '. ¡Gracias por tu compra!');
clearCart();
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
/>
<View style={styles.footer}>
<Text style={styles.totalText}>Total: S/ {total}</Text>
<PaperButton mode="contained" buttonColor="#e67e22" onPress={finalizarCompra}>
Finalizar Compra
</PaperButton>
</View>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 },
itemName: { fontSize: 16, fontWeight: 'bold' },
itemPrice: { fontSize: 16, color: '#27ae60' },
footer: { marginTop: 20, padding: 15, backgroundColor: '#2c3e50', borderRadius: 10 },
totalText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }
});