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
      <Stack.Screen
        name="Detalles"
        component={DetailScreen}
        options={{
          title: 'Bike Details',
          headerStyle: { backgroundColor: '#0D3320' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditarProducto"
        component={EditarProductoScreen}
        options={({ route }) => ({
          title: route.params?.producto ? 'Edit Product' : 'New Product',
          headerStyle: { backgroundColor: '#0D3320' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        })}
      />
    </Stack.Navigator>
  );
}

function MainTabs({ navigation }) {
  const { userRole } = useContext(AppContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = focused ? 'bicycle' : 'bicycle-outline';
          if (route.name === 'Ubícanos') iconName = focused ? 'map' : 'map-outline';
          if (route.name === 'Carrito') iconName = focused ? 'cart' : 'cart-outline';
          if (route.name === 'Admin') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: '#0D3320' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <UserMenu navigation={navigation} />,
      })}
    >
      <Tab.Screen
        name="Catálogo"
        component={CatalogStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Ubícanos"
        component={ServiceScreen}
        options={{ headerShown: false }}
      />
      {userRole === 'user' ? (
        <Tab.Screen
          name="Carrito"
          component={CartScreen}
          options={{ headerShown: false }}
        />
      ) : null}
      {userRole === 'admin' ? (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{ headerShown: false }}
        />
      ) : null}
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
              options={{
                title: 'My Profile',
                headerStyle: { backgroundColor: '#0D3320' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppProvider>
  );
}
