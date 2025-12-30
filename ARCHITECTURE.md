# Arquitectura del Proyecto - be kind network

## 📁 Estructura de Carpetas

```
src/
├── api/              # Servicios de API
│   ├── axios.ts      # Cliente HTTP configurado
│   ├── auth.ts       # Endpoints de autenticación
│   └── actions.ts    # Endpoints de acciones
│
├── components/       # Componentes reutilizables
│   ├── Layout/       # Componentes de layout
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ErrorBoundary.tsx
│   ├── Loading.tsx
│   └── ProtectedRoute.tsx
│
├── config/           # Configuración de la aplicación
│   └── index.ts      # Configuración centralizada
│
├── context/          # Context API
│   └── AuthContext.tsx
│
├── hooks/            # Custom hooks
│   ├── useAuth.ts
│   └── useApi.ts
│
├── pages/            # Páginas principales
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── CreateAction.tsx
│
├── routes/           # Configuración de rutas
│   └── AppRoutes.tsx
│
├── styles/           # Estilos globales
│   └── index.css
│
├── types/            # Tipos TypeScript compartidos
│   └── index.ts
│
├── utils/            # Utilidades
│   ├── constants.ts  # Constantes de la aplicación
│   ├── storage.ts    # Utilidades de localStorage
│   ├── validation.ts # Validaciones reutilizables
│   └── format.ts     # Funciones de formateo
│
├── App.tsx           # Componente raíz
└── main.tsx          # Punto de entrada
```

## 🏗️ Principios de Arquitectura

### 1. Separación de Responsabilidades

- **API Layer**: Toda la lógica de comunicación con el backend está en `api/`
- **Components**: Componentes reutilizables y presentacionales
- **Pages**: Páginas que orquestan componentes
- **Utils**: Funciones puras sin dependencias de React

### 2. Configuración Centralizada

Toda la configuración está en `config/index.ts`:
- URLs de API
- Timeouts
- Valores por defecto
- Claves de almacenamiento

### 3. Manejo de Estado

- **Context API**: Para estado global (autenticación)
- **Estado Local**: Para estado específico de componentes
- **Custom Hooks**: Para lógica reutilizable

### 4. TypeScript

- Tipos compartidos en `types/`
- Interfaces bien definidas
- Type safety en toda la aplicación

### 5. Manejo de Errores

- ErrorBoundary para errores de React
- Try-catch en llamadas API
- Interceptores de Axios para errores globales
- Toast notifications para feedback al usuario

## 🔄 Flujo de Datos

```
Usuario → Componente → Hook/API → Backend
                ↓
         Estado (Context/Local)
                ↓
         UI Actualizada
```

## 📦 Dependencias Principales

- **React 18**: Framework UI
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Navegación
- **React Hook Form**: Manejo de formularios
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Estilos
- **React Toastify**: Notificaciones

## 🎯 Buenas Prácticas Implementadas

1.  **Componentes Funcionales**: Todos los componentes usan funciones
2.  **Hooks Personalizados**: Lógica reutilizable en hooks
3.  **TypeScript Estricto**: Tipado completo
4.  **Error Handling**: Manejo robusto de errores
5.  **Loading States**: Estados de carga en todas las operaciones async
6.  **Validaciones**: Validaciones en formularios
7.  **Rutas Protegidas**: Protección de rutas privadas
8.  **Configuración Centralizada**: Un solo lugar para config
9.  **Código Limpio**: Nombres descriptivos, funciones pequeñas
10. **Documentación**: Comentarios donde es necesario

## 🚀 Mejoras Futuras

- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Playwright
- [ ] Storybook para componentes
- [ ] Internacionalización (i18n)
- [ ] PWA support
- [ ] Optimización de imágenes
- [ ] Code splitting más granular

