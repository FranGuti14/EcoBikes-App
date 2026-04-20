import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [cart, setCart] = useState([]);

  // Añadir al carrito respetando el límite de stock
  const addToCart = (moto) => {
    const itemExiste = cart.find(item => item.id === moto.id);
    
    if (itemExiste) {
      // Solo suma si la cantidad actual es menor que el stock
      if (itemExiste.cantidad < moto.stock) {
        setCart(cart.map(item => 
          item.id === moto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      }
    } else {
      // Si es nuevo y hay stock mayor a 0, lo añade con cantidad 1
      if (moto.stock > 0) {
        setCart([...cart, { ...moto, cantidad: 1 }]);
      }
    }
  };

  // Restar del carrito o eliminar
  const removeFromCart = (motoId) => {
    const itemExiste = cart.find(item => item.id === motoId);
    if (itemExiste.cantidad > 1) {
      setCart(cart.map(item => 
        item.id === motoId ? { ...item, cantidad: item.cantidad - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== motoId));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider value={{ 
      userRole, setUserRole, 
      cart, setCart, 
      addToCart, removeFromCart, clearCart 
    }}>
      {children}
    </AppContext.Provider>
  );
};