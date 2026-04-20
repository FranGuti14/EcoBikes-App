import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [cart, setCart] = useState([]);

  const addToCart = (moto) => {
    const itemExiste = cart.find(item => item.id === moto.id);
    
    if (itemExiste) {
      if (itemExiste.cantidad < moto.stock) {
        setCart(cart.map(item => 
          item.id === moto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      }
    } else {
      if (moto.stock > 0) {
        setCart([...cart, { ...moto, cantidad: 1 }]);
      }
    }
  };

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