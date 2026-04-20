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

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().nombre) {
            setDisplayName(docSnap.data().nombre);
          } else {
            setDisplayName(auth.currentUser.email || 'Usuario');
          }
        } catch {
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
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(displayName && displayName !== 'Cargando...') ? displayName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <View style={styles.menuHeader}>
                  <View style={styles.menuAvatar}>
                    <Text style={styles.menuAvatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.menuName} numberOfLines={1}>{displayName}</Text>
                    <Text style={styles.menuRole}>
                      {userRole === 'admin' ? '👑 Administrador' : '🌿 Cliente Eco'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={goToProfile}>
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="person-outline" size={18} color="#16A34A" />
                  </View>
                  <Text style={styles.menuItemText}>Mi Perfil</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                    <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                  </View>
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
  iconButton: { marginRight: 14 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4ADE80', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0D3320', fontWeight: '800', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menu: { position: 'absolute', top: 88, right: 14, backgroundColor: '#fff', borderRadius: 20, padding: 6, minWidth: 220, elevation: 10 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0D3320', justifyContent: 'center', alignItems: 'center' },
  menuAvatarText: { color: '#4ADE80', fontWeight: '800', fontSize: 18 },
  menuName: { fontSize: 14, fontWeight: '700', color: '#111827', maxWidth: 130 },
  menuRole: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  menuItemIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  logoutIcon: { backgroundColor: '#FEF2F2' },
  menuItemText: { flex: 1, color: '#374151', fontWeight: '600', fontSize: 14 },
  logoutText: { flex: 1, color: '#DC2626', fontWeight: '600', fontSize: 14 },
});