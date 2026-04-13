import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export default function UserMenu({ navigation }) {
  const [visible, setVisible] = useState(false);
  const [displayName, setDisplayName] = useState('Cargando...');
  const { userRole, setUserRole } = useContext(AppContext);

  // Busca el nombre del usuario cada vez que se abre el menú
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().nombre) {
            setDisplayName(docSnap.data().nombre);
          } else {
            // Fallback: Si no tiene nombre, muestra su email (o un texto por defecto)
            setDisplayName(auth.currentUser.email || 'Usuario');
          }
        } catch (error) {
          setDisplayName('Usuario');
        }
      }
    };
    
    if (visible) fetchUserData();
  }, [visible]);

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
    setVisible(false);
    navigation.replace('Login');
  };

  const goToProfile = () => {
    setVisible(false);
    navigation.navigate('Profile');
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
                
                {/* --- AHORA MUESTRA EL NOMBRE O CORREO --- */}
                <Text style={styles.role}>
                  {userRole === 'admin' ? '👑 ' : '👤 '} {displayName}
                </Text>
                
                <View style={styles.divider} />
                
                <TouchableOpacity style={styles.menuItem} onPress={goToProfile}>
                  <Ionicons name="person-outline" size={20} color="#34495e" />
                  <Text style={styles.menuText}>Mi Perfil</Text>
                </TouchableOpacity>

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
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  menuText: { color: '#34495e', fontWeight: 'bold', fontSize: 15 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 15 },
});