import { useEffect, useState } from 'react';
import { getMotos } from '../models/CatalogModel';

export const useCatalogViewModel = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMotos = async () => {
      try {
        const data = await getMotos();
        setMotos(data);
      } catch (error) {
        console.log('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMotos();
  }, []);

  return { motos, loading };
};