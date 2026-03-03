import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, KeyRound, Mail, Pencil, Phone, Plus, PowerOff, Search, ToggleLeft, Users, X } from 'lucide-react'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'
import { usePermissions } from '@/hooks/usePermissions'
import { useUsuarios } from '@/hooks/useUsuarios'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { avatarClases, iniciales } from '@/lib/avatar'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { ESTADO_USUARIO_VARIANTE } from '@/constants/usuario'
import { UsuarioFormDialog } from './UsuarioFormDialog'
import { UsuarioDetailDialog } from './UsuarioDetailDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

// ── Multi-select reutilizable ─────────────────────────────────────────────────

interface FiltroMultiSelectProps {
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
}

function FiltroMultiSelect({ label, options, value, onChange }: FiltroMultiSelectProps) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  const active = value.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={[
            'flex items-center gap-1.5 text-sm px-3 h-10 transition-colors',
            'hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60',
            active ? 'text-foreground font-medium' : 'text-muted-foreground',
          ].join(' ')}
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
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-36 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
      </TableCell>
      <TableCell><div className="h-5 w-20 bg-muted rounded-full animate-pulse" /></TableCell>
      <TableCell><div className="h-5 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
      {cols === 6 && <TableCell />}
    </TableRow>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export function UsuariosPage() {
  const { tieneAccion } = usePermissions()

  const {
    usuarios, loading, total, totalPaginas,
    pagina, limite, filtro, roles, estados, rolesDisponibles,
    setFiltro, setRoles, setEstados, setPagina, setLimite, recargar,
  } = useUsuarios()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [usuarioDetalle, setUsuarioDetalle] = useState<UsuarioItem | null>(null)

  const puedeEditar     = tieneAccion('usuarios', 'update')
  const puedeDesactivar = tieneAccion('usuarios', 'delete')
  const hayAcciones     = puedeEditar || puedeDesactivar

  const estadoLabels = useMemo(() => {
    const items = getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO)
    return Object.fromEntries(items.map((e) => [e.codigo, e.nombre]))
  }, [])

  const opcionesEstado = useMemo(() =>
    getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO)
      .filter((e) => e.codigo in ESTADO_USUARIO_VARIANTE)
      .map((e) => ({ value: e.codigo, label: e.nombre })),
  [])

  const opcionesRoles = useMemo(() =>
    rolesDisponibles.map((r) => ({ value: r.id, label: r.nombre })),
  [rolesDisponibles])

  const nombreCompleto = (u: UsuarioItem) =>
    [u.persona.nombres, u.persona.primerApellido, u.persona.segundoApellido]
      .filter(Boolean)
      .join(' ')

  const abrirCrear  = () => { setUsuarioSeleccionado(null); setDialogOpen(true) }
  const abrirEditar = (u: UsuarioItem) => { setUsuarioSeleccionado(u); setDialogOpen(true) }

  const limpiarFiltros = () => { setFiltro(''); setRoles([]); setEstados([]) }

  const handleToggleEstado = async (u: UsuarioItem) => {
    try {
      const { data } =
        u.estado === 'ACTIVO'
          ? await usuariosService.inactivar(u.id)
          : await usuariosService.activar(u.id)

      if (data.finalizado) {
        toast.success(u.estado === 'ACTIVO' ? 'Usuario inactivado' : 'Usuario activado')
        recargar()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al cambiar el estado del usuario')
    }
  }

  const handleRestaurarContrasena = async (id: string) => {
    try {
      const { data } = await usuariosService.restaurarContrasena(id)
      if (data.finalizado) {
        toast.success('Contraseña restaurada correctamente')
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al restaurar la contraseña')
    }
  }

  const hayFiltros = !!(filtro || roles.length > 0 || estados.length > 0)
  // columnas: usuario | documento | contacto | roles | estado | (acciones)
  const colSpan = hayAcciones ? 6 : 5

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-xl border bg-gradient-to-br from-background to-muted/40 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Users className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
              {!loading && (
                <Badge variant="secondary" className="font-mono text-xs px-2">
                  {total}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Administra los accesos y permisos del sistema
            </p>
          </div>
        </div>
        {tieneAccion('usuarios', 'create') && (
          <Button onClick={abrirCrear} className="shrink-0">
            <Plus className="size-4 mr-2" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="space-y-2">
        <div className="flex items-center rounded-lg border bg-background shadow-sm overflow-hidden">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por nombre, documento, correo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="border-0 rounded-none h-10 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="w-px h-5 bg-border shrink-0" />
          <FiltroMultiSelect label="Roles"  options={opcionesRoles}  value={roles}   onChange={setRoles} />
          <div className="w-px h-5 bg-border shrink-0" />
          <FiltroMultiSelect label="Estado" options={opcionesEstado} value={estados} onChange={setEstados} />

          {hayFiltros && (
            <>
              <div className="w-px h-5 bg-border shrink-0" />
              <button
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
            {roles.map((id) => {
              const label = opcionesRoles.find((r) => r.value === id)?.label ?? id
              return (
                <span key={id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
                  {label}
                  <button onClick={() => setRoles(roles.filter((r) => r !== id))} className="hover:opacity-70">
                    <X className="size-3" />
                  </button>
                </span>
              )
            })}
            {estados.map((codigo) => {
              const label = opcionesEstado.find((e) => e.value === codigo)?.label ?? codigo
              return (
                <span key={codigo} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
                  {label}
                  <button onClick={() => setEstados(estados.filter((e) => e !== codigo))} className="hover:opacity-70">
                    <X className="size-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                <TableHead className="font-semibold text-foreground pl-4">Usuario</TableHead>
                <TableHead className="font-semibold text-foreground">Documento</TableHead>
                <TableHead className="font-semibold text-foreground">Contacto</TableHead>
                <TableHead className="font-semibold text-foreground">Roles</TableHead>
                <TableHead className="font-semibold text-foreground">Estado</TableHead>
                {hayAcciones && <TableHead className="font-semibold text-foreground text-right pr-4">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={colSpan} />
                ))
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="size-5 opacity-50" />
                      </div>
                      <p className="text-sm">
                        {hayFiltros
                          ? 'No se encontraron usuarios con los filtros aplicados'
                          : 'No hay usuarios registrados'}
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
                usuarios.map((u) => (
                  <TableRow key={u.id} className="group">
                    {/* Usuario */}
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${avatarClases(u)}`}>
                          {iniciales(u)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-none truncate">{nombreCompleto(u)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">@{u.usuario}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Documento */}
                    <TableCell>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
                        {u.persona.tipoDocumento}
                      </p>
                      <p className="text-sm font-mono">{u.persona.nroDocumento}</p>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell>
                      {u.correoElectronico || u.persona.telefono ? (
                        <div className="space-y-1">
                          {u.correoElectronico && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.correoElectronico}</span>
                            </div>
                          )}
                          {u.persona.telefono && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="size-3 shrink-0" />
                              <span>{u.persona.telefono}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Roles */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(u.usuarioRol ?? []).map((r) => (
                          <Badge key={r.rol.id} variant="secondary" className="text-xs">
                            {r.rol.rol}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge variant={ESTADO_USUARIO_VARIANTE[u.estado]}>
                        {estadoLabels[u.estado] ?? u.estado}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    {hayAcciones && (
                      <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => { setUsuarioDetalle(u); setDetailOpen(true) }}
                            title="Ver detalle"
                          >
                            <Eye className="size-4" />
                          </Button>

                          {puedeEditar && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirEditar(u)}
                                title="Editar datos"
                              >
                                <Pencil className="size-4" />
                              </Button>

                              {(u.estado === 'ACTIVO' || u.estado === 'PENDIENTE') && (
                                <ConfirmDialog
                                  trigger={
                                    <Button variant="ghost" size="icon" className="size-8" title="Restaurar contraseña">
                                      <KeyRound className="size-4" />
                                    </Button>
                                  }
                                  icon={<KeyRound className="size-4" />}
                                  title="¿Restaurar contraseña?"
                                  description={
                                    u.correoElectronico
                                      ? <>Se enviará un correo a <strong>{u.correoElectronico}</strong> para que <strong>{nombreCompleto(u)}</strong> establezca una nueva contraseña.</>
                                      : <>Se restaurará la contraseña de <strong>{nombreCompleto(u)}</strong>. El usuario no tiene correo registrado.</>
                                  }
                                  confirmLabel="Restaurar"
                                  onConfirm={() => handleRestaurarContrasena(u.id)}
                                />
                              )}
                            </>
                          )}

                          {puedeDesactivar && (
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  title={u.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                >
                                  {u.estado === 'ACTIVO'
                                    ? <PowerOff className="size-4 text-destructive" />
                                    : <ToggleLeft className="size-4 text-primary" />}
                                </Button>
                              }
                              icon={u.estado === 'ACTIVO'
                                ? <PowerOff className="size-4" />
                                : <ToggleLeft className="size-4" />}
                              title={u.estado === 'ACTIVO' ? `¿Inactivar a ${nombreCompleto(u)}?` : `¿Activar a ${nombreCompleto(u)}?`}
                              description={
                                u.estado === 'ACTIVO'
                                  ? <>El usuario <strong>{nombreCompleto(u)}</strong> perderá el acceso al sistema de forma inmediata. Podrás reactivarlo en cualquier momento desde esta misma tabla.</>
                                  : u.correoElectronico
                                    ? <>El usuario <strong>{nombreCompleto(u)}</strong> será activado y recibirá un correo a <strong>{u.correoElectronico}</strong> con una contraseña temporal para que pueda ingresar al sistema y establecer una nueva contraseña.</>
                                    : <>El usuario <strong>{nombreCompleto(u)}</strong> será activado y podrá volver a iniciar sesión. No tiene correo registrado, por lo que deberás asignarle una contraseña manualmente.</>
                              }
                              confirmLabel={u.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                              variant={u.estado === 'ACTIVO' ? 'destructive' : 'default'}
                              onConfirm={() => handleToggleEstado(u)}
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
              {' '}{total === 1 ? 'usuario' : 'usuarios'} en total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1 || loading}
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
      <UsuarioDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        usuario={usuarioDetalle}
      />

      {/* Dialog crear / editar */}
      <UsuarioFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        usuario={usuarioSeleccionado}
        onSuccess={() => {
          setDialogOpen(false)
          recargar()
        }}
      />
    </div>
  )
}
