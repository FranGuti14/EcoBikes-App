# 🛵 EcoBikes App

Aplicación móvil para la gestión de comercio de motos eléctricas, desarrollada con **React Native + Expo** bajo arquitectura **MVVM** y backend en **Firebase**.

> Proyecto académico desarrollado por el equipo **EcoBikes Team** — Instituto de Educación Superior Tecnológico IDAT.

---

## 📱 Demo

| Login | Catálogo | Detalle | Admin CRUD |
|-------|----------|---------|------------|
| Autenticación por roles | Productos en tiempo real | Vista de producto | Gestión de productos |

> *Capturas disponibles próximamente.*

---

## 🚀 Funcionalidades

### Usuario
- 🔐 Autenticación con Firebase Auth (email/contraseña)
- 📦 Catálogo de motos eléctricas en tiempo real (Firestore `onSnapshot`)
- 🔍 Vista de detalle de producto con imagen y descripción
- 🛒 Carrito de compras
- 🔧 Solicitud de citas de mantenimiento

### Administrador
- ➕ Crear, editar y eliminar productos (CRUD completo)
- 🖼️ Vista previa de imagen al editar producto
- 👁️ Panel exclusivo con navegación por tabs condicional según rol

---

## 🏗️ Arquitectura

El proyecto sigue el patrón **MVVM (Model-View-ViewModel)**:

```
ECOBIKES-MVVM/
├── src/
│   ├── config/
│   │   └── firebase.js           # Configuración Firebase
│   ├── context/
│   │   └── AppContext.js         # Contexto global de la app
│   ├── models/
│   │   ├── CatalogModel.js       # Modelo de productos
│   │   └── ServiceModel.js       # Modelo de servicios
│   ├── viewmodels/
│   │   ├── useAuthViewModel.js   # Lógica de autenticación
│   │   ├── useCatalogViewModel.js
│   │   └── useServiceViewModel.js
│   └── views/
│       ├── LoginScreen.js        # Pantalla de inicio de sesión
│       ├── CatalogScreen.js      # Catálogo de productos
│       ├── DetailScreen.js       # Detalle de producto
│       ├── CartScreen.js         # Carrito de compras
│       └── ServiceScreen.js      # Solicitud de servicios
├── App.js                        # Navegación y control de roles
├── app.json
└── package.json
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| React Native | Framework de desarrollo móvil |
| Expo | Entorno de desarrollo y build |
| Firebase Auth | Autenticación de usuarios |
| Cloud Firestore | Base de datos en tiempo real |
| React Navigation | Navegación entre pantallas |
| JavaScript (ES6+) | Lenguaje principal |

---

## ⚙️ Instalación y ejecución

### Prerrequisitos
- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Cuenta en [Firebase](https://firebase.google.com/) con proyecto creado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/FranGuti14/EcoBikes-App.git
cd EcoBikes-App

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# Edita src/config/firebase.js con tus credenciales de Firebase

# 4. Iniciar la app
npx expo start
```

Escanea el QR con **Expo Go** en tu celular Android o iOS.

---

## 🔐 Roles de usuario

 -Diego
## 🗺️ Roadmap

- [x] Autenticación Firebase con roles
- [x] Catálogo en tiempo real con Firestore
- [x] CRUD de productos (admin)
- [x] Vista previa de imagen al editar
- [ ] Registro de nuevos usuarios
- [ ] Perfil de usuario editable
- [ ] Órdenes de compra guardadas en Firestore
- [ ] Citas de mantenimiento guardadas en Firestore
- [ ] Panel admin para gestión de órdenes y citas

---

## 👥 Equipo

| Integrante | GitHub |
|---|---|
| Diego Franccesco Gutierrez Manco | [@FranGuti14](https://github.com/FranGuti14) |
| Richard Araque | EcoBikes Team |

---

## 📄 Licencia

Proyecto académico — Instituto de Educación Superior Tecnológico IDAT, Lima, Perú.
