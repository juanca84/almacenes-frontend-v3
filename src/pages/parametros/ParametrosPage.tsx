import { useMemo, useState } from 'react'
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Eye, Loader2, Pencil, Plus, Settings, ToggleLeft, ToggleRight, X,
} from 'lucide-react'
import { toast } from 'sonner'

import { parametrosService } from '@/services/parametros.service'
import type { ParametroItem } from '@/types/parametro.types'
import { ESTADO_PARAMETRO_VARIANTE } from '@/constants/parametro'
import { usePermissions } from '@/hooks/usePermissions'
import { useParametros } from '@/hooks/useParametros'
import { grupoClases, grupoLetra } from '@/lib/parametro'
import { cn } from '@/lib/utils'
import { ParametroDetailDialog } from './ParametroDetailDialog'
import { ParametroFormDialog } from './ParametroFormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Filtro multiselect reutilizable ───────────────────────────────────────────

interface FiltroMultiSelectProps {
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  loading?: boolean
  emptyText?: string
}

function FiltroMultiSelect({ label, options, value, onChange, loading, emptyText }: FiltroMultiSelectProps) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  const active = value.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 text-sm px-3 h-10 transition-colors',
            'hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60',
            active ? 'text-foreground font-medium' : 'text-muted-foreground',
          )}
        >
          {label}
          {active && (
            <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {value.length}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {loading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Cargando...
          </div>
        ) : options.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {emptyText ?? 'Sin opciones'}
          </p>
        ) : (
          options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-36 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-5 w-14 bg-muted rounded-full animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-48 bg-muted rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-5 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
      {cols === 5 && <TableCell className="text-right pr-4" />}
    </TableRow>
  )
}

// ── Constantes locales ────────────────────────────────────────────────────────

const OPCIONES_ESTADO = [
  { value: 'ACTIVO',   label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
]

// ── Página ────────────────────────────────────────────────────────────────────

export function ParametrosPage() {
  const { tieneAccion } = usePermissions()

  const {
    parametros, loading, total, totalPaginas,
    pagina, limite, gruposSeleccionados, estadosSeleccionados,
    gruposDisponibles, loadingGrupos,
    setGrupos, setEstados, setPagina, setLimite, recargar,
  } = useParametros()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [parametroSeleccionado, setParametroSeleccionado] = useState<ParametroItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [parametroDetalle, setParametroDetalle] = useState<ParametroItem | null>(null)

  const puedeVer        = tieneAccion('parametros', 'read')
  const puedeEditar     = tieneAccion('parametros', 'update')
  const puedeDesactivar = tieneAccion('parametros', 'delete')
  const hayAcciones     = puedeVer || puedeEditar || puedeDesactivar

  const opcionesGrupo = useMemo(
    () => gruposDisponibles.map((g) => ({ value: g, label: g })),
    [gruposDisponibles],
  )

  const abrirCrear  = () => { setParametroSeleccionado(null); setDialogOpen(true) }
  const abrirEditar = (p: ParametroItem) => { setParametroSeleccionado(p); setDialogOpen(true) }

  const limpiarFiltros = () => { setGrupos([]); setEstados([]) }

  const hayFiltros = gruposSeleccionados.length > 0 || estadosSeleccionados.length > 0
  const colSpan    = hayAcciones ? 5 : 4

  const handleToggleEstado = async (p: ParametroItem) => {
    try {
      const { data } =
        p.estado === 'ACTIVO'
          ? await parametrosService.inactivar(p.id)
          : await parametrosService.activar(p.id)

      if (data.finalizado) {
        toast.success(p.estado === 'ACTIVO' ? 'Parámetro inactivado' : 'Parámetro activado')
        recargar()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al cambiar el estado del parámetro')
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-xl border bg-gradient-to-br from-background to-muted/40 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Settings className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight">Parámetros</h2>
              {!loading && (
                <Badge variant="secondary" className="font-mono text-xs px-2">
                  {total}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Catálogo central de valores configurables del sistema
            </p>
          </div>
        </div>
        {tieneAccion('parametros', 'create') && (
          <Button onClick={abrirCrear} className="shrink-0">
            <Plus className="size-4 mr-2" />
            Nuevo parámetro
          </Button>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="space-y-2">
        <div className="flex items-center rounded-lg border bg-background shadow-sm overflow-hidden">
          <FiltroMultiSelect
            label="Grupos"
            options={opcionesGrupo}
            value={gruposSeleccionados}
            onChange={setGrupos}
            loading={loadingGrupos}
            emptyText="No hay grupos disponibles"
          />

          <div className="w-px h-5 bg-border shrink-0" />

          <FiltroMultiSelect
            label="Estado"
            options={OPCIONES_ESTADO}
            value={estadosSeleccionados}
            onChange={setEstados}
          />

          {hayFiltros && (
            <>
              <div className="w-px h-5 bg-border shrink-0" />
              <button
                type="button"
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 px-3 h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                title="Limpiar filtros"
              >
                <X className="size-3.5" />
                Limpiar
              </button>
            </>
          )}
        </div>

        {/* Chips de filtros activos */}
        {hayFiltros && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {gruposSeleccionados.map((g) => (
              <span key={g} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium font-mono">
                {g}
                <button type="button" onClick={() => setGrupos(gruposSeleccionados.filter((x) => x !== g))} className="hover:opacity-70">
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {estadosSeleccionados.map((e) => (
              <span key={e} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
                {e === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                <button type="button" onClick={() => setEstados(estadosSeleccionados.filter((x) => x !== e))} className="hover:opacity-70">
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                <TableHead className="font-semibold text-foreground pl-4">Parámetro</TableHead>
                <TableHead className="font-semibold text-foreground">Grupo</TableHead>
                <TableHead className="font-semibold text-foreground">Descripción</TableHead>
                <TableHead className="font-semibold text-foreground">Estado</TableHead>
                {hayAcciones && (
                  <TableHead className="font-semibold text-foreground text-right pr-4">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={colSpan} />
                ))
              ) : parametros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                        <Settings className="size-5 opacity-50" />
                      </div>
                      <p className="text-sm">
                        {hayFiltros
                          ? 'No se encontraron parámetros con los filtros aplicados'
                          : 'No hay parámetros registrados'}
                      </p>
                      {hayFiltros && (
                        <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                parametros.map((p) => (
                  <TableRow key={p.id} className="group">
                    {/* Parámetro — icono de color + código + nombre */}
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${grupoClases(p.grupo)}`}>
                          {grupoLetra(p.grupo)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium leading-none">{p.codigo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.nombre}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Grupo */}
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-xs border-current/30 ${grupoClases(p.grupo)}`}>
                        {p.grupo}
                      </Badge>
                    </TableCell>

                    {/* Descripción */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                        {p.descripcion}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge variant={ESTADO_PARAMETRO_VARIANTE[p.estado]}>
                        {p.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    {hayAcciones && (
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {puedeVer && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => { setParametroDetalle(p); setDetailOpen(true) }}
                              title="Ver detalle"
                              aria-label={`Ver ${p.codigo}`}
                            >
                              <Eye className="size-4 text-blue-500 dark:text-blue-400" />
                            </Button>
                          )}
                          {puedeEditar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => abrirEditar(p)}
                              title="Editar parámetro"
                              aria-label={`Editar ${p.codigo}`}
                            >
                              <Pencil className="size-4 text-slate-500 dark:text-slate-400" />
                            </Button>
                          )}

                          {puedeDesactivar && (
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={p.estado === 'ACTIVO' ? `Inactivar ${p.codigo}` : `Activar ${p.codigo}`}
                                  title={p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                >
                                  {p.estado === 'ACTIVO'
                                    ? <ToggleLeft className="size-4 text-muted-foreground" />
                                    : <ToggleRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                                  }
                                </Button>
                              }
                              icon={p.estado === 'ACTIVO'
                                ? <ToggleLeft className="size-4" />
                                : <ToggleRight className="size-4" />
                              }
                              title={p.estado === 'ACTIVO'
                                ? `¿Inactivar "${p.nombre}"?`
                                : `¿Activar "${p.nombre}"?`
                              }
                              description={
                                p.estado === 'ACTIVO'
                                  ? <>El parámetro <strong>{p.codigo}</strong> quedará inactivo y no aparecerá en los selectores del sistema. Los registros que ya lo referencian no se verán afectados.</>
                                  : <>El parámetro <strong>{p.codigo}</strong> volverá a estar disponible en los selectores del sistema.</>
                              }
                              confirmLabel={p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                              variant={p.estado === 'ACTIVO' ? 'destructive' : 'default'}
                              onConfirm={() => handleToggleEstado(p)}
                            />
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{total}</span>
              {' '}{total === 1 ? 'parámetro' : 'parámetros'} en total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1 || loading}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                Página <span className="font-medium text-foreground">{pagina}</span> de <span className="font-medium text-foreground">{totalPaginas}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas || loading}
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Select value={String(limite)} onValueChange={(v) => setLimite(Number(v))}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / pág.</SelectItem>
                <SelectItem value="20">20 / pág.</SelectItem>
                <SelectItem value="50">50 / pág.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dialog detalle */}
      <ParametroDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        parametro={parametroDetalle}
      />

      {/* Dialog crear / editar */}
      <ParametroFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        parametro={parametroSeleccionado}
        onSuccess={() => {
          setDialogOpen(false)
          recargar()
        }}
      />
    </div>
  )
}
