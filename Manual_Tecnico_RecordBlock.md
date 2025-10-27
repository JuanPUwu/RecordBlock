# MANUAL TÉCNICO

## Sistema de Gestión de Registros de Infraestructura - RecordBlock

---

## 0. Sección inicial del documento

### 0.1. Portada

**Nombre del Sistema:** RecordBlock  
**Versión del Documento:** 1.0  
**Fecha:** Diciembre 2024  
**Autor:** Analista de Software Senior  
**Cliente/Organización:** Axity Colombia - Área de Ciberseguridad

### 0.2. Control de Versiones del Documento

| Versión | Fecha          | Cambios                    | Responsable                 |
| ------- | -------------- | -------------------------- | --------------------------- |
| 1.0     | Diciembre 2024 | Documento inicial completo | Analista de Software Senior |

### 0.3. Tabla de Contenido

1. [Introducción](#introducción)
2. [Requerimientos](#requerimientos)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Diseño y Estructura del Software](#diseño-y-estructura-del-software)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Base de Datos](#base-de-datos)
8. [API REST](#api-rest)
9. [Instalación y Uso](#instalación-y-uso)
10. [Despliegue](#despliegue)
11. [Seguridad](#seguridad)
12. [Logs y Errores](#logs-y-errores)
13. [Recuperación y Continuidad](#recuperación-y-continuidad)
14. [Pruebas](#pruebas)
15. [Mantenimiento y Soporte](#mantenimiento-y-soporte)
16. [Documentación Final](#documentación-final)

---

## 1. Introducción

### 1.1. Descripción General del Sistema

RecordBlock es una aplicación web desarrollada para la gestión segura de registros de infraestructura tecnológica. El sistema permite a los administradores gestionar usuarios clientes y sus respectivos registros de infraestructura, mientras que los clientes pueden visualizar y gestionar únicamente sus propios registros.

### 1.2. Objetivo del Sistema

- **Gestión de Usuarios:** Administración centralizada de usuarios con roles diferenciados (admin/cliente)
- **Registro de Infraestructura:** Almacenamiento y gestión de información detallada de equipos de infraestructura
- **Seguridad:** Implementación de autenticación JWT con refresh tokens y verificación por correo
- **Exportación:** Capacidad de exportar registros en formatos PDF y Excel
- **Interfaz Responsiva:** Aplicación web moderna con React

### 1.3. Alcance del Proyecto

#### 1.3.1. Qué incluye:

- Sistema de autenticación y autorización
- Gestión de usuarios (CRUD completo)
- Gestión de registros de infraestructura
- Sistema de notificaciones por correo
- Exportación de datos (PDF/Excel)
- Interfaz web responsiva
- Aplicación web responsiva
- Documentación API con Swagger

#### 1.3.2. Qué no incluye:

- Sistema de auditoría avanzado
- Integración con sistemas externos
- Reportes avanzados de analytics
- Sistema de backup automático
- Monitoreo en tiempo real

### 1.4. Alcance del Documento

Este manual técnico cubre la instalación, configuración, uso y mantenimiento del sistema RecordBlock, incluyendo aspectos de seguridad, despliegue y troubleshooting.

### 1.5. Glosario de Términos

- **JWT:** JSON Web Token, estándar para autenticación
- **Refresh Token:** Token de larga duración para renovar access tokens
- **CORS:** Cross-Origin Resource Sharing, política de seguridad web
- **SQLite:** Base de datos relacional ligera
- **Vite:** Herramienta de build para aplicaciones frontend modernas
- **Swagger:** Herramienta para documentación de APIs

---

## 2. Requerimientos

### 2.1. Requerimientos del Sistema

#### 2.1.1. Requerimientos Funcionales (RF)

**RF-001:** Sistema de Autenticación

- El sistema debe permitir login con email y contraseña
- Debe implementar verificación de correo electrónico
- Debe soportar recuperación de contraseña por correo

**RF-002:** Gestión de Usuarios

- Los administradores deben poder crear, leer, actualizar y eliminar usuarios
- Los usuarios deben tener roles diferenciados (admin/cliente)
- Debe existir validación de permisos por rol

**RF-003:** Gestión de Registros

- Los administradores deben poder gestionar registros de todos los clientes
- Los clientes deben poder gestionar solo sus propios registros
- Debe existir validación de campos obligatorios

**RF-004:** Exportación de Datos

- Debe permitir exportar registros en formato PDF
- Debe permitir exportar registros en formato Excel
- Debe incluir filtros de búsqueda

**RF-005:** Interfaz de Usuario

- Debe ser responsiva y moderna
- Debe incluir validaciones en tiempo real
- Debe mostrar notificaciones de estado

#### 2.1.2. Requerimientos No Funcionales (RNF)

**RNF-001:** Seguridad

- Las contraseñas deben estar encriptadas (bcrypt)
- Los tokens JWT deben tener expiración configurable
- Debe implementar blacklist de tokens

**RNF-002:** Rendimiento

- Tiempo de respuesta < 2 segundos para operaciones CRUD
- Soporte para al menos 100 usuarios concurrentes
- Base de datos optimizada con índices

**RNF-003:** Disponibilidad

- Tiempo de actividad del 99%
- Recuperación automática de sesiones
- Manejo robusto de errores

**RNF-004:** Usabilidad

- Interfaz intuitiva y fácil de usar
- Validaciones claras y mensajes de error descriptivos
- Soporte para navegadores modernos

### 2.2. Requerimientos de Hardware

#### 2.2.1. Servidor de Desarrollo:

- CPU: 2+ cores, 2.0+ GHz
- RAM: 4+ GB
- Almacenamiento: 10+ GB libres
- Red: Conexión a internet estable

#### 2.2.2. Servidor de Producción:

- CPU: 4+ cores, 2.5+ GHz
- RAM: 8+ GB
- Almacenamiento: 50+ GB SSD
- Red: 100+ Mbps

### 2.3. Requerimientos de Software

#### 2.3.1. Backend:

- Node.js 18+
- SQLite3
- NPM 8+

#### 2.3.2. Frontend:

- Node.js 18+
- NPM 8+
- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)

#### 2.3.3. Sistema Operativo:

- Windows 10+
- macOS 10.15+
- Linux Ubuntu 18.04+

### 2.4. Dependencias Tecnológicas

#### 2.4.1. Backend:

- Express.js 5.1.0
- SQLite3 5.1.7
- JWT 9.0.2
- bcrypt 6.0.0
- Nodemailer 7.0.9
- CORS 2.8.5
- Swagger 6.2.8

#### 2.4.2. Frontend:

- React 19.1.0
- Vite 7.0.4
- React Router DOM 7.7.1
- Axios 1.11.0
- SweetAlert2 11.22.5
- ExcelJS 4.4.0
- PDF-lib 1.17.1

---

## 3. Arquitectura del Sistema

### 3.1. Descripción General de Arquitectura

RecordBlock implementa una arquitectura de tres capas:

1. **Capa de Presentación:** React (Frontend)
2. **Capa de Lógica de Negocio:** Node.js + Express (Backend)
3. **Capa de Datos:** SQLite (Base de Datos)

### 3.2. Diagrama de Arquitectura Lógica

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (React)       │◄──►│   (Express)     │◄──►│   Datos         │
│                 │    │                 │    │   (SQLite)      │
│ • AuthContext   │    │ • Controllers   │    │                 │
│ • Components    │    │ • Middleware    │    │ • usuario       │
│ • Services      │    │ • Routes        │    │ • informacion_  │
│ • Utils         │    │ • Utils         │    │   usuario       │
└─────────────────┘    └─────────────────┘    │ • tokens_*      │
                                              └─────────────────┘
```

### 3.3. Diagrama de Arquitectura Física

```
┌─────────────────────────────────────────────────────────────┐
│                    Servidor de Aplicación                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Frontend  │  │   Backend   │  │   Base de Datos     │  │
│  │   (Port     │  │   (Port     │  │   (SQLite File)     │  │
│  │    5173)    │  │    3000)    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
│
└─── Servicio de Correo (SMTP Gmail)
```

### 3.4. Tecnologías Utilizadas

#### 3.4.1. Backend:

- **Node.js:** Runtime de JavaScript
- **Express.js:** Framework web minimalista
- **SQLite3:** Base de datos relacional
- **JWT:** Autenticación basada en tokens
- **bcrypt:** Encriptación de contraseñas
- **Nodemailer:** Envío de correos
- **Swagger:** Documentación de API

#### 3.4.2. Frontend:

- **React:** Biblioteca de interfaz de usuario
- **Vite:** Herramienta de build
- **React Router:** Enrutamiento
- **Axios:** Cliente HTTP
- **SweetAlert2:** Modales y alertas

### 3.5. Modelo de Comunicación Cliente-Servidor

1. **Autenticación:** Cliente envía credenciales → Servidor valida → Retorna JWT
2. **Operaciones CRUD:** Cliente envía peticiones con JWT → Servidor valida token → Procesa → Retorna respuesta
3. **Refresh Token:** Cliente envía refresh token → Servidor genera nuevo access token
4. **Logout:** Cliente solicita logout → Servidor invalida tokens

### 3.6. Flujo General del Sistema

1. Usuario accede a la aplicación
2. Sistema verifica autenticación
3. Si no autenticado → Redirige a login
4. Si autenticado → Carga interfaz según rol
5. Usuario realiza operaciones CRUD
6. Sistema valida permisos y procesa
7. Respuesta enviada al cliente

---

## 4. Diseño y Estructura del Software

### 4.1. Descripción de Módulos del Sistema

#### 4.1.1. Módulo de Autenticación

**Ubicación:** `Backend/src/controllers/authController.js`

**Funcionalidades:**

- Login de usuarios
- Generación de JWT tokens
- Refresh de tokens
- Logout y invalidación
- Recuperación de contraseña
- Verificación de correo

**Componentes:**

- `loginUsuario()`: Autenticación principal
- `refreshToken()`: Renovación de tokens
- `logout()`: Cierre de sesión
- `forgotPassword()`: Solicitud de recuperación
- `resetPassword()`: Restablecimiento de contraseña

#### 4.1.2. Módulo de Gestión de Usuarios

**Ubicación:** `Backend/src/controllers/usuarioController.js`

**Funcionalidades:**

- CRUD de usuarios
- Verificación de correo
- Actualización de contraseñas
- Gestión de roles

**Componentes:**

- `obtenerUsuarios()`: Listar usuarios (admin)
- `crearUsuario()`: Crear nuevo usuario
- `actualizarUsuario()`: Actualizar contraseña
- `eliminarUsuario()`: Eliminar usuario
- `verificarCorreo()`: Verificación por token

#### 4.1.3. Módulo de Información de Infraestructura

**Ubicación:** `Backend/src/controllers/infoUsuarioController.js`

**Funcionalidades:**

- CRUD de registros de infraestructura
- Validación de campos obligatorios
- Filtrado por usuario
- Gestión de permisos por rol

**Componentes:**

- `obtenerInformacion()`: Listar registros
- `crearInformacion()`: Crear registro
- `actualizarInformacion()`: Actualizar registro
- `eliminarInformacion()`: Eliminar registro

#### 4.1.4. Módulo de Notificaciones/Correos

**Ubicación:** `Backend/src/utils/email.js`

**Funcionalidades:**

- Envío de correos de verificación
- Notificaciones de recuperación
- Alertas de cambio de contraseña
- Plantillas HTML personalizadas

**Componentes:**

- `enviarCorreoVerificacion()`: Verificación de cuenta
- `enviarCorreoRecuperacion()`: Recuperación de contraseña
- `enviarCorreoCambioPasswordPropio()`: Notificación personal
- `enviarCorreoCambioPasswordAdmin()`: Notificación administrativa

---

## 5. Backend

### Descripción General del Backend

El backend de RecordBlock está construido con Node.js y Express.js, implementando una API REST con autenticación JWT, gestión de usuarios y registros de infraestructura.

### Estructura del Proyecto Backend

```
Backend/
├── src/
│   ├── app.js                 # Configuración principal de Express
│   ├── config/
│   │   ├── database.js        # Configuración de SQLite
│   │   ├── blacklist.js       # Gestión de tokens invalidados
│   │   └── swagger.js         # Configuración de Swagger
│   ├── controllers/
│   │   ├── authController.js  # Controlador de autenticación
│   │   ├── usuarioController.js # Controlador de usuarios
│   │   └── infoUsuarioController.js # Controlador de información
│   ├── middleware/
│   │   └── authMiddleware.js  # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.routes.js     # Rutas de autenticación
│   │   ├── usuario.routes.js  # Rutas de usuarios
│   │   └── infoUsuario.routes.js # Rutas de información
│   ├── utils/
│   │   ├── dbHelpers.js       # Utilidades de base de datos
│   │   └── email.js           # Utilidades de correo
│   ├── views/                 # Plantillas HTML
│   └── assets/                # Recursos estáticos
├── database.db                # Base de datos SQLite
├── package.json               # Dependencias del proyecto
└── server.js                  # Punto de entrada
```

### Dependencias Backend

```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^7.0.9",
    "sqlite3": "^5.1.7",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "validator": "^13.15.15"
  }
}
```

### Rutas (Endpoints)

#### Autenticación (`/api/auth`)

- `POST /login` - Iniciar sesión
- `POST /refresh` - Renovar token
- `POST /logout` - Cerrar sesión
- `POST /forgot-password` - Solicitar recuperación
- `GET /reset-password/:token` - Página de restablecimiento
- `POST /reset-password/:token` - Restablecer contraseña

#### Usuarios (`/api/usuario`)

- `GET /` - Listar usuarios (admin)
- `POST /` - Crear usuario (admin)
- `PUT /:id` - Actualizar contraseña
- `DELETE /:id` - Eliminar usuario (admin)
- `GET /verificar/:token` - Verificar correo

#### Información (`/api/informacion_usuario`)

- `GET /` - Listar registros
- `POST /` - Crear registro
- `PUT /` - Actualizar registro
- `DELETE /` - Eliminar registro

### Controladores

#### AuthController

```javascript
// Funciones principales
export const loginUsuario = async (req, res) => {
  /* ... */
};
export const refreshToken = async (req, res) => {
  /* ... */
};
export const logout = async (req, res) => {
  /* ... */
};
export const forgotPassword = async (req, res) => {
  /* ... */
};
export const resetPassword = async (req, res) => {
  /* ... */
};
```

#### UsuarioController

```javascript
// Funciones principales
export const obtenerUsuarios = async (req, res) => {
  /* ... */
};
export const crearUsuario = async (req, res) => {
  /* ... */
};
export const actualizarUsuario = async (req, res) => {
  /* ... */
};
export const eliminarUsuario = async (req, res) => {
  /* ... */
};
export const verificarCorreo = async (req, res) => {
  /* ... */
};
```

### Servicios

#### Base de Datos

- `all()`: Ejecutar consultas SELECT
- `run()`: Ejecutar consultas INSERT/UPDATE/DELETE
- `getAsync()`: Obtener un registro
- `runAsync()`: Ejecutar consulta asíncrona

#### Correo Electrónico

- Configuración SMTP con Gmail
- Plantillas HTML personalizadas
- Adjuntos de imagen corporativa

### Middleware

#### AuthMiddleware

```javascript
export const verificarToken = async (req, res, next) => {
  // Verificación de JWT y blacklist
};

export const verificarAdmin = (req, res, next) => {
  // Verificación de rol administrador
};
```

### Configuración del Servidor

```javascript
// app.js
const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/informacion_usuario", infoUsuarioRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### Conexión Base de Datos

```javascript
// database.js
const db = new sqlite3.Database("database.db");
db.run("PRAGMA foreign_keys = ON");

// Creación de tablas
db.serialize(async () => {
  // Tabla usuario
  db.run(`CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL,
    verificado BOOLEAN DEFAULT 0,
    refresh_token TEXT
  )`);

  // Otras tablas...
});
```

### Variables de Entorno Backend (.env)

```env
# JWT Secrets
JWT_ACCESS_SECRET=tu_secreto_access_token
JWT_REFRESH_SECRET=tu_secreto_refresh_token

# Email Configuration
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
```

### Gestión JWT y Autenticación

#### Configuración de Tokens

```javascript
const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60,
  REFRESH_TOKEN_EXPIRY: "8h",
  REFRESH_TOKEN_EXPIRY_MS: 8 * 60 * 60 * 1000,
};
```

#### Proceso de Autenticación

1. Usuario envía credenciales
2. Servidor valida credenciales
3. Genera access token (15 min) y refresh token (8h)
4. Guarda refresh token en base de datos
5. Envía access token en respuesta y refresh token en cookie

### Validaciones

#### Validación de Usuario

- Email válido con validator
- Contraseña encriptada con bcrypt
- Verificación de correo obligatoria

#### Validación de Información

- Campos obligatorios: hostname, plataforma, marca/modelo, tipo, firmware/versión S.O, ubicación, licenciamiento
- Normalización de texto para comparaciones
- Validación de duplicados

---

## 6. Frontend

### Descripción General del Frontend

El frontend de RecordBlock está construido con React 19 y Vite, implementando una SPA (Single Page Application) con autenticación JWT, gestión de estado con Context API y una interfaz moderna y responsiva.

### Estructura del Proyecto Frontend

```
Frontend/
├── src/
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   ├── context/
│   │   └── AuthContext.jsx     # Contexto de autenticación
│   ├── components/
│   │   ├── CardAdmin.jsx       # Tarjeta de administrador
│   │   ├── CardUsuario.jsx     # Tarjeta de usuario
│   │   ├── Nav.jsx             # Navegación
│   │   ├── PrivateRoute.jsx    # Ruta privada
│   │   ├── PublicRoute.jsx     # Ruta pública
│   │   ├── SearchNav.jsx       # Búsqueda en navegación
│   │   ├── SepHrz.jsx          # Separador horizontal
│   │   └── Spinner.jsx         # Cargador
│   ├── pages/
│   │   ├── HomeAdmin.jsx       # Página de administrador
│   │   ├── HomeUsuario.jsx     # Página de usuario
│   │   └── Login.jsx           # Página de login
│   ├── services/
│   │   ├── forgotPassService.js # Servicio de recuperación
│   │   ├── infoUsuarioServices.js # Servicio de información
│   │   └── usuarioService.js   # Servicio de usuarios
│   ├── utils/
│   │   ├── apiHelper.js        # Utilidades de API
│   │   ├── excellUtils.js      # Utilidades de Excel
│   │   ├── pdfUtils.js         # Utilidades de PDF
│   │   └── textUtils.jsx       # Utilidades de texto
│   ├── validations/
│   │   └── eschemas.js         # Esquemas de validación
│   ├── css/                    # Estilos CSS
│   └── assets/                 # Recursos estáticos
├── public/                     # Archivos públicos
├── package.json                # Dependencias
└── vite.config.js              # Configuración de Vite
```

### Dependencias Frontend

```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.1",
    "axios": "^1.11.0",
    "exceljs": "^4.4.0",
    "file-saver": "^2.0.5",
    "pdf-lib": "^1.17.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.62.0",
    "react-hot-toast": "^2.5.2",
    "react-router-dom": "^7.7.1",
    "react-select": "^5.10.2",
    "reactjs-popup": "^2.0.6",
    "sweetalert2": "^11.22.5",
    "yup": "^1.7.0"
  },
  "devDependencies": {
    "vite": "^7.0.4",
    "@vitejs/plugin-react-swc": "^3.10.2"
  }
}
```

### Gestión de Autenticación (Context API)

#### AuthContext

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Funciones principales
  const login = async (email, password) => {
    /* ... */
  };
  const logout = async () => {
    /* ... */
  };
  const refreshToken = async () => {
    /* ... */
  };

  // Interceptores de Axios
  const setupInterceptors = (token) => {
    /* ... */
  };
};
```

#### Características del Context

- Gestión automática de tokens
- Interceptores para renovación automática
- Manejo de errores de autenticación
- Estado global de usuario

### Protección de Rutas

#### PrivateRoute

```javascript
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/" />;
};
```

#### PublicRoute

```javascript
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated() ? children : <Navigate to="/homeAdmin" />;
};
```

### Consumo API

#### Configuración de Axios

```javascript
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});
```

#### Interceptores

- **Request:** Añade token de autorización
- **Response:** Maneja renovación automática de tokens

### Estado Global y Hooks

#### Hooks Personalizados

- `useAuth()`: Acceso al contexto de autenticación
- `useUsuarioService()`: Servicios de usuario
- `useInfoUsuarioService()`: Servicios de información
- `useForgotPasswordService()`: Servicios de recuperación

### Estilos y Assets

#### Estructura CSS

```
css/
├── card.css           # Estilos de tarjetas
├── home.css           # Estilos de páginas principales
├── login.css          # Estilos de login
├── nav.css            # Estilos de navegación
├── searchNav.css      # Estilos de búsqueda
├── sepHrz.css         # Estilos de separadores
├── spinner.css        # Estilos de cargador
├── swalStyles.css     # Estilos de SweetAlert
└── swalStyles.js      # Configuración de SweetAlert
```

#### Assets

- Fuentes SF Pro Display
- Iconos PNG para interfaz
- Imágenes corporativas
- Plantillas de documentos

### Configuración inicial

#### Vite Config

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
```

### Variables de entorno Frontend

No se requieren variables de entorno específicas para el frontend, ya que la configuración de la API está hardcodeada en el código.

---

## 7. Base de Datos

### Modelo Entidad Relación (MER)

```
┌─────────────────┐
│     usuario     │
├─────────────────┤
│ id (PK)         │
│ nombre          │
│ email (UNIQUE)  │
│ password        │
│ rol             │
│ verificado      │
│ refresh_token   │
└─────────────────┘
         │
         │ 1:N
         │
┌─────────────────┐
│ informacion_    │
│ usuario         │
├─────────────────┤
│ id (PK)         │
│ usuario_id (FK) │
│ datos (JSON)    │
└─────────────────┘

┌─────────────────┐
│ tokens_         │
│ verificacion    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ token_hash      │
│ expires_at      │
└─────────────────┘

┌─────────────────┐
│ tokens_         │
│ recuperacion    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ token_hash      │
│ expires_at      │
│ used            │
└─────────────────┘

┌─────────────────┐
│ token_blacklist │
├─────────────────┤
│ id (PK)         │
│ token           │
│ expiresAt       │
└─────────────────┘
```

### Modelo Relacional / Tablas

#### Tabla: usuario

| Campo         | Tipo    | Restricciones              | Descripción            |
| ------------- | ------- | -------------------------- | ---------------------- |
| id            | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador único    |
| nombre        | TEXT    | NOT NULL                   | Nombre del usuario     |
| email         | TEXT    | NOT NULL, UNIQUE           | Correo electrónico     |
| password      | TEXT    | NOT NULL                   | Contraseña encriptada  |
| rol           | TEXT    | NOT NULL                   | Rol (admin/cliente)    |
| verificado    | BOOLEAN | DEFAULT 0                  | Estado de verificación |
| refresh_token | TEXT    | NULL                       | Token de renovación    |

#### Tabla: informacion_usuario

| Campo      | Tipo    | Restricciones              | Descripción          |
| ---------- | ------- | -------------------------- | -------------------- |
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador único  |
| usuario_id | INTEGER | NOT NULL, FK               | Referencia a usuario |
| datos      | TEXT    | NOT NULL                   | JSON con información |

#### Tabla: tokens_verificacion

| Campo      | Tipo     | Restricciones              | Descripción          |
| ---------- | -------- | -------------------------- | -------------------- |
| id         | INTEGER  | PRIMARY KEY, AUTOINCREMENT | Identificador único  |
| user_id    | INTEGER  | FK                         | Referencia a usuario |
| token_hash | TEXT     | NOT NULL                   | Hash del token       |
| expires_at | DATETIME | NOT NULL                   | Fecha de expiración  |

#### Tabla: tokens_recuperacion

| Campo      | Tipo     | Restricciones              | Descripción          |
| ---------- | -------- | -------------------------- | -------------------- |
| id         | INTEGER  | PRIMARY KEY, AUTOINCREMENT | Identificador único  |
| user_id    | INTEGER  | NOT NULL, FK               | Referencia a usuario |
| token_hash | TEXT     | NOT NULL                   | Hash del token       |
| expires_at | DATETIME | NOT NULL                   | Fecha de expiración  |
| used       | BOOLEAN  | DEFAULT 0                  | Estado de uso        |

#### Tabla: token_blacklist

| Campo     | Tipo    | Restricciones              | Descripción             |
| --------- | ------- | -------------------------- | ----------------------- |
| id        | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador único     |
| token     | TEXT    | NOT NULL                   | Token invalidado        |
| expiresAt | INTEGER | NOT NULL                   | Timestamp de expiración |

### Diccionario de Datos

#### Campos de información_usuario (datos JSON)

| Campo                | Tipo   | Obligatorio | Descripción                |
| -------------------- | ------ | ----------- | -------------------------- |
| Hostname             | STRING | Sí          | Nombre del servidor/equipo |
| Plataforma           | STRING | Sí          | Sistema operativo          |
| Marca/Modelo         | STRING | Sí          | Fabricante y modelo        |
| Tipo                 | STRING | Sí          | Tipo de equipo             |
| Firmware/Versión S.O | STRING | Sí          | Versión del sistema        |
| Ubicación            | STRING | Sí          | Ubicación física           |
| Licenciamiento       | STRING | Sí          | Tipo de licencia           |

### Consultas SQL importantes

#### Obtener usuarios con información

```sql
SELECT u.*, COUNT(iu.id) as total_registros
FROM usuario u
LEFT JOIN informacion_usuario iu ON u.id = iu.usuario_id
WHERE u.rol = 'cliente'
GROUP BY u.id;
```

#### Obtener información por usuario

```sql
SELECT iu.*, u.nombre as usuario_nombre
FROM informacion_usuario iu
JOIN usuario u ON iu.usuario_id = u.id
WHERE u.id = ?;
```

#### Limpiar tokens expirados

```sql
DELETE FROM tokens_verificacion
WHERE expires_at < datetime('now');

DELETE FROM tokens_recuperacion
WHERE expires_at < datetime('now');
```

### Respaldo de Base de Datos

#### Método 1: Copia directa del archivo

```bash
cp database.db database_backup_$(date +%Y%m%d_%H%M%S).db
```

#### Método 2: Exportar a SQL

```bash
sqlite3 database.db .dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Método 3: Script automatizado

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DB_FILE="database.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Crear respaldo
cp $DB_FILE $BACKUP_DIR/database_backup_$DATE.db

# Comprimir respaldo
gzip $BACKUP_DIR/database_backup_$DATE.db

# Eliminar respaldos antiguos (más de 30 días)
find $BACKUP_DIR -name "*.db.gz" -mtime +30 -delete
```

---

## 8. API REST (Documentación Técnica)

### Tabla General de Endpoints

| Método | Endpoint                          | Descripción                | Autenticación | Rol Requerido |
| ------ | --------------------------------- | -------------------------- | ------------- | ------------- |
| POST   | `/api/auth/login`                 | Iniciar sesión             | No            | -             |
| POST   | `/api/auth/refresh`               | Renovar token              | Cookie        | -             |
| POST   | `/api/auth/logout`                | Cerrar sesión              | No            | -             |
| POST   | `/api/auth/forgot-password`       | Solicitar recuperación     | No            | -             |
| GET    | `/api/auth/reset-password/:token` | Página de restablecimiento | No            | -             |
| POST   | `/api/auth/reset-password/:token` | Restablecer contraseña     | No            | -             |
| GET    | `/api/usuario`                    | Listar usuarios            | Bearer        | admin         |
| POST   | `/api/usuario`                    | Crear usuario              | Bearer        | admin         |
| PUT    | `/api/usuario/:id`                | Actualizar contraseña      | Bearer        | admin/self    |
| DELETE | `/api/usuario/:id`                | Eliminar usuario           | Bearer        | admin         |
| GET    | `/api/usuario/verificar/:token`   | Verificar correo           | No            | -             |
| GET    | `/api/informacion_usuario`        | Listar registros           | Bearer        | admin/cliente |
| POST   | `/api/informacion_usuario`        | Crear registro             | Bearer        | admin/cliente |
| PUT    | `/api/informacion_usuario`        | Actualizar registro        | Bearer        | admin/cliente |
| DELETE | `/api/informacion_usuario`        | Eliminar registro          | Bearer        | admin/cliente |

### Documentación Endpoint por Endpoint

#### POST /api/auth/login

**Descripción:** Iniciar sesión en el sistema

**Parámetros:**

- Body: `{ "email": "string", "password": "string" }`

**Respuesta Exitosa (200):**

```json
{
  "mensaje": "Login exitoso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "rol": "admin",
    "nombre": "Administrador"
  }
}
```

**Códigos de Error:**

- 400: Email y contraseña son requeridos
- 401: Usuario o contraseña no válido
- 403: Debes verificar tu correo antes de iniciar sesión
- 500: Error en el servidor

#### POST /api/auth/refresh

**Descripción:** Renovar access token usando refresh token

**Parámetros:**

- Cookie: `refreshToken`

**Respuesta Exitosa (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "rol": "admin",
    "email": "admin@example.com",
    "nombre": "Administrador"
  }
}
```

**Códigos de Error:**

- 401: Refresh token requerido
- 403: Refresh token inválido o expirado

#### POST /api/usuario

**Descripción:** Crear un nuevo usuario (solo admin)

**Parámetros:**

- Headers: `Authorization: Bearer <token>`
- Body: `{ "nombre": "string", "email": "string", "password": "string" }`

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "message": "Usuario creado correctamente. Se envió un correo de verificación."
}
```

**Códigos de Error:**

- 400: Datos inválidos o faltantes
- 403: Solo los administradores pueden crear clientes
- 500: Error al crear cliente

#### GET /api/informacion_usuario

**Descripción:** Obtener registros de información

**Parámetros:**

- Headers: `Authorization: Bearer <token>`
- Query: `usuario_id` (opcional, solo admin)

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "info_id": 1,
      "usuario_id": 2,
      "datos": [
        {
          "Hostname": "ServidorPrincipal",
          "Plataforma": "Windows Server",
          "Marca/Modelo": "Dell PowerEdge R740",
          "Tipo": "Servidor",
          "Firmware/Versión S.O": "v2.4.1",
          "Ubicación": "Bogotá - Centro de Datos",
          "Licenciamiento": "Windows Server 2022 Standard"
        }
      ]
    }
  ]
}
```

### Autenticación via Header Bearer Token

```javascript
// Ejemplo de uso
const response = await fetch("/api/usuario", {
  method: "GET",
  headers: {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json",
  },
});
```

### Colección Postman

**Variables de entorno:**

- `baseUrl`: http://localhost:3000
- `accessToken`: (se actualiza automáticamente)
- `refreshToken`: (se actualiza automáticamente)

**Pre-request Script para login:**

```javascript
pm.sendRequest(
  {
    url: pm.environment.get("baseUrl") + "/api/auth/login",
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: "admin@example.com",
        password: "Contraseña123@",
      }),
    },
  },
  function (err, response) {
    if (response.json().accessToken) {
      pm.environment.set("accessToken", response.json().accessToken);
    }
  }
);
```

---

## 9. Instalación y Uso

### Requisitos previos

1. **Node.js 18+** instalado
2. **NPM 8+** instalado
3. **Git** para clonar el repositorio
4. **Cuenta de Gmail** para envío de correos

### Instalación Backend paso a paso

1. **Clonar el repositorio:**

```bash
git clone <repository-url>
cd RecordBlock/Backend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

```bash
# Crear archivo .env
touch .env
```

4. **Editar archivo .env:**

```env
JWT_ACCESS_SECRET=tu_secreto_access_token_muy_seguro
JWT_REFRESH_SECRET=tu_secreto_refresh_token_muy_seguro
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
```

5. **Configurar Gmail App Password:**

   - Ir a Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate
   - Usar la contraseña generada en EMAIL_PASS

6. **Inicializar base de datos:**

```bash
# La base de datos se crea automáticamente al ejecutar el servidor
npm start
```

7. **Verificar instalación:**
   - Abrir http://localhost:3000/api-docs
   - Debe mostrar la documentación Swagger

### Instalación Frontend paso a paso

1. **Navegar al directorio frontend:**

```bash
cd ../Frontend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Ejecutar en modo desarrollo:**

```bash
npm run dev
```

4. **Verificar instalación:**
   - Abrir http://localhost:5173
   - Debe mostrar la página de login

### Configuración de entorno local

1. **Backend (.env):**

```env
# JWT Secrets (generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=generar_secreto_seguro_64_caracteres
JWT_REFRESH_SECRET=generar_otro_secreto_seguro_64_caracteres

# Email Configuration
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
```

2. **Frontend:**
   - No requiere configuración adicional
   - La URL del backend está hardcodeada en el código

### Ejecución del sistema

1. **Terminal 1 - Backend:**

```bash
cd Backend
npm start
```

2. **Terminal 2 - Frontend:**

```bash
cd Frontend
npm run dev
```

3. **Acceder a la aplicación:**
   - Web: http://localhost:5173
   - API Docs: http://localhost:3000/api-docs

### Construcción para Producción

1. **Construir la aplicación:**

```bash
cd Frontend
npm run build
```

2. **Previsualizar build:**

```bash
npm run preview
```

---

## 10. Despliegue

### Modelo de Despliegue

RecordBlock utiliza un modelo de despliegue tradicional con servidor único:

```
Internet → Servidor Web → Aplicación Node.js → Base de Datos SQLite
```

### Configuración en Servidor

1. **Preparar servidor:**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

2. **Desplegar aplicación:**

```bash
# Clonar repositorio
git clone <repository-url>
cd RecordBlock

# Instalar dependencias Backend
cd Backend
npm install --production

# Instalar dependencias Frontend
cd ../Frontend
npm install
npm run build

# Copiar build al servidor
sudo cp -r dist/* /var/www/recordblock/
```

### Uso de PM2

1. **Crear archivo ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: "recordblock-backend",
      script: "./Backend/server.js",
      cwd: "/path/to/RecordBlock",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

2. **Iniciar con PM2:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3. **Comandos útiles:**

```bash
pm2 status          # Ver estado
pm2 logs            # Ver logs
pm2 restart all     # Reiniciar
pm2 stop all        # Detener
pm2 delete all      # Eliminar
```

### Uso de Nginx (opcional)

1. **Instalar Nginx:**

```bash
sudo apt install nginx
```

2. **Configurar sitio:**

```bash
sudo nano /etc/nginx/sites-available/recordblock
```

3. **Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/recordblock;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Activar sitio:**

```bash
sudo ln -s /etc/nginx/sites-available/recordblock /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Uso de Docker (opcional)

1. **Crear Dockerfile para Backend:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install --production
COPY Backend/ .
EXPOSE 3000
CMD ["node", "server.js"]
```

2. **Crear docker-compose.yml:**

```yaml
version: "3.8"
services:
  backend:
    build: ./Backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
```

3. **Ejecutar con Docker:**

```bash
docker-compose up -d
```

### Checklist de producción

- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Certificados SSL instalados
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Monitoreo de logs activado
- [ ] PM2 configurado para auto-restart
- [ ] Dominio apuntando al servidor
- [ ] Pruebas de conectividad realizadas

---

## 11. Seguridad

### Seguridad por autenticación

#### JWT Tokens

- **Access Token:** 15 minutos de duración
- **Refresh Token:** 8 horas de duración
- **Algoritmo:** HS256
- **Secrets:** Generados con crypto.randomBytes(64)

#### Proceso de Autenticación

1. Usuario envía credenciales
2. Servidor valida con bcrypt
3. Genera tokens JWT firmados
4. Refresh token se guarda en BD
5. Access token se envía en respuesta

### Políticas de autorización (Roles)

#### Rol Admin

- Acceso completo al sistema
- CRUD de usuarios
- CRUD de información de todos los clientes
- Gestión de contraseñas

#### Rol Cliente

- Solo su propia información
- No puede gestionar otros usuarios
- Acceso limitado a funciones básicas

### Protección de cookies

```javascript
// Configuración de cookies
res.cookie("refreshToken", refreshToken, {
  httpOnly: true, // No accesible desde JavaScript
  secure: false, // true en producción con HTTPS
  sameSite: "lax", // Protección CSRF
  maxAge: 8 * 60 * 60 * 1000, // 8 horas
});
```

### Protección contra ataques comunes

#### XSS (Cross-Site Scripting)

- Validación de entrada en frontend y backend
- Sanitización de datos antes de mostrar
- Headers de seguridad configurados

#### CSRF (Cross-Site Request Forgery)

- Cookies con SameSite=Lax
- Validación de origen en requests
- Tokens CSRF (implementación futura)

#### SQL Injection

- Uso de prepared statements
- Validación de parámetros
- No concatenación directa de strings

#### DoS (Denial of Service)

- Rate limiting (implementación futura)
- Validación de tamaño de payload
- Timeout de requests

### Gestión de contraseñas

#### Encriptación

- **Algoritmo:** bcrypt
- **Salt Rounds:** 10
- **Hash:** Generado automáticamente

#### Validación

- Longitud mínima: 8 caracteres
- Debe contener mayúsculas, minúsculas, números y símbolos
- No puede ser igual a email o nombre

#### Recuperación

- Token único de 15 minutos
- Envío por correo electrónico
- Un solo uso por token

### Ciclo de vida de tokens

#### Access Token

1. **Generación:** Al hacer login
2. **Uso:** En cada request autenticado
3. **Expiración:** 15 minutos
4. **Renovación:** Automática con refresh token
5. **Invalidación:** Al hacer logout

#### Refresh Token

1. **Generación:** Al hacer login
2. **Almacenamiento:** Base de datos + cookie httpOnly
3. **Uso:** Para renovar access token
4. **Expiración:** 8 horas
5. **Rotación:** Nuevo token en cada renovación
6. **Invalidación:** Al hacer logout o expirar

#### Blacklist de Tokens

```javascript
// Agregar token a blacklist
await addToBlacklist(token, expirySeconds);

// Verificar si está en blacklist
const isBlacklisted = await isBlacklisted(token);
```

---

## 12. Logs y Errores

### Tipos de errores

#### Errores de Autenticación (4xx)

- 400: Datos inválidos o faltantes
- 401: Token requerido o expirado
- 403: Acceso denegado o token inválido
- 404: Recurso no encontrado

#### Errores de Servidor (5xx)

- 500: Error interno del servidor
- 502: Error de base de datos
- 503: Servicio no disponible

### Manejo de errores Backend

#### Middleware de errores

```javascript
// En app.js
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});
```

#### Logging estructurado

```javascript
// Ejemplo de log
console.log(`[auth] Token de recuperación creado para ${email}`);
console.error("Error al hacer login:", err.message);
```

### Manejo de errores Frontend

#### Interceptores de Axios

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar renovar token
      const newToken = await refreshToken();
      if (newToken) {
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
```

#### Notificaciones de error

```javascript
// SweetAlert2 para errores críticos
Swal.fire({
  title: "Error",
  text: "Ha ocurrido un error inesperado",
  icon: "error",
});

// Toast para errores menores
toast.error("Error al cargar datos");
```

### Registro (Logs)

#### Logs del servidor

```bash
# Ver logs en tiempo real
pm2 logs recordblock-backend

# Ver logs específicos
pm2 logs recordblock-backend --lines 100
```

#### Logs de aplicación

```javascript
// Logs personalizados
console.log(`[${new Date().toISOString()}] [AUTH] Login exitoso: ${email}`);
console.error(`[${new Date().toISOString()}] [ERROR] ${error.message}`);
```

### Monitoreo

#### Métricas básicas

- Tiempo de respuesta de API
- Número de requests por minuto
- Errores por endpoint
- Uso de memoria

#### Herramientas recomendadas

- **PM2 Monitoring:** `pm2 monit`
- **Logrotate:** Para rotación de logs
- **Uptime monitoring:** Servicios externos

---

## 13. Recuperación y Continuidad

### Plan de Recuperación

#### Escenarios de fallo

1. **Falló del servidor de aplicación**
2. **Corrupción de base de datos**
3. **Pérdida de archivos del sistema**
4. **Ataque de seguridad**

#### Procedimientos de recuperación

**1. Fallo del servidor:**

```bash
# Verificar estado
pm2 status

# Reiniciar servicios
pm2 restart all

# Verificar logs
pm2 logs
```

**2. Corrupción de base de datos:**

```bash
# Restaurar desde backup
cp database_backup_YYYYMMDD_HHMMSS.db database.db

# Verificar integridad
sqlite3 database.db "PRAGMA integrity_check;"
```

**3. Pérdida de archivos:**

```bash
# Restaurar desde Git
git pull origin main

# Reinstalar dependencias
npm install

# Restaurar base de datos
# (usar backup más reciente)
```

### Backups

#### Estrategia de backup

- **Frecuencia:** Diaria
- **Retención:** 30 días
- **Ubicación:** Servidor local + nube
- **Verificación:** Semanal

#### Script de backup automatizado

```bash
#!/bin/bash
# backup_recordblock.sh

BACKUP_DIR="/backups/recordblock"
DB_FILE="/path/to/database.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio
mkdir -p $BACKUP_DIR

# Backup de base de datos
cp $DB_FILE $BACKUP_DIR/database_$DATE.db

# Backup de código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /path/to/RecordBlock

# Comprimir y limpiar
gzip $BACKUP_DIR/database_$DATE.db
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Subir a nube (opcional)
# aws s3 cp $BACKUP_DIR/ s3://backup-bucket/recordblock/ --recursive
```

#### Configurar cron

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /path/to/backup_recordblock.sh
```

### Restauración de Sistema

#### Procedimiento completo

1. **Preparar servidor limpio**
2. **Instalar dependencias**
3. **Restaurar código desde Git**
4. **Restaurar base de datos**
5. **Configurar variables de entorno**
6. **Iniciar servicios**
7. **Verificar funcionamiento**

#### Tiempo de recuperación objetivo

- **RTO (Recovery Time Objective):** 4 horas
- **RPO (Recovery Point Objective):** 24 horas

### Planes ante fallos

#### Fallo de base de datos

1. Detener aplicación
2. Restaurar backup más reciente
3. Verificar integridad
4. Reiniciar aplicación
5. Notificar usuarios si es necesario

#### Fallo de servidor

1. Activar servidor de respaldo
2. Restaurar datos
3. Actualizar DNS
4. Verificar funcionamiento
5. Documentar incidente

#### Ataque de seguridad

1. Aislar sistema
2. Evaluar daños
3. Restaurar desde backup limpio
4. Aplicar parches de seguridad
5. Cambiar todas las contraseñas
6. Notificar a usuarios

### Estrategia de escalabilidad

#### Escalabilidad horizontal

- Múltiples instancias de aplicación
- Load balancer
- Base de datos compartida

#### Escalabilidad vertical

- Aumentar recursos del servidor
- Optimizar consultas de base de datos
- Implementar caché

#### Monitoreo de rendimiento

- CPU y memoria
- Tiempo de respuesta
- Número de conexiones
- Uso de disco

---

## 14. Pruebas

### Pruebas unitarias (si existen)

**Estado actual:** No implementadas

**Recomendación:** Implementar con Jest

```javascript
// Ejemplo de prueba unitaria
describe("AuthController", () => {
  test("should login with valid credentials", async () => {
    const req = {
      body: { email: "test@example.com", password: "password123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await loginUsuario(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

### Pruebas funcionales

#### Casos de prueba principales

**1. Autenticación**

- Login con credenciales válidas
- Login con credenciales inválidas
- Login con usuario no verificado
- Logout exitoso
- Renovación de token

**2. Gestión de usuarios (Admin)**

- Crear usuario exitosamente
- Listar usuarios
- Actualizar contraseña
- Eliminar usuario
- Verificar correo

**3. Gestión de información**

- Crear registro de infraestructura
- Listar registros
- Actualizar registro
- Eliminar registro
- Filtrado por usuario

**4. Exportación**

- Exportar a PDF
- Exportar a Excel
- Filtros de búsqueda

### Pruebas de integración

#### Flujo completo de usuario

1. Registro de usuario por admin
2. Verificación de correo
3. Login del usuario
4. Creación de registro
5. Actualización de registro
6. Exportación de datos
7. Logout

#### Flujo de administrador

1. Login como admin
2. Creación de cliente
3. Gestión de registros del cliente
4. Actualización de contraseñas
5. Exportación de datos

### Casos de prueba manuales

#### Lista de verificación

**Autenticación:**

- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Login con usuario no verificado
- [ ] Recuperación de contraseña
- [ ] Verificación de correo
- [ ] Logout

**Gestión de usuarios:**

- [ ] Crear usuario (admin)
- [ ] Listar usuarios (admin)
- [ ] Actualizar contraseña
- [ ] Eliminar usuario (admin)
- [ ] Validación de permisos

**Gestión de información:**

- [ ] Crear registro
- [ ] Listar registros
- [ ] Actualizar registro
- [ ] Eliminar registro
- [ ] Filtros de búsqueda

**Exportación:**

- [ ] Exportar PDF
- [ ] Exportar Excel
- [ ] Filtros en exportación

### Pruebas con Postman

#### Colección de pruebas

1. **Setup:** Login y obtener token
2. **Auth Tests:** Probar endpoints de autenticación
3. **User Tests:** Probar CRUD de usuarios
4. **Info Tests:** Probar CRUD de información
5. **Export Tests:** Probar exportación

#### Variables de entorno

- `baseUrl`: http://localhost:3000
- `accessToken`: (dinámico)
- `refreshToken`: (dinámico)

### Validación de seguridad

#### Pruebas de seguridad

- [ ] Validación de JWT tokens
- [ ] Verificación de roles
- [ ] Protección contra SQL injection
- [ ] Validación de entrada
- [ ] Headers de seguridad

#### Herramientas recomendadas

- **OWASP ZAP:** Escaneo de vulnerabilidades
- **Burp Suite:** Pruebas de penetración
- **Postman Security:** Pruebas de API

---

## 15. Mantenimiento y Soporte

### Mantenimiento Correctivo

#### Tipos de problemas comunes

**1. Problemas de autenticación**

- Token expirado
- Refresh token inválido
- Usuario no verificado

**Solución:**

```bash
# Verificar logs
pm2 logs recordblock-backend

# Reiniciar servicio
pm2 restart recordblock-backend
```

**2. Problemas de base de datos**

- Corrupción de datos
- Tablas bloqueadas
- Espacio en disco

**Solución:**

```bash
# Verificar integridad
sqlite3 database.db "PRAGMA integrity_check;"

# Limpiar espacio
sqlite3 database.db "VACUUM;"
```

**3. Problemas de correo**

- SMTP no responde
- Credenciales incorrectas
- Límite de envío alcanzado

**Solución:**

- Verificar configuración SMTP
- Actualizar credenciales
- Implementar cola de correos

### Mantenimiento Preventivo

#### Tareas diarias

- [ ] Verificar logs de error
- [ ] Monitorear uso de recursos
- [ ] Verificar estado de servicios

#### Tareas semanales

- [ ] Revisar logs de seguridad
- [ ] Verificar integridad de base de datos
- [ ] Actualizar dependencias menores

#### Tareas mensuales

- [ ] Actualizar dependencias mayores
- [ ] Revisar configuración de seguridad
- [ ] Optimizar base de datos
- [ ] Verificar backups

### Actualización del sistema

#### Proceso de actualización

1. **Preparación:**

   - Crear backup completo
   - Probar en entorno de desarrollo
   - Documentar cambios

2. **Despliegue:**

   - Detener servicios
   - Actualizar código
   - Instalar dependencias
   - Ejecutar migraciones
   - Iniciar servicios

3. **Verificación:**
   - Probar funcionalidades críticas
   - Verificar logs
   - Monitorear rendimiento

#### Comandos de actualización

```bash
# Backup antes de actualizar
./backup_recordblock.sh

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Reiniciar servicios
pm2 restart all

# Verificar estado
pm2 status
```

### Gestión de dependencias

#### Actualización de dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar dependencias mayores
npm install package@latest
```

#### Auditoría de seguridad

```bash
# Auditar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix
```

### Solución de problemas comunes (Troubleshooting)

#### Problema: Error 500 en API

**Causa:** Error interno del servidor
**Solución:**

1. Verificar logs: `pm2 logs`
2. Revisar configuración de base de datos
3. Verificar variables de entorno
4. Reiniciar servicio

#### Problema: No se envían correos

**Causa:** Configuración SMTP incorrecta
**Solución:**

1. Verificar credenciales de Gmail
2. Verificar App Password
3. Revisar configuración de Nodemailer
4. Probar conectividad SMTP

#### Problema: Token inválido

**Causa:** Token expirado o manipulado
**Solución:**

1. Verificar configuración JWT
2. Revisar blacklist de tokens
3. Verificar sincronización de tiempo
4. Limpiar cookies del navegador

#### Problema: Base de datos bloqueada

**Causa:** Transacciones no cerradas
**Solución:**

1. Verificar procesos activos
2. Cerrar conexiones abiertas
3. Reiniciar aplicación
4. Restaurar desde backup si es necesario

#### Problema: Frontend no carga

**Causa:** Error en build o configuración
**Solución:**

1. Verificar build: `npm run build`
2. Revisar configuración de Vite
3. Verificar archivos estáticos
4. Limpiar caché del navegador

---

## 16. Documentación Final

### Buenas prácticas

#### Desarrollo

- **Código limpio:** Nombres descriptivos, funciones pequeñas
- **Comentarios:** Documentar lógica compleja
- **Validación:** Validar entrada en frontend y backend
- **Manejo de errores:** Capturar y manejar todos los errores
- **Logging:** Registrar eventos importantes

#### Seguridad

- **Tokens:** Rotar refresh tokens regularmente
- **Contraseñas:** Usar bcrypt con salt rounds adecuados
- **Validación:** Sanitizar todas las entradas
- **Headers:** Implementar headers de seguridad
- **HTTPS:** Usar siempre en producción

#### Base de datos

- **Backups:** Automatizar respaldos regulares
- **Índices:** Crear índices para consultas frecuentes
- **Integridad:** Usar foreign keys y constraints
- **Limpieza:** Eliminar datos obsoletos regularmente

### Recomendaciones de mejora

#### Funcionalidades

1. **Sistema de auditoría:** Registrar todas las acciones
2. **Reportes avanzados:** Analytics y métricas
3. **Notificaciones push:** Alertas en tiempo real
4. **API versioning:** Soporte para múltiples versiones
5. **Rate limiting:** Protección contra abuso

#### Técnicas

1. **Tests automatizados:** Implementar suite completa
2. **CI/CD:** Pipeline de despliegue automático
3. **Monitoreo:** Herramientas como Prometheus/Grafana
4. **Caché:** Redis para mejorar rendimiento
5. **Microservicios:** Separar en servicios independientes

#### Seguridad

1. **2FA:** Autenticación de dos factores
2. **OAuth:** Integración con proveedores externos
3. **WAF:** Web Application Firewall
4. **Encryption:** Encriptar datos sensibles
5. **Compliance:** Cumplir estándares de seguridad

### Límites actuales del sistema

#### Técnicos

- **Base de datos:** SQLite no es ideal para alta concurrencia
- **Escalabilidad:** Arquitectura monolítica
- **Monitoreo:** Logs básicos sin métricas avanzadas
- **Tests:** Cobertura de pruebas limitada

#### Funcionales

- **Usuarios:** Máximo recomendado 100 usuarios concurrentes
- **Registros:** Sin límite técnico, pero rendimiento degrada con >10,000
- **Archivos:** Sin gestión de archivos adjuntos
- **Integración:** Sin APIs externas

### Posibles mejoras futuras

#### Corto plazo (1-3 meses)

- Implementar tests automatizados
- Mejorar logging y monitoreo
- Optimizar consultas de base de datos
- Añadir validaciones adicionales

#### Mediano plazo (3-6 meses)

- Migrar a PostgreSQL
- Implementar sistema de auditoría
- Añadir reportes avanzados
- Mejorar interfaz de usuario

#### Largo plazo (6+ meses)

- Arquitectura de microservicios
- Implementar CI/CD
- Añadir funcionalidades móviles (PWA)
- Integración con sistemas externos

### Licencia

**Tipo:** Propietaria  
**Propietario:** Axity Colombia  
**Uso:** Interno únicamente  
**Distribución:** No permitida sin autorización

### Contacto y Soporte

#### Equipo de Desarrollo

- **Desarrollador Principal:** Pablo Rivas Alfonso
- **Email:** pablo@example.com
- **Teléfono:** +57 3133585900

#### Soporte Técnico

- **Área:** Ciberseguridad
- **Email:** ciberseguridad@axity.com
- **Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM

#### Documentación

- **API Docs:** http://localhost:3000/api-docs
- **Repositorio:** [URL del repositorio]
- **Manual de Usuario:** [Enlace al manual]

---

## Anexos

### Anexo A: Archivo .env de ejemplo

```env
# JWT Configuration
JWT_ACCESS_SECRET=tu_secreto_access_token_muy_seguro_de_64_caracteres_minimo
JWT_REFRESH_SECRET=tu_secreto_refresh_token_muy_seguro_de_64_caracteres_minimo

# Email Configuration
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail_de_16_caracteres

# Server Configuration
PORT=3000
NODE_ENV=production
BACKEND_URL=https://tu-dominio.com

# Database Configuration (opcional)
DB_PATH=./database.db
```

### Anexo B: Scripts útiles

#### backup.sh

```bash
#!/bin/bash
# Script de backup automatizado
BACKUP_DIR="/backups/recordblock"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp database.db $BACKUP_DIR/database_$DATE.db
gzip $BACKUP_DIR/database_$DATE.db
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

#### deploy.sh

```bash
#!/bin/bash
# Script de despliegue
git pull origin main
cd Backend && npm install --production
cd ../Frontend && npm install && npm run build
pm2 restart all
```

#### health_check.sh

```bash
#!/bin/bash
# Script de verificación de salud
curl -f http://localhost:3000/api-docs || exit 1
pm2 status | grep -q "online" || exit 1
```

### Anexo C: Comandos comunes

#### Desarrollo

```bash
# Backend
npm start                    # Iniciar servidor
npm run dev                  # Modo desarrollo
npm test                     # Ejecutar tests

# Frontend
npm run dev                  # Servidor desarrollo
npm run build                # Construir para producción
npm run preview              # Previsualizar build
```

#### Producción

```bash
# PM2
pm2 start ecosystem.config.js
pm2 status
pm2 logs
pm2 restart all
pm2 stop all

# Base de datos
sqlite3 database.db ".tables"
sqlite3 database.db "SELECT * FROM usuario;"
sqlite3 database.db "PRAGMA integrity_check;"
```

#### Mantenimiento

```bash
# Logs
pm2 logs --lines 100
tail -f /var/log/nginx/access.log
journalctl -u nginx -f

# Sistema
df -h                        # Espacio en disco
free -h                      # Memoria
top                          # Procesos
```

### Anexo D: Diagramas

#### Diagrama de Flujo de Autenticación

```
Usuario → Login → Validar Credenciales → Generar Tokens →
Enviar Access Token + Refresh Token (Cookie) →
Cliente almacena tokens → Requests con Access Token →
Token expirado? → Usar Refresh Token → Nuevo Access Token
```

#### Diagrama de Arquitectura de Componentes

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │    │   Express   │    │   SQLite    │
│   Frontend  │◄──►│   Backend   │◄──►│   Database  │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │
        │                   │
        ▼                   ▼
┌─────────────┐    ┌─────────────┐
│   Browser   │    │   Gmail     │
│   Web App   │    │   SMTP      │
└─────────────┘    └─────────────┘
```

---

**Fin del Manual Técnico**

_Documento generado automáticamente el $(date)_
_Versión 1.0 - Diciembre 2024_
