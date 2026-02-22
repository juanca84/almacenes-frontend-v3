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
│   ├── App.tsx                  # Componente raíz
│   └── providers.tsx            # Proveedores globales (Router, Toaster)
├── auth/
│   ├── guards/
│   │   └── AuthGuard.tsx        # Protección de rutas privadas
│   └── login/
│       └── LoginPage.tsx        # Página de inicio de sesión
├── components/
│   ├── ConfirmDialog.tsx        # Diálogo de confirmación reutilizable
│   ├── NavSidebar.tsx           # Sidebar dinámico basado en permisos
│   └── ui/                      # Primitivos UI (shadcn/ui — no modificar)
├── hooks/
│   ├── useAuth.ts               # Login, logout y estado de sesión
│   └── usePermissions.ts        # RBAC: verificación de acciones por submódulo
├── layouts/
│   ├── AuthLayout.tsx           # Layout para rutas públicas
│   └── MainLayout.tsx           # Layout principal con sidebar + header
├── lib/
│   ├── icon-map.ts              # Mapeo nombre-icono (API) → componente Lucide
│   └── utils.ts                 # Helper cn() para clases Tailwind
├── pages/
│   └── dashboard/
│       └── DashboardPage.tsx
├── routes/
│   └── AppRouter.tsx            # Definición de rutas
├── services/
│   ├── axios.ts                 # Instancia Axios con interceptores auth
│   └── auth.service.ts          # Llamadas a la API de autenticación
├── store/
│   └── auth.store.ts            # Store Zustand (token + usuario + roles)
└── types/
    ├── api.types.ts             # BaseResponse<T> y PaginatedResponse<T>
    └── auth.types.ts            # Usuario, Rol, Modulo, SubModulo, Accion
```

## Autenticación

El sistema utiliza **JWT con refresh token via cookie HttpOnly**:

- Al iniciar sesión se obtiene un `access_token` almacenado en Zustand (clave `auth-storage` en `localStorage`).
- El objeto `usuario` completo (incluyendo roles, módulos y acciones) también se persiste en `localStorage`, por lo que el sidebar y los permisos están disponibles inmediatamente tras una recarga de página sin necesidad de re-fetch.
- Cada request incluye el token en el header `Authorization: Bearer <token>`.
- Si el servidor responde con `401`, el interceptor de Axios intenta renovar el token automáticamente via `POST /token` (usando la cookie de refresh).
- Si la renovación falla, se limpia el estado de autenticación y se redirige a `/login`.

## Sidebar dinámico

El sidebar se construye a partir de la respuesta del login. La API devuelve, por cada rol del usuario, una lista de módulos con sus submódulos:

```
roles[]
  └── modulos[]          ← sección/grupo en el sidebar
        └── subModulo[]  ← ítem de navegación (NavLink)
              └── accion[] ← permisos disponibles en esa página
```

Cuando el usuario tiene **múltiples roles**, `getMergedModulos` fusiona los módulos y submódulos de todos los roles eliminando duplicados. Las acciones se unen (unión de sets), por lo que el usuario siempre obtiene el nivel de acceso más amplio entre sus roles.

### Iconos

Los iconos vienen como cadenas de texto desde la API (nombres de Material Icons). El archivo `src/lib/icon-map.ts` los mapea a componentes Lucide React. Para agregar un nuevo icono:

```ts
// src/lib/icon-map.ts
import { NuevoIcono } from 'lucide-react'

export const iconMap = {
  nombre_en_bd: NuevoIcono,
  // ...
}
```

## Control de acceso (RBAC)

Cada submódulo incluye un array de acciones permitidas para el usuario: `read`, `create`, `update`, `delete`. Usa el hook `usePermissions` en cualquier página para verificar permisos antes de renderizar controles:

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function UsuariosPage() {
  const { tieneAccion } = usePermissions()

  return (
    <>
      {tieneAccion('usuarios', 'create') && (
        <Button>Nuevo usuario</Button>
      )}
      {tieneAccion('usuarios', 'delete') && (
        <Button variant="destructive">Eliminar</Button>
      )}
    </>
  )
}
```

El hook resuelve la **unión de acciones entre roles**: si un rol tiene `delete` y otro no, `tieneAccion('usuarios', 'delete')` devuelve `true`.

| Función | Descripción |
|---------|-------------|
| `tieneAccion(nombre, accion)` | `true` si el usuario puede ejecutar la acción en ese submódulo |
| `getAcciones(nombre)` | Devuelve todas las acciones disponibles para un submódulo |

## Componentes reutilizables

### `ConfirmDialog`

Diálogo de confirmación basado en `AlertDialog` de shadcn/ui. Úsalo siempre que una acción sea destructiva o irreversible.

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog'

<ConfirmDialog
  trigger={<Button variant="destructive">Eliminar</Button>}
  title="¿Eliminar registro?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  onConfirm={handleDelete}
/>
```

| Prop | Tipo | Requerida | Descripción |
|------|------|-----------|-------------|
| `trigger` | `ReactNode` | Sí | Elemento que abre el diálogo |
| `title` | `string` | Sí | Título del diálogo |
| `description` | `string` | No | Texto secundario explicativo |
| `confirmLabel` | `string` | No | Texto del botón confirmar (default: `"Confirmar"`) |
| `cancelLabel` | `string` | No | Texto del botón cancelar (default: `"Cancelar"`) |
| `onConfirm` | `() => void` | Sí | Callback al confirmar |

## Contrato de la API

Todas las respuestas siguen `BaseResponse<T>`:

```ts
{ finalizado: boolean, mensaje: string, datos: T }
```

Siempre verificar `data.finalizado` (no el status HTTP) para determinar éxito. Para endpoints paginados usar `PaginatedResponse<T>`:

```ts
{ filas: T[], totalFilas: number }
```

## Agregar un nuevo módulo de funcionalidad

1. Crear `src/pages/<modulo>/` con el componente de página.
2. Crear `src/services/<modulo>.service.ts` usando la instancia `api` de Axios.
3. Agregar tipos en `src/types/`.
4. Registrar la ruta en `src/routes/AppRouter.tsx` (dentro del grupo protegido por `AuthGuard`).
5. El ítem de navegación aparecerá automáticamente en el sidebar si la API devuelve el submódulo en la respuesta del login.

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Formulario de inicio de sesión |
| `/dashboard` | Privado | Panel principal |
| `/` | — | Redirige a `/dashboard` |

> Las rutas de nuevos módulos se agregan según los `url` definidos en los submódulos de la API.

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
import { usePermissions } from '@/hooks/usePermissions'
```
