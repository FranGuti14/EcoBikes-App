import { useContext } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { useCatalogViewModel } from '../viewmodels/useCatalogViewModel';

const PLACEHOLDER = 'https://via.placeholder.com/400x200?text=Sin+imagen';

export default function CatalogScreen({ navigation }) {
  const { motos, loading } = useCatalogViewModel();
  const { userRole, cart, addToCart } = useContext(AppContext);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerGreeting}>Explorar</Text>
        <Text style={styles.headerTitle}>Bicicletas Eléctricas 🚴</Text>
      </View>

      <FlatList
        data={motos}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const sinStock = item.stock <= 0;
          
          // Verificamos si este producto ya está en el carrito
          const cartItem = cart.find(c => c.id === item.id);
          const cantidadEnCarrito = cartItem ? cartItem.cantidad : 0;
          const alcanzadoLimiteStock = cantidadEnCarrito >= item.stock;

          const handleAddToCart = () => {
            if (alcanzadoLimiteStock) {
              Alert.alert('Límite alcanzado', 'Has añadido todas las unidades disponibles de este producto a tu carrito.');
            } else {
              addToCart(item);
            }
          };

          return (
            <TouchableOpacity
              style={[styles.card, sinStock && { opacity: 0.6 }]}
              activeOpacity={0.92}
              disabled={sinStock}
              onPress={() => navigation.navigate('Detalles', { moto: item })}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imagen || PLACEHOLDER }} style={styles.image} resizeMode="cover" />
                <View style={[styles.priceBadge, sinStock && { backgroundColor: '#6B7280' }]}>
                  <Text style={[styles.priceText, sinStock && { color: '#F3F4F6' }]}>S/ {item.precio}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                
                {sinStock && (
                  <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 12, marginBottom: 4 }}>⚠️ AGOTADO</Text>
                )}

                {item.motor && <Text style={styles.cardSpec}>⚡ {item.motor}</Text>}
                {item.velMax && <Text style={styles.cardSpec}>🏎 {item.velMax}</Text>}
                
                <Text style={[styles.cardSpec, {color: '#16A34A'}]}>📦 Stock disponible: {item.stock}</Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.btnDetails, sinStock && { backgroundColor: '#9CA3AF' }]}
                    onPress={() => navigation.navigate('Detalles', { moto: item })}
                  >
                    <Text style={styles.btnDetailsText}>Ver Detalles</Text>
                  </TouchableOpacity>

                  {userRole === 'user' && (
                    <TouchableOpacity
                      style={[styles.btnCart, sinStock && { borderColor: '#E5E7EB' }]}
                      onPress={handleAddToCart}
                      disabled={sinStock}
                    >
                      <Text style={[styles.btnCartText, sinStock && { opacity: 0.3 }]}>🛒</Text>
                      
                      {/* Indicador visual de cantidad agregada */}
                      {cantidadEnCarrito > 0 && (
                        <View style={styles.badgeContainer}>
                          <Text style={styles.badgeText}>{cantidadEnCarrito}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' },
  loadingText: { marginTop: 12, color: '#16A34A', fontWeight: '600', fontSize: 15 },
  header: { backgroundColor: '#0D3320', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  headerGreeting: { fontSize: 13, color: '#86EFAC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 18, overflow: 'hidden', elevation: 3 },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 190 },
  priceBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#0D3320', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priceText: { color: '#86EFAC', fontWeight: '700', fontSize: 14 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardSpec: { fontSize: 13, color: '#6B7280', marginBottom: 3, fontWeight: '500' },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  btnDetails: { flex: 1, backgroundColor: '#16A34A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnDetailsText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnCart: { width: 46, height: 46, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#BBF7D0', position: 'relative' },
  btnCartText: { fontSize: 20 },
  badgeContainer: { position: 'absolute', top: -6, right: -6, backgroundColor: '#DC2626', minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});