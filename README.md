# Almacenes Frontend v3

Frontend del Sistema de Almacenes, construido con React 19, TypeScript y Vite.

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 19 |
| Lenguaje | TypeScript 5.8 |
| Build tool | Vite 7 |
| Estilos | Tailwind CSS v4 |
| Ruteo | React Router DOM v7 |
| Estado global | Zustand 5 (persistido en `localStorage`) |
| Formularios | React Hook Form + Zod |
| HTTP client | Axios |
| UI components | Radix UI + shadcn/ui |
| Notificaciones | Sonner |
| Iconos | Lucide React |

## Requisitos previos

- Node.js >= 18
- npm, pnpm o bun

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API backend | `http://localhost:3000/api` |

## Comandos disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Estructura del proyecto

```
src/
├── app/
│   ├── App.tsx           # Componente raíz
│   └── providers.tsx     # Proveedores globales (Router, Toaster)
├── auth/
│   ├── guards/
│   │   └── AuthGuard.tsx # Protección de rutas privadas
│   └── login/
│       └── LoginPage.tsx # Página de inicio de sesión
├── components/
│   └── ui/               # Componentes UI reutilizables (shadcn/ui)
├── hooks/
│   └── useAuth.ts        # Hook de autenticación
├── layouts/
│   ├── AuthLayout.tsx    # Layout para rutas públicas
│   └── MainLayout.tsx    # Layout principal con sidebar
├── pages/
│   └── dashboard/
│       └── DashboardPage.tsx
├── routes/
│   └── AppRouter.tsx     # Definición de rutas
├── services/
│   ├── axios.ts          # Instancia de Axios con interceptores
│   └── auth.service.ts   # Servicio de autenticación
├── store/
│   └── auth.store.ts     # Store de Zustand para auth
└── types/
    ├── api.types.ts      # Tipos base de la API
    └── auth.types.ts     # Tipos de autenticación
```

## Autenticación

El sistema utiliza **JWT con refresh token via cookie HttpOnly**:

- Al iniciar sesión se obtiene un `access_token` almacenado en Zustand (clave `auth-storage` en `localStorage`).
- Cada request incluye el token en el header `Authorization: Bearer <token>`.
- Si el servidor responde con `401`, el interceptor de Axios intenta renovar el token automáticamente via `POST /token` (usando la cookie de refresh).
- Si la renovación falla, se limpia el estado de autenticación y se redirige a `/login`.

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Formulario de inicio de sesión |
| `/dashboard` | Privado | Panel principal |
| `/` | — | Redirige a `/dashboard` |

## Despliegue en desarrollo

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd almacenes-frontend-v3
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y apunta `VITE_API_URL` a la URL donde corre el backend:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

El servidor quedará disponible en [http://localhost:5173](http://localhost:5173) con HMR activo.

> **Nota:** el backend debe estar corriendo y accesible en la URL configurada en `VITE_API_URL` antes de hacer login. El frontend necesita conectividad con la API para autenticarse y renovar tokens.

---

## Alias de importación

El alias `@` apunta a `src/`, habilitando importaciones absolutas:

```ts
import { useAuth } from '@/hooks/useAuth'
```
