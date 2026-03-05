import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export default function LoginScreen({ navigation }) {
  const { email, setEmail, password, setPassword, login } = useAuthViewModel(navigation);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoBikes</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#27ae60' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});