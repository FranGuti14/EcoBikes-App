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
  const [modo, setModo] = useState('login');

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
        {/* ─── Hero Section ─── */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🌿</Text>
          </View>
          <Text style={styles.brandName}>EcoBikes</Text>
          <Text style={styles.tagline}>Ride green. Live clean.</Text>
        </View>

        {/* ─── Card ─── */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, modo === 'login' && styles.tabActivo]}
              onPress={() => setModo('login')}
            >
              <Text style={[styles.tabText, modo === 'login' && styles.tabTextActivo]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, modo === 'registro' && styles.tabActivo]}
              onPress={() => setModo('registro')}
            >
              <Text style={[styles.tabText, modo === 'registro' && styles.tabTextActivo]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {modo === 'registro' && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Alex Green"
                  placeholderTextColor="#9CA3AF"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={modo === 'registro' ? 'Min. 6 characters' : '••••••••'}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.btnPrincipal, loading && styles.btnDesactivado]}
              onPress={modo === 'login' ? login : registrar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrincipalText}>
                  {modo === 'login' ? 'Sign In →' : 'Create Account →'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkCambio}
              onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
            >
              <Text style={styles.linkCambioText}>
                {modo === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>🌱 Every ride plants a tree</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0D3320',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1A6B3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: { fontSize: 36 },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: '#6EE7A0',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActivo: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#22C55E',
  },
  tabText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  tabTextActivo: { color: '#0D3320', fontWeight: '700' },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: '#111827',
  },
  btnPrincipal: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDesactivado: { backgroundColor: '#9CA3AF' },
  btnPrincipalText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkCambio: { marginTop: 18, alignItems: 'center' },
  linkCambioText: { color: '#16A34A', fontSize: 13, fontWeight: '500' },
  footerText: {
    textAlign: 'center',
    color: '#6EE7A0',
    fontSize: 13,
    marginTop: 28,
    fontWeight: '500',
  },
});
