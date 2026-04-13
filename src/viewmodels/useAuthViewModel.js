import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';

export const useAuthViewModel = (navigation) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserRole } = useContext(AppContext);

  // ─── Guardar usuario en Firestore ────────────────────────────
  const guardarUsuarioFirestore = async (uid, datos) => {
    await setDoc(doc(db, 'users', uid), datos, { merge: true });
  };

  // ─── Login con email/contraseña ──────────────────────────────
  const login = async () => {
    if (!email || !password) return alert('Completa todos los campos.');
    setLoading(true);
    try {
      const correoLimpio = email.trim();
      const userCredential = await signInWithEmailAndPassword(auth, correoLimpio, password);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role);
        navigation.replace('Main');
      } else {
        alert('Usuario no encontrado en base de datos.');
      }
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Registro manual ─────────────────────────────────────────
  const registrar = async () => {
    if (!nombre || !email || !password) return alert('Completa todos los campos.');
    if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      const correoLimpio = email.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, correoLimpio, password);
      const uid = userCredential.user.uid;
      await guardarUsuarioFirestore(uid, {
        nombre: nombre.trim(),
        email: correoLimpio,
        role: 'user',
        creadoEn: new Date().toISOString(),
      });
      setUserRole('user');
      navigation.replace('Main');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está registrado. Intenta iniciar sesión.');
      } else {
        alert('Error al registrarse: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Login / Registro con Google ─────────────────────────────
  // Nota: requiere expo-auth-session instalado
  // npm install expo-auth-session expo-crypto
  const loginConGoogle = async (idToken) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (!docSnap.exists()) {
        // Primera vez → crear documento en Firestore
        await guardarUsuarioFirestore(uid, {
          nombre: userCredential.user.displayName || 'Usuario',
          email: userCredential.user.email,
          role: 'user',
          creadoEn: new Date().toISOString(),
        });
      }
      const role = docSnap.exists() ? docSnap.data().role : 'user';
      setUserRole(role);
      navigation.replace('Main');
    } catch (error) {
      alert('Error con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    nombre, setNombre,
    loading,
    login,
    registrar,
    loginConGoogle,
  };
};