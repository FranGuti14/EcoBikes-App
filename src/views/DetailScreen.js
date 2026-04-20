import { useContext } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

const PLACEHOLDER = 'https://via.placeholder.com/400x200?text=Sin+imagen';

export default function DetailScreen({ route, navigation }) {
  const { moto } = route.params;
  const { addToCart, userRole } = useContext(AppContext);

  const handleComprar = () => {
    addToCart(moto);
    Alert.alert('Added! 🛒', `${moto.nombre} added to your cart.`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: moto.imagen || PLACEHOLDER }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>S/ {moto.precio}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.bikeName}>{moto.nombre}</Text>

        {moto.desc && (
          <Text style={styles.bikeDesc}>{moto.desc}</Text>
        )}

        {/* Specs */}
        {(moto.motor || moto.velMax) && (
          <View style={styles.specsGrid}>
            {moto.motor && (
              <View style={styles.specCard}>
                <Text style={styles.specIcon}>⚡</Text>
                <Text style={styles.specLabel}>Motor</Text>
                <Text style={styles.specValue}>{moto.motor}</Text>
              </View>
            )}
            {moto.velMax && (
              <View style={styles.specCard}>
                <Text style={styles.specIcon}>🏎</Text>
                <Text style={styles.specLabel}>Max Speed</Text>
                <Text style={styles.specValue}>{moto.velMax}</Text>
              </View>
            )}
            <View style={styles.specCard}>
              <Text style={styles.specIcon}>🌿</Text>
              <Text style={styles.specLabel}>Type</Text>
              <Text style={styles.specValue}>Electric</Text>
            </View>
          </View>
        )}

        {/* Eco Impact */}
        <View style={styles.ecoCard}>
          <Text style={styles.ecoIcon}>🌱</Text>
          <View style={styles.ecoText}>
            <Text style={styles.ecoTitle}>Eco Friendly</Text>
            <Text style={styles.ecoSubtitle}>Zero emissions · Sustainable transport</Text>
          </View>
        </View>

        {/* CTA */}
        {userRole === 'user' && (
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleComprar} activeOpacity={0.9}>
            <Text style={styles.addToCartText}>Add to Cart · S/ {moto.precio}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },

  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 280 },
  heroOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  pricePill: {
    backgroundColor: '#0D3320',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
  },
  pricePillText: { color: '#86EFAC', fontWeight: '800', fontSize: 18 },

  content: { padding: 20 },
  bikeName: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 },
  bikeDesc: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 20 },

  specsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  specIcon: { fontSize: 22, marginBottom: 6 },
  specLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  specValue: { fontSize: 12, color: '#111827', fontWeight: '700', textAlign: 'center' },

  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ecoIcon: { fontSize: 28, marginRight: 14 },
  ecoText: { flex: 1 },
  ecoTitle: { fontSize: 15, fontWeight: '700', color: '#15803D', marginBottom: 2 },
  ecoSubtitle: { fontSize: 13, color: '#16A34A' },

  addToCartBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addToCartText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
