# be kind network - Aplicación React

Aplicación web desarrollada en React para la gestión de acciones de la red "be kind network". Esta aplicación permite autenticación de usuarios, visualización de acciones con paginación y creación de nuevas acciones.

## 🚀 Características

- ✅ **Autenticación**: Login con token JWT y protección de rutas
- ✅ **Dashboard**: Listado paginado de acciones con búsqueda y filtros
- ✅ **Crear Acción**: Formulario completo con validaciones para crear nuevas acciones
- ✅ **UI/UX Moderna**: Diseño responsive con Tailwind CSS
- ✅ **Manejo de Estado**: Context API para autenticación global
- ✅ **Notificaciones**: Toast notifications para feedback al usuario
- ✅ **Validaciones**: Formularios con React Hook Form y validaciones robustas

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Dannaccb/be-kind.git
cd be-kind
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:3000` (o el puerto que Vite asigne)

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter

## 🏗️ Arquitectura del Proyecto

```
src/
├── api/              # Servicios de API (auth, actions)
├── components/       # Componentes reutilizables
│   └── Layout/      # Componentes de layout (Sidebar, Header)
├── context/         # Context API (AuthContext)
├── pages/           # Páginas principales (Login, Dashboard, CreateAction)
├── routes/          # Configuración de rutas
├── styles/          # Estilos globales
└── utils/           # Utilidades y constantes
```

## 🔧 Decisiones Técnicas

### Tecnologías Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Para tipado estático y mejor DX
- **Vite**: Build tool rápido y moderno
- **Tailwind CSS**: Framework de utilidades CSS
- **React Router DOM**: Manejo de rutas
- **React Hook Form**: Manejo de formularios con validaciones
- **Axios**: Cliente HTTP para peticiones API
- **React Toastify**: Notificaciones toast elegantes
- **Context API**: Manejo de estado global para autenticación

### Estructura de Estado

- **Context API**: Se utiliza para el estado de autenticación global
- **Session Storage**: Persistencia del token y datos de usuario (se limpia al cerrar la sesión del navegador)
- **Estado Local**: Cada componente maneja su propio estado cuando es apropiado

### Manejo de APIs

- **Dos subdominios distintos** (como se indica en los requerimientos): 
  - `dev.apinetbo.bekindnetwork.com` para autenticación (`/api/Authentication/Login`)
  - `dev.api.bekindnetwork.com` para acciones (`/api/v1/actions/*`)
- **Proxy de Vite**: Configurado en `vite.config.ts` para manejar CORS en desarrollo
  - Las rutas `/api/v1/*` se redirigen a `https://dev.api.bekindnetwork.com`
  - Las rutas `/api/Authentication/*` se redirigen a `https://dev.apinetbo.bekindnetwork.com`
- **Interceptores Axios**: 
  - Request interceptor: Agrega token automáticamente en header `Authorization: Bearer {token}`
  - Response interceptor: Maneja errores 401 (redirige a login) y errores de CORS
  - Validación de expiración de token JWT antes de enviar peticiones
- **Manejo de CORS**: El proxy de Vite resuelve problemas de CORS en desarrollo

### Estilos

- **Tailwind CSS**: Utilizado para la mayoría de los estilos
- **CSS Personalizado**: Para estilos específicos como el fondo del login
- **Medidas Responsivas**: Uso de `vh`, `%`, y unidades de Tailwind para diseño responsive

## 📝 Supuestos y Decisiones

### Autenticación

- **Endpoint**: `POST /api/Authentication/Login`
- **Payload**: `{ username: string, password: string }`
- **Respuesta**: El endpoint retorna directamente el token JWT como string
- **Extracción de token**: Se implementó lógica robusta para extraer el token de diferentes estructuras de respuesta:
  - Respuesta directa como string (JWT)
  - Objetos con propiedades `token`, `accessToken`, `access_token`, etc.
  - Búsqueda mediante patrones regex para encontrar tokens JWT
- **Almacenamiento**: El token se guarda en `sessionStorage` (no `localStorage`) con la clave `auth_token`
- **Validación JWT**: Se valida el formato y expiración del token antes de guardarlo
- **Protección de rutas**: Implementada con componente `ProtectedRoute` que verifica autenticación
- **Redirección automática**: Si el token expira o no existe, se redirige automáticamente a `/login`

### API de Acciones

- **Endpoint de listado**: `GET /api/v1/actions/admin-list`
  - Parámetros: `pageNumber` (1-based) y `pageSize` (default: 10)
  - El endpoint puede retornar diferentes estructuras de respuesta, por lo que se implementó lógica para manejar:
    - Arrays directos
    - Objetos con propiedad `data` anidada
    - Objetos con propiedad `content` (estilo Spring)
  - El token se envía automáticamente en el header `Authorization: Bearer {token}`

- **Endpoint de creación**: `POST /api/v1/actions/admin-add`
  - Se envía como `multipart/form-data` (FormData) porque requiere archivo
  - Campos implementados:
    - `name` (requerido, string)
    - `description` (requerido, string, 10-300 caracteres)
    - `status` (requerido, se envía como Integer: 1 para 'active', 0 para 'inactive')
    - `color` (opcional, string en formato HEX)
    - `icon` (requerido, File - campo para subir imagen)
  - **Nota importante**: El servidor requiere que el archivo se envíe en el campo `icon` (no `file`), y este campo es obligatorio (`NotNull`)

### Formulario de Creación

- Se implementaron los siguientes campos:
  1. **Nombre de la acción** (requerido, mínimo 3 caracteres)
  2. **Descripción** (requerido, 10-300 caracteres, con contador de caracteres)
  3. **Logo/Icono** (requerido, upload de archivo - JPG, PNG, SVG, máx. 5MB)
  4. **Color** (opcional, formato HEX con selector visual de color)
  5. **Estado** (toggle activo/inactivo, default: activo)

- **Validaciones implementadas**:
  - Validación de formato de email en login
  - Validación de longitud mínima/máxima en descripción
  - Validación de formato HEX para color
  - Validación de tipo y tamaño de archivo para el icono
  - Feedback visual inmediato con React Hook Form

### UI/UX

- El diseño se basa en las imágenes de referencia proporcionadas
- Se mantiene la estructura visual del dashboard con sidebar y header
- Los colores principales son azules (#0284c7, #0369a1) siguiendo el diseño de referencia
- Se implementan estados de loading, error y empty state en todas las vistas
- El formulario de crear acción muestra un efecto blur en el fondo para mejor enfoque visual

## 🔐 Credenciales de Prueba

Según la documentación:
- **Email**: `a.berrio@yopmail.com`
- **Password**: `AmuFK8G4Bh64Q1uX+IxQhw==`

## 📱 Responsive Design

La aplicación está diseñada para ser responsive, aunque el enfoque principal está en desktop siguiendo el diseño de referencia. El sidebar es fijo en desktop y se puede adaptar para móvil.

## 🐛 Manejo de Errores

- Errores de autenticación: Se muestran mensajes claros al usuario
- Errores de API: Se capturan y muestran mediante toast notifications
- Errores 401: Se redirige automáticamente al login
- Validaciones de formularios: Feedback visual inmediato

## 📤 Upload de Archivos

- **Implementado**: El formulario de creación permite subir imágenes para el icono de la acción
- **Formatos soportados**: JPG, PNG, SVG
- **Tamaño máximo**: 5MB
- **Validación**: Se valida el tipo y tamaño del archivo antes de enviarlo
- **Preview**: Se muestra una vista previa de la imagen seleccionada antes de enviar
- **Envío**: El archivo se envía como `multipart/form-data` en el campo `icon` (requerido por el servidor)

## 🚧 Funcionalidades Futuras

- [ ] Agregar funcionalidad de edición de acciones
- [ ] Agregar funcionalidad de eliminación de acciones
- [ ] Implementar filtros avanzados en el dashboard
- [ ] Agregar vista de detalle de acción
- [ ] Implementar recuperación de contraseña

## 📄 Licencia

Este proyecto es parte de una prueba técnica.

## 👤 Autor

**Danna Castro**

Desarrollado como parte de la prueba técnica para be kind network.

## 📝 Nota Técnica

Se dejaron algunos `console.log` de forma intencional como soporte temporal para trazabilidad y validación de flujos durante el desarrollo. Estos logs:

- Facilitan el debugging rápido y la verificación de datos en tiempo real
- Están condicionados a `import.meta.env.DEV` para que solo aparezcan en desarrollo
- Serán eliminados o reemplazados por un mecanismo de logging controlado antes de pasar a ambiente productivo

Los logs incluyen información útil para:
- Verificación de tokens JWT
- Trazabilidad de peticiones API
- Validación de respuestas del servidor
- Debugging de flujos de autenticación

