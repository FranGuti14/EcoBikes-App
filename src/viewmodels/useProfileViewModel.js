import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../config/firebase';

export const useProfileViewModel = (navigation) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          // Carga la foto si ya la guardamos antes en Firestore
          setImageUri(docSnap.data().photoURL || null);
        }
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async (result) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      saveProfilePicture(uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Se necesita acceso a la galería.');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    handleImageSelection(result);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso', 'Se necesita acceso a la cámara.');
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    handleImageSelection(result);
  };

  const saveProfilePicture = async (uri) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        // setDoc con merge: true crea el documento si no existe y lo actualiza si ya existe
        await setDoc(userRef, { photoURL: uri, email: user.email }, { merge: true });
        Alert.alert('Éxito', 'Foto de perfil actualizada');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la foto: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Ajusta 'Login' al nombre exacto de tu ruta de inicio de sesión en el App.js
      navigation.replace('Login'); 
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return { userData, loading, imageUri, pickImage, takePhoto, logout };
};