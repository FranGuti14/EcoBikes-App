import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useCatalogViewModel = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMotos(data);
      setLoading(false);
    }, (error) => {
      console.log('Error cargando productos:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { motos, loading };
};