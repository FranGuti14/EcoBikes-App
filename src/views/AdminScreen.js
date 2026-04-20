import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';

export default function AdminScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEliminar = (id, nombre) => {
    Alert.alert('Delete Product', `Remove "${nombre}" from catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteDoc(doc(db, 'productos', id)); }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>Management</Text>
        <Text style={styles.headerTitle}>Products 👑</Text>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>{productos.length} items</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={productos}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productIcon}>
              <Text style={{ fontSize: 22 }}>🚴</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productPrice}>S/ {item.precio}</Text>
                {item.stock !== undefined && (
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>Stock: {item.stock}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditarProducto', { producto: item })}
              >
                <Ionicons name="pencil" size={16} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleEliminar(item.id, item.nombre)}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditarProducto', { producto: null })}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' },

  header: {
    backgroundColor: '#0D3320',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerSub: { fontSize: 13, color: '#86EFAC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  headerStats: { flexDirection: 'row' },
  statPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statPillText: { color: '#86EFAC', fontSize: 13, fontWeight: '600' },

  listContent: { padding: 16, paddingBottom: 100 },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#16A34A' },
  stockBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  stockText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
