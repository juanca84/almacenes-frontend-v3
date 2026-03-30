import { useCallback, useMemo } from 'react'
import { Check, Circle } from 'lucide-react'

import { getIcon } from '@/lib/icon-map'
import { cn } from '@/lib/utils'
import { ACCIONES_MODULO, ACCION_LABEL } from '@/constants/roles'
import type { ModuloDisponible, ModuloPermiso, Accion } from '@/types/roles.types'

// Ancho fijo compartido entre header y celdas para alineación perfecta
const COL_W = 'w-10'

// ── Subcomponentes ────────────────────────────────────────────────────────────

// Indicador visual en modo lectura: check coloreado si activo, vacío si no
function AccionIndicador({ activa }: { activa: boolean }) {
  return (
    <div className={cn(COL_W, 'flex justify-center')}>
      {activa && <Check className="size-3.5 text-primary" strokeWidth={2.5} />}
    </div>
  )
}

// Checkbox en modo edición
function AccionCheckbox({
  accion,
  checked,
  onChange,
}: {
  accion: Accion
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className={cn(COL_W, 'flex justify-center')}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        title={ACCION_LABEL[accion]}
        className="size-3.5 accent-primary cursor-pointer"
      />
    </div>
  )
}

// ── ModuloHoja ────────────────────────────────────────────────────────────────

interface ModuloHojaProps {
  id: string
  label: string
  icono: string
  colorLight?: string
  acciones: Set<Accion>
  onToggleAccion: (id: string, accion: Accion) => void
  onToggleTodos: (id: string) => void
  disabled?: boolean
  indented?: boolean
}

function ModuloHoja({
  id,
  label,
  icono,
  colorLight,
  acciones,
  onToggleAccion,
  onToggleTodos,
  disabled,
  indented,
}: ModuloHojaProps) {
  const Icon = getIcon(icono)
  const tieneAlguna = acciones.size > 0
  const tieneTodas = ACCIONES_MODULO.every((a) => acciones.has(a))

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        tieneAlguna && 'bg-primary/5',
        !disabled && !tieneAlguna && 'hover:bg-muted/40',
        indented && 'ml-6'
      )}
    >
      {/* Icono */}
      <div
        className="size-7 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: colorLight ? `${colorLight}20` : undefined }}
      >
        <Icon className="size-3.5" style={{ color: colorLight ?? undefined }} />
      </div>

      {/* Nombre */}
      {disabled ? (
        <p
          className={cn(
            'flex-1 text-sm font-medium leading-none',
            tieneAlguna ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => onToggleTodos(id)}
          title={tieneTodas ? 'Quitar todos los permisos' : 'Seleccionar todos los permisos'}
          className={cn(
            'flex-1 text-left text-sm font-medium leading-none transition-colors',
            tieneAlguna ? 'text-foreground' : 'text-muted-foreground',
            'hover:text-primary cursor-pointer'
          )}
        >
          {label}
        </button>
      )}

      {/* Acciones */}
      <div className="flex items-center">
        {ACCIONES_MODULO.map((accion) =>
          disabled ? (
            <AccionIndicador key={accion} activa={acciones.has(accion)} />
          ) : (
            <AccionCheckbox
              key={accion}
              accion={accion}
              checked={acciones.has(accion)}
              onChange={() => onToggleAccion(id, accion)}
            />
          )
        )}
      </div>
    </div>
  )
}

// ── ModuloGrupo ───────────────────────────────────────────────────────────────

interface ModuloGrupoProps {
  modulo: ModuloDisponible
  accionesMap: Map<string, Set<Accion>>
  onToggleAccion: (id: string, accion: Accion) => void
  onToggleTodos: (id: string) => void
  disabled?: boolean
}

function ModuloGrupo({
  modulo,
  accionesMap,
  onToggleAccion,
  onToggleTodos,
  disabled,
}: ModuloGrupoProps) {
  const Icon = getIcon(modulo.propiedades.icono)
  const colorLight = modulo.propiedades.color_light

  return (
    <div className="space-y-0.5">
      {/* Separador de grupo — solo etiqueta, sin controles */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <div
          className="size-4 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: colorLight ? `${colorLight}20` : undefined }}
        >
          <Icon className="size-2.5" style={{ color: colorLight ?? undefined }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          {modulo.label}
        </span>
      </div>

      {/* Submódulos */}
      {(modulo.subModulo ?? []).map((sub) => (
        <ModuloHoja
          key={sub.id}
          id={sub.id}
          label={sub.label}
          icono={sub.propiedades.icono}
          colorLight={sub.propiedades.color_light}
          acciones={accionesMap.get(sub.id) ?? new Set()}
          onToggleAccion={onToggleAccion}
          onToggleTodos={onToggleTodos}
          disabled={disabled}
          indented
        />
      ))}
    </div>
  )
}

// ── Encabezado de columnas ────────────────────────────────────────────────────

function AccionesHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-end px-3 pb-1 border-b border-border/50 bg-background">
      {ACCIONES_MODULO.map((accion) => (
        <span
          key={accion}
          className={cn(
            COL_W,
            'text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'
          )}
        >
          {ACCION_LABEL[accion]}
        </span>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ModuloArbolSkeleton() {
  return (
    <div className="space-y-1.5 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="size-7 rounded-md bg-muted animate-pulse shrink-0" />
          <div className="flex-1 h-3 bg-muted rounded animate-pulse" />
          <div className="flex">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={cn(COL_W, 'flex justify-center')}>
                <div className="size-3.5 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ModuloArbolProps {
  modulos: ModuloDisponible[]
  value: ModuloPermiso[]
  onChange: (value: ModuloPermiso[]) => void
  loading?: boolean
  disabled?: boolean
}

export function ModuloArbol({ modulos, value, onChange, loading, disabled }: ModuloArbolProps) {
  // Map id → Set<Accion> para O(1) lookup sin recalcular en cada render
  const accionesMap = useMemo(() => new Map(value.map((m) => [m.id, new Set(m.acciones)])), [value])

  const toggleAccion = useCallback(
    (id: string, accion: Accion) => {
      const current = accionesMap.get(id) ?? new Set<Accion>()
      const next = new Set(current)
      if (next.has(accion)) next.delete(accion)
      else next.add(accion)

      const rest = value.filter((m) => m.id !== id)
      onChange(next.size === 0 ? rest : [...rest, { id, acciones: Array.from(next) }])
    },
    [accionesMap, value, onChange]
  )

  const toggleTodos = useCallback(
    (id: string) => {
      const current = accionesMap.get(id) ?? new Set<Accion>()
      const tieneTodas = ACCIONES_MODULO.every((a) => current.has(a))

      const rest = value.filter((m) => m.id !== id)
      onChange(tieneTodas ? rest : [...rest, { id, acciones: [...ACCIONES_MODULO] }])
    },
    [accionesMap, value, onChange]
  )

  if (loading) return <ModuloArbolSkeleton />

  if (modulos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Circle className="size-8 opacity-30" />
        <p className="text-sm">No hay módulos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <AccionesHeader />
      {modulos.map((modulo) =>
        (modulo.subModulo?.length ?? 0) > 0 ? (
          <ModuloGrupo
            key={modulo.id}
            modulo={modulo}
            accionesMap={accionesMap}
            onToggleAccion={toggleAccion}
            onToggleTodos={toggleTodos}
            disabled={disabled}
          />
        ) : (
          <ModuloHoja
            key={modulo.id}
            id={modulo.id}
            label={modulo.label}
            icono={modulo.propiedades.icono}
            colorLight={modulo.propiedades.color_light}
            acciones={accionesMap.get(modulo.id) ?? new Set()}
            onToggleAccion={toggleAccion}
            onToggleTodos={toggleTodos}
            disabled={disabled}
          />
        )
      )}
    </div>
  )
}
