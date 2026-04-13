import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
 
export default function LoginScreen({ navigation }) {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
 
  const {
    email, setEmail,
    password, setPassword,
    nombre, setNombre,
    loading,
    login,
    registrar,
  } = useAuthViewModel(navigation);
 
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Logo ─── */}
        <Text style={styles.logo}>🚴 EcoBikes</Text>
        <Text style={styles.subtitle}>Bicicletas eléctricas</Text>
 
        {/* ─── Tabs Login / Registro ─── */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, modo === 'login' && styles.tabActivo]}
            onPress={() => setModo('login')}
          >
            <Text style={[styles.tabText, modo === 'login' && styles.tabTextActivo]}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, modo === 'registro' && styles.tabActivo]}
            onPress={() => setModo('registro')}
          >
            <Text style={[styles.tabText, modo === 'registro' && styles.tabTextActivo]}>
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>
 
        {/* ─── Formulario ─── */}
        <View style={styles.form}>
          {modo === 'registro' && (
            <>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </>
          )}
 
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
 
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
 
          {/* ─── Botón principal ─── */}
          <TouchableOpacity
            style={[styles.btnPrincipal, loading && styles.btnDesactivado]}
            onPress={modo === 'login' ? login : registrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrincipalText}>
                {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Text>
            )}
          </TouchableOpacity>
 
          {/* ─── Cambiar modo ─── */}
          <TouchableOpacity
            style={styles.linkCambio}
            onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
          >
            <Text style={styles.linkCambioText}>
              {modo === 'login'
                ? '¿No tienes cuenta? Regístrate aquí'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#27ae60',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 32,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
  tabTextActivo: { color: '#27ae60', fontWeight: 'bold' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: '#2c3e50',
  },
  btnPrincipal: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  btnDesactivado: { backgroundColor: '#95a5a6' },
  btnPrincipalText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkCambio: { marginTop: 16, alignItems: 'center' },
  linkCambioText: { color: '#27ae60', fontSize: 13 },
});