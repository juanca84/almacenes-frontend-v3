# Frontend Guidelines

## Contexto del proyecto
- Frontend en React + TypeScript
- Entry point: `main.tsx`
- UI escrita exclusivamente en archivos `.tsx`
- Frontend ligero, rápido y mantenible

## Estructura global
- `constants/`: valores inmutables compartidos
- `types/`: tipos y contratos globales
- Cada feature vive en su propio módulo

## Principios de diseño
- SOLID obligatorio
- DRY: no duplicar lógica
- Evitar sobre-abstracción
- Código pensado para crecer

## React
- Componentes funcionales pequeños
- JSX limpio, sin lógica de negocio
- Lógica compleja en hooks
- Estado local solo cuando es necesario

## TypeScript
- Tipado estricto
- Prohibido `any`
- Tipos reutilizables fuera de componentes
- Preferir tipos derivados

## Performance
- Evitar renders innecesarios
- No lógica costosa en render
- Lazy loading cuando aplique
- Evitar librerías pesadas

## Antipatrones prohibidos
- Componentes gigantes
- Hooks con múltiples responsabilidades
- Props drilling innecesario
- Estados duplicados
- Copiar/pegar código

## Convenciones de UI

### Badges de estado (`EstadoEntidad`)
Usar siempre las variantes del componente `Badge` de `src/components/ui/badge.tsx`.
La constante canónica es `ESTADO_USUARIO_VARIANTE` en `src/constants/usuario.ts`.

| Estado    | Variante Badge | Color    |
|-----------|---------------|----------|
| ACTIVO    | `success`     | Verde    |
| INACTIVO  | `secondary`   | Gris     |
| PENDIENTE | `warning`     | Ámbar    |

- **Nunca** usar `destructive` para estado inactivo — ese color comunica error, no desactivación.
- Para entidades que solo tienen ACTIVO/INACTIVO (ej. roles), usar `success` / `secondary` directamente.
- Reutilizar `ESTADO_USUARIO_VARIANTE` cuando el tipo coincide con `EstadoEntidad`.

### Iconos de acciones activar/inactivar
Usar siempre `ToggleLeft` / `ToggleRight` de `lucide-react`.

| Acción    | Icono         | Color                                          |
|-----------|---------------|------------------------------------------------|
| Inactivar | `ToggleLeft`  | `text-muted-foreground`                        |
| Activar   | `ToggleRight` | `text-emerald-600 dark:text-emerald-400`       |

- **Nunca** mezclar `PowerOff`, `Power`, `Ban` u otros iconos para estas acciones.
- El icono en el botón representa la **acción a ejecutar**, no el estado actual.

### Campos obligatorios en formularios
- Campos **requeridos**: añadir `<span className="text-destructive">*</span>` al final del label.
- Campos **opcionales**: añadir `<span className="text-muted-foreground/60">(opcional)</span>` al final del label.
- No mezclar ambos en el mismo campo.

## Regla final
Priorizar siempre:
1. Claridad
2. Mantenibilidad
3. Performance