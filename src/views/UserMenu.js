import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useContext, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { auth } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export default function UserMenu({ navigation }) {
  const [visible, setVisible] = useState(false);
  const { userRole, setUserRole } = useContext(AppContext);

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
    setVisible(false);
    navigation.replace('Login');
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.iconButton}>
        <Ionicons name="person-circle-outline" size={28} color="#2c3e50" />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <Text style={styles.role}>
                  {userRole === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                </Text>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: { marginRight: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menu: {
    position: 'absolute', top: 90, right: 15,
    backgroundColor: '#fff', borderRadius: 10,
    padding: 15, minWidth: 180,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  role: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 15 },
});