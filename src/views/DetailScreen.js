import { useContext } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function DetailScreen({ route, navigation }) {
const { moto } = route.params;
const { addToCart, userRole } = useContext(AppContext);

const handleComprar = () => {
addToCart(moto);
Alert.alert('¡Éxito!', moto.nombre + ' añadida al carrito.');
navigation.goBack();
};

return (
<View style={styles.container}>
<View style={styles.card}>
<Text style={styles.title}>{moto.nombre}</Text>
<Text style={styles.desc}>{moto.desc}</Text>
<Text style={styles.spec}>Motor: {moto.motor}</Text>
<Text style={styles.spec}>Velocidad: {moto.velMax}</Text>
<Text style={styles.price}>S/ {moto.precio}</Text>
</View>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
desc: { fontSize: 16, color: '#7f8c8d', marginBottom: 15 },
spec: { fontSize: 16, fontWeight: 'bold', color: '#34495e', marginBottom: 5 },
price: { fontSize: 22, fontWeight: 'bold', color: '#27ae60', marginVertical: 20, textAlign: 'center' }
});