import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getStoreInfo } from '../models/ServiceModel';

export const useServiceViewModel = () => {
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [storeInfo, setStoreInfo] = useState({});

  useEffect(() => {
    setStoreInfo(getStoreInfo());
  }, []);

  const agendarCita = () => {
    if (fecha === '' || motivo === '') {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    Alert.alert('Cita Confirmada', `Tu mantenimiento para el ${fecha} ha sido agendado.`);
    setFecha('');
    setMotivo('');
  };

  return { fecha, setFecha, motivo, setMotivo, storeInfo, agendarCita };
};