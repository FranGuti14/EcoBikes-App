import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { Text, View } from 'react-native'; // Importamos View y Text para la pantalla temporal
import { Provider as PaperProvider } from 'react-native-paper';

import { AppContext, AppProvider } from './src/context/AppContext';
import UserMenu from './src/views/UserMenu';

import AdminScreen from './src/views/AdminScreen';
import CartScreen from './src/views/CartScreen';
import CatalogScreen from './src/views/CatalogScreen';
import DetailScreen from './src/views/DetailScreen';
import LoginScreen from './src/views/LoginScreen';
import ProfileScreen from './src/views/ProfileScreen';
import ServiceScreen from './src/views/ServiceScreen';

// --- PANTALLA FANTASMA PARA EVITAR EL ERROR ---
function PantallaEdicionTemporal() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>La edición está en otro archivo.</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CatalogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CatálogoPrincipal" component={CatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detalles" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminScreen} options={{ title: 'Gestionar Productos' }} />
      <Stack.Screen
        name="EditarProducto"
        component={PantallaEdicionTemporal} // Usamos la fantasma en lugar de importar un archivo
        options={{ title: 'Editar Producto' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs({ navigation }) {
  const { userRole } = useContext(AppContext);

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
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: 'gray',
        headerTintColor: '#2c3e50',
        headerRight: () => <UserMenu navigation={navigation} />,
      })}
    >
      <Tab.Screen name="Catálogo" component={CatalogStack} />
      <Tab.Screen name="Ubícanos" component={ServiceScreen} />
      {userRole === 'user' ? <Tab.Screen name="Carrito" component={CartScreen} /> : null}
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