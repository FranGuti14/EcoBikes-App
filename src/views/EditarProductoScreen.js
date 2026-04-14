import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { db } from '../config/firebase';

export default function EditarProductoScreen({ navigation, route }) {
  const productoEdit = route.params?.producto;
  
  // Estados del formulario
  const [nombre, setNombre] = useState(productoEdit?.nombre || '');
  const [precio, setPrecio] = useState(productoEdit?.precio?.toString() || '');
  const [stock, setStock] = useState(productoEdit?.stock?.toString() || '0');
  const [imagen, setImagen] = useState(productoEdit?.imagen || '');
  const [loading, setLoading] = useState(false);

  // Función para Galería
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  // Función para Cámara
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Se necesita acceso a la cámara');
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !stock) return Alert.alert('Error', 'Nombre, precio y stock son obligatorios');
    setLoading(true);
    try {
      const productData = { 
        nombre, 
        precio: parseFloat(precio), 
        stock: parseInt(stock),
        imagen 
      };

      if (productoEdit?.id) {
        // Actualizar existente
        await updateDoc(doc(db, 'productos', productoEdit.id), productData);
        Alert.alert('Éxito', 'Producto actualizado');
      } else {
        // Crear nuevo
        await addDoc(collection(db, 'productos'), productData);
        Alert.alert('Éxito', 'Producto agregado al catálogo');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{productoEdit ? 'Modificar Moto' : 'Registrar Nueva Moto'}</Text>
        
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.camBtn} onPress={takePhoto}>
            <Text style={styles.btnText}>📷 Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galBtn} onPress={pickImage}>
            <Text style={styles.btnText}>🖼️ Usar Galería</Text>
          </TouchableOpacity>
        </View>

        {imagen ? <Image source={{ uri: imagen }} style={styles.preview} /> : (
          <View style={styles.noImage}><Text style={{color: '#7f8c8d'}}>Sin imagen</Text></View>
        )}

        <TextInput style={styles.input} placeholder="Nombre de la moto (Ej. EcoCity V1)" value={nombre} onChangeText={setNombre} />
        
        <View style={styles.row}>
          <TextInput style={[styles.input, {flex: 1, marginRight: 5}]} placeholder="Precio (S/)" value={precio} onChangeText={setPrecio} keyboardType="numeric" />
          <TextInput style={[styles.input, {flex: 1, marginLeft: 5}]} placeholder="Stock disponible" value={stock} onChangeText={setStock} keyboardType="numeric" />
        </View>

        <TextInput style={styles.input} placeholder="URL de la imagen (o usa los botones arriba)" value={imagen} onChangeText={setImagen} />

        <PaperButton mode="contained" onPress={guardarProducto} loading={loading} style={styles.saveBtn} buttonColor="#27ae60">
          Guardar Producto
        </PaperButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2c3e50' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  imageButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  camBtn: { flex: 1, backgroundColor: '#34495e', padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center', elevation: 2 },
  galBtn: { flex: 1, backgroundColor: '#2980b9', padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center', elevation: 2 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', resizeMode: 'cover' },
  noImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ecf0f1' },
  saveBtn: { marginTop: 10, paddingVertical: 5 }
});