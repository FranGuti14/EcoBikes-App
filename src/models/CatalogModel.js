import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const getMotos = async () => {
  const snapshot = await getDocs(collection(db, 'productos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};