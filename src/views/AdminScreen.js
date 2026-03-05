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
    Alert.alert('Eliminar', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'productos', id));
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.precio}>S/ {item.precio}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => navigation.navigate('EditarProducto', { producto: item })}
              >
                <Ionicons name="pencil" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => handleEliminar(item.id, item.nombre)}
              >
                <Ionicons name="trash" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditarProducto', { producto: null })}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  precio: { fontSize: 14, color: '#27ae60', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  btnEdit: { backgroundColor: '#2980b9', padding: 8, borderRadius: 8 },
  btnDelete: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 8 },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#27ae60', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});