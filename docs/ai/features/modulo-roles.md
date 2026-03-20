# Especificación Frontend — Módulo de Gestión de Roles

## Autenticación

Todos los endpoints requieren:

- `Authorization: Bearer <access_token>`
- Solo usuarios con rol `ADMINISTRADOR` tienen acceso.

---

## Endpoints

### 1. Listar módulos disponibles (para cargar el formulario)

```
GET /api/autorizacion/modulos
```

**Response 200:**

```json
{
  "finalizado": true,
  "mensaje": "Registro(s) obtenido(s) con exito!",
  "datos": [
    {
      "id": "uuid",
      "label": "Usuarios",
      "url": "/usuarios",
      "nombre": "usuarios",
      "propiedades": {
        "icono": "people",
        "descripcion": "Gestión de usuarios",
        "color_light": "#1976D2",
        "color_dark": "#90CAF9"
      },
      "subModulo": [
        {
          "id": "uuid-sub",
          "label": "Roles",
          "url": "/roles",
          "nombre": "roles",
          "propiedades": { "icono": "shield" }
        }
      ]
    }
  ]
}
```

Un módulo puede tener `subModulo: []` (vacío) o con hijos. El árbol tiene máximo 2 niveles.

---

### 2. Listar roles activos

```
GET /api/autorizacion/roles
```

**Response 200:**

```json
{
  "finalizado": true,
  "mensaje": "Registro(s) obtenido(s) con exito!",
  "datos": [
    { "id": "uuid", "rol": "SUPERVISOR", "nombre": "Supervisor de almacén" }
  ]
}
```

Solo retorna roles con estado `ACTIVO`. Los roles del sistema (`ADMINISTRADOR`, `TECNICO`) también aparecen en el listado pero no pueden editarse.

---

### 3. Crear rol

```
POST /api/autorizacion/roles
Content-Type: application/json
```

**Request body:**

```json
{
  "rol": "SUPERVISOR",
  "nombre": "Supervisor de almacén",
  "modulos": [
    { "id": "uuid-modulo-usuarios", "acciones": ["read"] },
    { "id": "uuid-modulo-parametros", "acciones": ["read", "create"] }
  ]
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `rol` | string | Requerido, máx 50 chars. El backend lo convierte automáticamente a `MAYUSCULAS_CON_GUION_BAJO` |
| `nombre` | string | Requerido, máx 100 chars |
| `modulos` | array | Requerido. Puede ser `[]` si aún no se asignan módulos |
| `modulos[].id` | UUID | ID del módulo obtenido de `GET /modulos` |
| `modulos[].acciones` | string[] | Solo valores: `"read"`, `"create"`, `"update"`, `"delete"` |

**Response 201:**

```json
{
  "finalizado": true,
  "mensaje": "Registro creado con exito!",
  "datos": { "id": "uuid", "rol": "SUPERVISOR", "nombre": "Supervisor de almacén" }
}
```

---

### 4. Editar rol

```
PATCH /api/autorizacion/roles/:id
Content-Type: application/json
```

**Request body** (ambos campos opcionales, pero al menos uno debe ir):

```json
{
  "nombre": "Nuevo nombre",
  "modulos": [
    { "id": "uuid-modulo", "acciones": ["read", "update"] }
  ]
}
```

- Si se envía `modulos`, reemplaza completamente los permisos del rol.
- Para quitar todos los módulos, enviar `"modulos": []`.
- El campo `rol` (identificador) no es editable una vez creado.

**Response 200:**

```json
{
  "finalizado": true,
  "mensaje": "Registro actualizado con exito!",
  "datos": { "id": "uuid" }
}
```

---

### 5. Inactivar rol

```
PATCH /api/autorizacion/roles/:id/inactivacion
```

Sin body.

**Response 200:**

```json
{
  "finalizado": true,
  "mensaje": "Registro actualizado con exito!",
  "datos": { "id": "uuid", "estado": "INACTIVO" }
}
```

---

## Errores

| HTTP | Cuándo ocurre |
|---|---|
| 401 | Sin token o token expirado |
| 403 | Intento de editar/inactivar un rol del sistema (`ADMINISTRADOR`, `TECNICO`, `*`) |
| 404 | El `id` del rol no existe |
| 412 | Ya existe un rol con el mismo identificador `rol` |
| 400 | Validación fallida (campo requerido, acciones con valor inválido, etc.) |

**Formato de error estándar:**

```json
{
  "finalizado": false,
  "codigo": 412,
  "timestamp": "2026-03-06T...",
  "mensaje": "Ya existe un rol registrado con el mismo identificador.",
  "datos": null
}
```

---

## Flujo completo recomendado

```
Al abrir el módulo:
  1. GET /api/autorizacion/modulos   → guardar en store (árbol de módulos para el formulario)
  2. GET /api/autorizacion/roles     → mostrar tabla de roles

Al crear un rol:
  3. Mostrar formulario con árbol de módulos del paso 1
  4. POST /api/autorizacion/roles
  5. Si 201 → refrescar lista (paso 2)
  6. Si 412 → mostrar "El identificador ya está en uso"
  7. Si 403 → mostrar "No se puede modificar un rol del sistema"

Al editar un rol:
  8. Pre-cargar módulos actuales del rol (via GET /api/autorizacion/permisos?rol=NOMBRE o desde el store)
  9. PATCH /api/autorizacion/roles/:id
  10. Si 200 → refrescar lista

Al inactivar:
  11. Confirmar con el usuario
  12. PATCH /api/autorizacion/roles/:id/inactivacion
  13. Si 200 → eliminar de la lista
```

---

## Reglas de negocio para la UI

### Roles del sistema no editables
Si `rol ∈ ["ADMINISTRADOR", "TECNICO"]`, deshabilitar botones de editar e inactivar en la tabla.

### El campo `rol` es inmutable
En el formulario de edición, mostrarlo como texto de solo lectura (no como input).

### Acciones válidas para módulos

| Valor | Significado |
|---|---|
| `read` | Ver / listar |
| `create` | Crear registros |
| `update` | Editar registros |
| `delete` | Eliminar registros |

### Módulos padre con submódulos
Al seleccionar un módulo padre que tiene `subModulo.length > 0`, las acciones se asignan a cada submódulo por separado, no al padre. El padre actúa como agrupador visual.

### El campo `rol` se auto-formatea
El usuario puede escribir `"supervisor almacén"` y el backend guardará `"SUPERVISOR_ALMACÉN"`. Mostrar una preview en tiempo real de cómo quedará.

---

## Análisis de implementación (notas de senior)

### Factibilidad

Alta. El stack actual (React + Zustand + React Hook Form + Zod + shadcn/ui) cubre todo lo necesario. El módulo `usuarios` es el blueprint directo para este módulo.

---

### Gaps del spec — todos resueltos ✅

| Gap original | Solución |
|---|---|
| Endpoint para precargar módulos de un rol | `GET /api/autorizacion/roles/:id/modulos` |
| Ambigüedad del `*` en roles del sistema | `*` es el wildcard interno de Casbin, **nunca aparece** en `GET /roles` — no necesita manejo en UI |
| Inactivación irreversible | `PATCH /api/autorizacion/roles/:id/activacion` — completamente reversible, módulos y usuarios se conservan |
| Payload ambiguo con módulos padre | Regla simple: si `subModulo.length > 0` → enviar IDs de hijos; si `subModulo.length === 0` → enviar el propio ID. El backend aplana la jerarquía internamente |

---

### Decisiones de arquitectura frontend — confirmadas

#### Store global para módulos, estado local para roles

- `GET /api/autorizacion/modulos` → **store global** (Zustand). Se carga una sola vez al entrar al módulo. El árbol no cambia durante la sesión.
- `GET /api/autorizacion/roles` → **estado local** en la tabla. Es liviano (`{id, rol, nombre}[]`) y se refresca manualmente tras cada operación. Sin paginación — el volumen de roles es bajo.

#### Tipo `RolDisponible` — sin cambios en `usuario.types.ts`

El tipo queda donde está. El nuevo `roles.service.ts` importa desde `usuario.types.ts` para no duplicarlo. En el futuro se puede migrar a `roles.types.ts` si tiene sentido.

```ts
interface RolDisponible {
  id: string
  rol: string    // identificador inmutable, ej: "SUPERVISOR"
  nombre: string // nombre legible, ej: "Supervisor de almacén"
}
```

> `GET /roles` retorna exactamente estos 3 campos — sin estado, sin módulos, sin propiedades extras.

#### `propiedades` del módulo — opcionales, usar con cuidado

```ts
interface PropiedadesModulo {
  icono: string          // siempre presente
  descripcion?: string   // opcional
  color_light?: string   // opcional — no todos los módulos lo tienen
  color_dark?: string    // opcional
}
```

Usar `icono` para renderizar el árbol visual. `color_light`/`color_dark` son decorativos — no asumir que siempre existen.

#### Roles del sistema — guard en UI

```ts
const ROLES_SISTEMA = ['ADMINISTRADOR', 'TECNICO'] as const

const puedeEditar = (rol: RolDisponible) => !ROLES_SISTEMA.includes(rol.rol as never)
```

> El `*` de Casbin nunca llega al frontend — no necesita manejo.

#### Roles inactivos — sin endpoint de listado

`GET /roles` retorna solo activos. Si se necesita mostrar roles inactivos, deben manejarse en **estado local de la UI** (conservarlos al inactivar). El backend no tiene endpoint de lista de inactivos.

---

### Nuevo endpoint — Obtener módulos de un rol

```
GET /api/autorizacion/roles/:id/modulos
```

Se usa exclusivamente al abrir el formulario de **edición** para precargar los módulos y acciones actuales del rol.

> Response shape: pendiente confirmar estructura exacta con backend antes de tipar.

---

### Estructura de archivos — definitiva

```
src/
├── types/
│   └── roles.types.ts              # ModuloDisponible, SubModuloDisponible, RolItem,
│                                   # CreateRolPayload, UpdateRolPayload, ModuloPermiso
├── services/
│   └── roles.service.ts            # listarModulos, listar, obtenerModulosRol,
│                                   # crear, actualizar, inactivar, activar
├── constants/
│   └── roles.ts                    # ROLES_SISTEMA, ACCIONES_MODULO
├── hooks/
│   ├── useRoles.ts                 # lista local + recargar + inactivar + activar
│   └── useRolModulos.ts            # GET /:id/modulos (para precargar al editar)
└── pages/roles/
    ├── RolesPage.tsx               # página principal — tabla + botones de acción
    ├── RolFormDialog.tsx           # formulario crear/editar con React Hook Form + Zod
    └── components/
        ├── RolesTable.tsx          # tabla: nombre, identificador, acciones
        └── ModuloArbol.tsx         # árbol de módulos con checkboxes de acciones
```

#### `ModuloArbol` — reglas de renderizado

- Módulos con `subModulo.length > 0` → **agrupador visual** (header con icono, sin checkboxes propios)
- Módulos con `subModulo.length === 0` → **módulo hoja** (4 checkboxes: `read`, `create`, `update`, `delete`)
- Los submódulos siempre son hojas (máximo 2 niveles)

#### `formatearIdentificador` en utils del feature

```ts
// src/pages/roles/utils.ts
export const formatearIdentificador = (valor: string): string =>
  valor.trim().toUpperCase().replace(/\s+/g, '_')
```

> El backend aplica exactamente esta misma lógica. La preview es fiel a lo que se guardará.

#### Manejo de errores específicos

```ts
// useRoles.ts — al inactivar:
catch (error) {
  if (error?.response?.status === 412) {
    // estado desincronizado — refrescar lista silenciosamente
    await recargar()
    return
  }
  if (error?.response?.status === 403) {
    // no debería ocurrir si la UI bloquea roles del sistema
    console.warn('Intento de modificar rol del sistema')
    return
  }
  throw error // otros errores: propagar al componente
}

// useRoles.ts — al crear (412 = identificador duplicado):
catch (error) {
  const codigo = error?.response?.data?.codigo
  const mensaje = error?.response?.data?.mensaje
  if (codigo === 412) toast.error('El identificador ya está en uso')
  else toast.error(mensaje ?? 'Error al guardar el rol')
}
```
