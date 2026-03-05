import { useContext } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { AppContext } from '../context/AppContext';

const PLACEHOLDER = 'https://via.placeholder.com/400x200?text=Sin+imagen';

export default function DetailScreen({ route, navigation }) {
  const { moto } = route.params;
  const { addToCart, userRole } = useContext(AppContext);

  const handleComprar = () => {
    addToCart(moto);
    Alert.alert('¡Éxito!', moto.nombre + ' añadida al carrito.');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: moto.imagen || PLACEHOLDER }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.card}>
        <Text style={styles.title}>{moto.nombre}</Text>
        <Text style={styles.desc}>{moto.desc}</Text>
        <View style={styles.specs}>
          <Text style={styles.spec}>⚡ Motor: {moto.motor}</Text>
          <Text style={styles.spec}>🏎️ Velocidad: {moto.velMax}</Text>
        </View>
        <Text style={styles.price}>S/ {moto.precio}</Text>
        {userRole === 'user' && (
          <PaperButton
            mode="contained"
            buttonColor="#27ae60"
            style={styles.btn}
            onPress={handleComprar}
          >
            🛒 Agregar al carrito
          </PaperButton>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  image: { width: '100%', height: 250 },
  card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10, elevation: 3 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  desc: { fontSize: 16, color: '#7f8c8d', marginBottom: 15 },
  specs: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10 },
  spec: { fontSize: 15, fontWeight: 'bold', color: '#34495e', marginBottom: 5 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#27ae60', textAlign: 'center', marginVertical: 15 },
  btn: { marginTop: 5 },
});