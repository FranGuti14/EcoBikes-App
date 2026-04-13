import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

export default function ProfileScreen({ navigation }) {
  const { userData, loading, imageUri, pickImage, takePhoto, logout } = useProfileViewModel(navigation);

  if (loading) {
    return <ActivityIndicator size="large" color="#27ae60" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sin Foto</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <Text style={styles.buttonText}>📷 Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Text style={styles.buttonText}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{userData?.nombre || 'Usuario Registrado'}</Text>

        <Text style={styles.label}>Correo Electrónico:</Text>
        <Text style={styles.value}>{userData?.email || 'Sin correo'}</Text>

        <Text style={styles.label}>Rol en la app:</Text>
        <Text style={styles.roleValue}>{userData?.role === 'admin' ? 'Administrador 👑' : 'Cliente 🚲'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', alignItems: 'center' },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, marginTop: 10 },
  imageContainer: { marginBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: '#27ae60' },
  placeholderImage: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#bdc3c7' },
  placeholderText: { color: '#666', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  cameraButton: { backgroundColor: '#3498db', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, elevation: 2 },
  galleryButton: { backgroundColor: '#9b59b6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, elevation: 2 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoCard: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 30 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  value: { fontSize: 18, color: '#2c3e50', fontWeight: '600', marginBottom: 15 },
  roleValue: { fontSize: 18, color: '#e67e22', fontWeight: 'bold', textTransform: 'uppercase' },
  logoutButton: { backgroundColor: '#e74c3c', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});