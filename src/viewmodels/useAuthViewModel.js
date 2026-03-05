import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export const useAuthViewModel = (navigation) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserRole } = useContext(AppContext);

  const login = async () => {
    console.log('=== LOGIN INICIADO ===');
    console.log('Email:', email);
    console.log('Password:', password);

    try {
      const correoLimpio = email.trim();
      console.log('Intentando signIn...');

      const userCredential = await signInWithEmailAndPassword(auth, correoLimpio, password);
      console.log('signIn exitoso, uid:', userCredential.user.uid);

      const uid = userCredential.user.uid;
      const docRef = doc(db, 'users', uid);
      console.log('Buscando en Firestore...');

      const docSnap = await getDoc(docRef);
      console.log('docSnap exists:', docSnap.exists());

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        console.log('Role:', role);
        setUserRole(role);
        console.log('Navegando a Main...');
        navigation.replace('Main');
      } else {
        console.log('Usuario no encontrado en Firestore');
        alert('Usuario no encontrado en base de datos.');
      }
    } catch (error) {
      console.log('ERROR:', error.code, error.message);
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  return { email, setEmail, password, setPassword, login };
};