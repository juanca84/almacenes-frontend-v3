import { useState } from 'react'
import { Eye, Pencil, Plus, Shield, ToggleLeft, ToggleRight } from 'lucide-react'

import { useRoles } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import { esRolSistema } from '@/constants/roles'
import type { RolItem } from '@/types/roles.types'
import { RolFormDialog } from './RolFormDialog'
import { RolDetailDialog } from './RolDetailDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="space-y-1.5">
          <div className="h-3.5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-5 w-28 bg-muted rounded-full animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
      </TableCell>
      <TableCell />
    </TableRow>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export function RolesPage() {
  const { tieneAccion } = usePermissions()
  const { roles, loading, recargar, inactivar, activar } = useRoles()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [rolSeleccionado, setRolSeleccionado] = useState<RolItem | null>(null)

  const puedeCrear     = tieneAccion('roles', 'create')
  const puedeVer       = tieneAccion('roles', 'read')
  const puedeEditar    = tieneAccion('roles', 'update')
  const puedeInactivar = tieneAccion('roles', 'delete')
  const hayAcciones    = puedeVer || puedeEditar || puedeInactivar

  const abrirCrear   = () => { setRolSeleccionado(null); setDialogOpen(true) }
  const abrirVer     = (rol: RolItem) => { setRolSeleccionado(rol); setDetailOpen(true) }
  const abrirEditar  = (rol: RolItem) => { setRolSeleccionado(rol); setDialogOpen(true) }

  const handleInactivar = (rol: RolItem) => inactivar(rol.id)
  const handleActivar = (rol: RolItem) => activar(rol.id)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-xl border bg-gradient-to-br from-background to-muted/40 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
              {!loading && (
                <Badge variant="secondary" className="font-mono text-xs px-2">
                  {roles.length}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Administra los roles y permisos del sistema
            </p>
          </div>
        </div>
        {puedeCrear && (
          <Button onClick={abrirCrear} className="shrink-0">
            <Plus className="size-4 mr-2" />
            Nuevo rol
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                <TableHead className="font-semibold text-foreground pl-4">Rol</TableHead>
                <TableHead className="font-semibold text-foreground">Identificador</TableHead>
                <TableHead className="font-semibold text-foreground">Estado</TableHead>
                {hayAcciones && (
                  <TableHead className="font-semibold text-foreground text-right pr-4">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hayAcciones ? 4 : 3} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                        <Shield className="size-5 opacity-50" />
                      </div>
                      <p className="text-sm">No hay roles registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((rol) => {
                  const esSistema = esRolSistema(rol.rol)
                  return (
                    <TableRow key={rol.id} className="group">
                      {/* Nombre */}
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="size-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium leading-none">{rol.nombre}</p>
                            {esSistema && (
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                Rol del sistema
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Identificador */}
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {rol.rol}
                        </Badge>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <Badge variant={rol.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                          {rol.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
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
                                onClick={() => abrirVer(rol)}
                                title="Ver detalle del rol"
                                aria-label="Ver rol"
                              >
                                <Eye className="size-4 text-slate-500 dark:text-slate-400" />
                              </Button>
                            )}
                            {puedeEditar && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirEditar(rol)}
                                disabled={esSistema}
                                title={esSistema ? 'No se puede editar un rol del sistema' : 'Editar rol'}
                                aria-label="Editar rol"
                              >
                                <Pencil className="size-4 text-slate-500 dark:text-slate-400" />
                              </Button>
                            )}
                            {puedeInactivar && (
                              rol.estado === 'ACTIVO' ? (
                                <ConfirmDialog
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      disabled={esSistema}
                                      title={esSistema ? 'No se puede inactivar un rol del sistema' : 'Inactivar rol'}
                                      aria-label="Inactivar rol"
                                    >
                                      <ToggleLeft className="size-4 text-muted-foreground" />
                                    </Button>
                                  }
                                  icon={<ToggleLeft className="size-4" />}
                                  title={`¿Inactivar "${rol.nombre}"?`}
                                  description={
                                    <>
                                      Los usuarios con el rol{' '}
                                      <strong>{rol.rol}</strong> perderán los permisos
                                      asociados. Podrás reactivarlo en cualquier momento.
                                    </>
                                  }
                                  confirmLabel="Inactivar"
                                  variant="destructive"
                                  onConfirm={() => handleInactivar(rol)}
                                />
                              ) : (
                                <ConfirmDialog
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      title="Activar rol"
                                      aria-label="Activar rol"
                                    >
                                      <ToggleRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    </Button>
                                  }
                                  icon={<ToggleRight className="size-4" />}
                                  title={`¿Activar "${rol.nombre}"?`}
                                  description={
                                    <>
                                      El rol <strong>{rol.rol}</strong> volverá a estar disponible para asignarse a usuarios.
                                    </>
                                  }
                                  confirmLabel="Activar"
                                  onConfirm={() => handleActivar(rol)}
                                />
                              )
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog crear / editar */}
      <RolFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rol={rolSeleccionado}
        onSuccess={() => {
          setDialogOpen(false)
          recargar()
        }}
      />

      {/* Dialog ver detalle */}
      <RolDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        rol={rolSeleccionado}
      />
    </div>
  )
}
