import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import { AppContext, AppProvider } from './src/context/AppContext';
import UserMenu from './src/views/UserMenu';

import AdminScreen from './src/views/AdminScreen';
import CartScreen from './src/views/CartScreen';
import CatalogScreen from './src/views/CatalogScreen';
import DetailScreen from './src/views/DetailScreen';
import EditarProductoScreen from './src/views/EditarProductoScreen';
import LoginScreen from './src/views/LoginScreen';
import ProfileScreen from './src/views/ProfileScreen';
import ServiceScreen from './src/views/ServiceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CatalogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CatálogoPrincipal" component={CatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detalles" component={DetailScreen} options={{ title: 'Detalles del Producto' }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminScreen} options={{ title: 'Gestionar Productos' }} />
      <Stack.Screen
        name="EditarProducto"
        component={EditarProductoScreen}
        options={({ route }) => ({
          title: route.params?.producto ? 'Editar Producto' : 'Nuevo Producto'
        })}
      />
    </Stack.Navigator>
  );
}

function MainTabs({ navigation }) {
  const { userRole, cart } = useContext(AppContext);

  // Calcula el total de unidades de manera segura sumando las cantidades
  const totalItems = cart?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'bicycle';
          if (route.name === 'Ubícanos') iconName = 'map';
          if (route.name === 'Carrito') iconName = 'cart';
          if (route.name === 'Admin') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: 'gray',
        headerTintColor: '#0D3320',
        headerRight: () => <UserMenu navigation={navigation} />,
      })}
    >
      <Tab.Screen name="Catálogo" component={CatalogStack} />
      <Tab.Screen name="Ubícanos" component={ServiceScreen} />
      {userRole === 'user' ? (
        <Tab.Screen 
          name="Carrito" 
          component={CartScreen} 
          options={{
            // React Navigation requiere pasar "null" para ocultar la burbuja si es 0
            tabBarBadge: totalItems > 0 ? totalItems : null, 
            tabBarBadgeStyle: { backgroundColor: '#16A34A', color: 'white' }
          }}
        />
      ) : null}
      {userRole === 'admin' ? <Tab.Screen name="Admin" component={AdminStack} /> : null}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Mi Perfil' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppProvider>
  );
}