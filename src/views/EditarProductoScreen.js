import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase';

export default function EditarProductoScreen({ route, navigation }) {
  const { producto } = route.params;
  const esNuevo = producto === null;

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [precio, setPrecio] = useState(producto?.precio?.toString() || '');
  const [desc, setDesc] = useState(producto?.desc || '');
  const [motor, setMotor] = useState(producto?.motor || '');
  const [velMax, setVelMax] = useState(producto?.velMax || '');

  const handleGuardar = async () => {
    if (!nombre || !precio || !desc || !motor || !velMax) {
      return Alert.alert('Error', 'Completa todos los campos.');
    }

    const data = {
      nombre,
      precio: parseFloat(precio),
      desc,
      motor,
      velMax,
    };

    try {
      if (esNuevo) {
        await addDoc(collection(db, 'productos'), data);
        Alert.alert('✅ Éxito', 'Producto agregado.');
      } else {
        await updateDoc(doc(db, 'productos', producto.id), data);
        Alert.alert('✅ Éxito', 'Producto actualizado.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: EcoCity V1" />

      <Text style={styles.label}>Precio (S/)</Text>
      <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" placeholder="Ej: 3500" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="Descripción del producto" multiline />

      <Text style={styles.label}>Motor</Text>
      <TextInput style={styles.input} value={motor} onChangeText={setMotor} placeholder="Ej: 1200W" />

      <Text style={styles.label}>Velocidad máxima</Text>
      <TextInput style={styles.input} value={velMax} onChangeText={setVelMax} placeholder="Ej: 45 km/h" />

      <TouchableOpacity style={styles.btn} onPress={handleGuardar}>
        <Text style={styles.btnText}>{esNuevo ? 'Agregar producto' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 15 },
  btn: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center', marginBottom: 40 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});