import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
const [userRole, setUserRole] = useState(null);
const [cart, setCart] = useState([]);

const addToCart = (moto) => {
setCart([...cart, moto]);
};

const clearCart = () => {
setCart([]);
};

return (
<AppContext.Provider value={{ userRole, setUserRole, cart, setCart, addToCart, clearCart }}>
{children}
</AppContext.Provider>
);
};