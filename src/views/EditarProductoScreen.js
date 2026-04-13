import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../config/firebase';

export default function EditarProductoScreen({ route, navigation }) {
  const { producto } = route.params;
  const esNuevo = producto === null;

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [precio, setPrecio] = useState(producto?.precio?.toString() || '');
  const [desc, setDesc] = useState(producto?.desc || '');
  const [motor, setMotor] = useState(producto?.motor || '');
  const [velMax, setVelMax] = useState(producto?.velMax || '');
  const [imagen, setImagen] = useState(producto?.imagen || '');

  // ─── Abrir galería ───────────────────────────────────────────
  const abrirGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar imágenes.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  // ─── Abrir cámara ────────────────────────────────────────────
  const abrirCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos.');
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  // ─── Guardar producto ────────────────────────────────────────
  const handleGuardar = async () => {
    if (!nombre || !precio || !desc || !motor || !velMax) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios.');
    }
    const data = {
      nombre,
      precio: parseFloat(precio),
      desc,
      motor,
      velMax,
      imagen: imagen.trim(),
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
    // ─── FIX: KeyboardAvoidingView evita que el teclado tape los inputs ───
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: EcoCity V1"
          returnKeyType="next"
        />

        <Text style={styles.label}>Precio (S/) *</Text>
        <TextInput
          style={styles.input}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          placeholder="Ej: 3500"
          returnKeyType="next"
        />

        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={desc}
          onChangeText={setDesc}
          placeholder="Descripción del producto"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Motor *</Text>
        <TextInput
          style={styles.input}
          value={motor}
          onChangeText={setMotor}
          placeholder="Ej: 1200W"
          returnKeyType="next"
        />

        <Text style={styles.label}>Velocidad máxima *</Text>
        <TextInput
          style={styles.input}
          value={velMax}
          onChangeText={setVelMax}
          placeholder="Ej: 45 km/h"
          returnKeyType="next"
        />

        {/* ─── FIX: Botones cámara/galería ANTES del campo URL ─── */}
        <Text style={styles.label}>Imagen del producto (opcional)</Text>

        <View style={styles.botonesImagen}>
          <TouchableOpacity style={styles.btnSecundario} onPress={abrirGaleria}>
            <Text style={styles.btnSecundarioText}>🖼️ Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecundario} onPress={abrirCamara}>
            <Text style={styles.btnSecundarioText}>📷 Cámara</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.labelOr}>— o pega una URL —</Text>
        <TextInput
          style={styles.input}
          value={imagen}
          onChangeText={setImagen}
          placeholder="https://ejemplo.com/imagen.jpg"
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* ─── Vista previa ─── */}
        {imagen.trim().length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Vista previa:</Text>
            <Image
              source={{ uri: imagen.trim() }}
              style={styles.preview}
              resizeMode="cover"
              onError={() => Alert.alert('Error', 'No se pudo cargar la imagen. Verifica la URL o vuelve a tomar la foto.')}
            />
            <TouchableOpacity style={styles.btnEliminarImagen} onPress={() => setImagen('')}>
              <Text style={styles.btnEliminarImagenText}>✕ Quitar imagen</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleGuardar}>
          <Text style={styles.btnText}>{esNuevo ? 'Agregar producto' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5, marginTop: 15 },
  labelOr: { fontSize: 12, color: '#95a5a6', textAlign: 'center', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  botonesImagen: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnSecundario: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  btnSecundarioText: { color: '#2c3e50', fontWeight: '600', fontSize: 14 },
  previewContainer: { marginTop: 15, alignItems: 'center' },
  previewLabel: { fontSize: 13, color: '#7f8c8d', marginBottom: 8 },
  preview: { width: '100%', height: 180, borderRadius: 10 },
  btnEliminarImagen: { marginTop: 8, padding: 8 },
  btnEliminarImagenText: { color: '#e74c3c', fontSize: 13 },
  btn: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});