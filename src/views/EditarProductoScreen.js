import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';

export default function EditarProductoScreen({ navigation, route }) {
  const productoEdit = route.params?.producto;
  const [nombre, setNombre] = useState(productoEdit?.nombre || '');
  const [precio, setPrecio] = useState(productoEdit?.precio?.toString() || '');
  const [stock, setStock] = useState(productoEdit?.stock?.toString() || '0');
  const [imagen, setImagen] = useState(productoEdit?.imagen || '');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission', 'Camera access required');
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !stock) return Alert.alert('Error', 'Name, price and stock are required');
    setLoading(true);
    try {
      const productData = { nombre, precio: parseFloat(precio), stock: parseInt(stock), imagen };
      if (productoEdit?.id) {
        await updateDoc(doc(db, 'productos', productoEdit.id), productData);
        Alert.alert('✅ Updated', 'Product updated successfully');
      } else {
        await addDoc(collection(db, 'productos'), productData);
        Alert.alert('✅ Added', 'Product added to catalog');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderSub}>{productoEdit ? 'Editing' : 'New product'}</Text>
          <Text style={styles.pageHeaderTitle}>{productoEdit ? 'Modify Bike' : 'Add Bike 🚴'}</Text>
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.preview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}

          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imgBtn} onPress={takePhoto}>
              <Text style={styles.imgBtnIcon}>📷</Text>
              <Text style={styles.imgBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
              <Text style={styles.imgBtnIcon}>🖼️</Text>
              <Text style={styles.imgBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. EcoCity V1 Pro"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.rowFields}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Price (S/)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.fieldLabel}>Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            value={imagen}
            onChangeText={setImagen}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={guardarProducto}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Saving...' : (productoEdit ? 'Save Changes ✓' : 'Add to Catalog +')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F0FDF4', paddingBottom: 40 },

  pageHeader: {
    backgroundColor: '#0D3320',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  pageHeaderSub: { fontSize: 12, color: '#86EFAC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  pageHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },

  imageSection: { padding: 16 },
  preview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  imagePlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { color: '#6B7280', fontWeight: '500' },
  imageButtons: { flexDirection: 'row', gap: 12 },
  imgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  imgBtnIcon: { fontSize: 18 },
  imgBtnText: { color: '#16A34A', fontWeight: '700', fontSize: 14 },

  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0D3320',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    color: '#111827',
  },
  rowFields: { flexDirection: 'row' },

  saveBtn: {
    backgroundColor: '#16A34A',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
