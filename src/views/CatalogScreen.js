import { useContext } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { useCatalogViewModel } from '../viewmodels/useCatalogViewModel';

const PLACEHOLDER = 'https://via.placeholder.com/400x200?text=Sin+imagen';

export default function CatalogScreen({ navigation }) {
  const { motos, loading } = useCatalogViewModel();
  const { userRole, addToCart } = useContext(AppContext);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading catalog...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerGreeting}>Explore</Text>
        <Text style={styles.headerTitle}>Electric Bikes 🚴</Text>
      </View>

      <FlatList
        data={motos}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Detalles', { moto: item })}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.imagen || PLACEHOLDER }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>S/ {item.precio}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              {item.motor && (
                <Text style={styles.cardSpec}>⚡ {item.motor}</Text>
              )}
              {item.velMax && (
                <Text style={styles.cardSpec}>🏎 {item.velMax}</Text>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.btnDetails}
                  onPress={() => navigation.navigate('Detalles', { moto: item })}
                >
                  <Text style={styles.btnDetailsText}>View Details</Text>
                </TouchableOpacity>

                {userRole === 'user' && (
                  <TouchableOpacity
                    style={styles.btnCart}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.btnCartText}>🛒</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' },
  loadingText: { marginTop: 12, color: '#16A34A', fontWeight: '600', fontSize: 15 },

  header: {
    backgroundColor: '#0D3320',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerGreeting: {
    fontSize: 13,
    color: '#86EFAC',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 190 },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#0D3320',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: { color: '#86EFAC', fontWeight: '700', fontSize: 14 },

  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardSpec: { fontSize: 13, color: '#6B7280', marginBottom: 3, fontWeight: '500' },

  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  btnDetails: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDetailsText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnCart: {
    width: 46,
    height: 46,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  btnCartText: { fontSize: 20 },
});
