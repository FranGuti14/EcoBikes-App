import { useContext } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { AppContext } from '../context/AppContext';
import { useCatalogViewModel } from '../viewmodels/useCatalogViewModel';

const PLACEHOLDER = 'https://via.placeholder.com/400x200?text=Sin+imagen';

export default function CatalogScreen({ navigation }) {
  const { motos, loading } = useCatalogViewModel();
  const { userRole, addToCart } = useContext(AppContext);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={{ marginTop: 10, color: '#27ae60' }}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={motos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.imagen || PLACEHOLDER }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardPrice}>S/ {item.precio}</Text>
            </View>
            <PaperButton
              mode="contained"
              buttonColor="#2980b9"
              style={styles.btn}
              onPress={() => navigation.navigate('Detalles', { moto: item })}
            >
              Ver detalles
            </PaperButton>
            {userRole === 'user' && (
              <PaperButton
                mode="contained"
                buttonColor="#27ae60"
                style={styles.btn}
                onPress={() => addToCart(item)}
              >
                🛒 Agregar al carrito
              </PaperButton>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  image: { width: '100%', height: 180 },
  info: { padding: 15, paddingBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#27ae60', marginTop: 4 },
  btn: { marginHorizontal: 15, marginTop: 8, marginBottom: 8 },
});