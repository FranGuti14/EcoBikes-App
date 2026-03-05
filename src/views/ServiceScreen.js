import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useServiceViewModel } from '../viewmodels/useServiceViewModel';

export default function ServiceScreen() {
  const { fecha, setFecha, motivo, setMotivo, storeInfo, agendarCita } = useServiceViewModel();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Agendar Mantenimiento</Text>
        <TextInput 
          style={styles.input} placeholder="Ej: 05/03/2026 10:00 AM" 
          value={fecha} onChangeText={setFecha}
        />
        <TextInput 
          style={[styles.input, styles.textArea]} placeholder="Motivo o problema..." 
          value={motivo} onChangeText={setMotivo} multiline
        />
        <TouchableOpacity style={styles.button} onPress={agendarCita}>
          <Text style={styles.buttonText}>Confirmar Cita</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sede Imperial</Text>
        <Text style={styles.infoText}>📍 {storeInfo.ubicacion}</Text>
        <Text style={styles.infoText}>⏰ {storeInfo.horario}</Text>
        <Text style={styles.infoText}>📞 {storeInfo.telefono}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#e67e22', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoCard: { backgroundColor: '#2c3e50', padding: 20, borderRadius: 10 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#ecf0f1', marginBottom: 5 }
});