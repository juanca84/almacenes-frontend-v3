import { useEffect, useMemo, useState } from 'react'
import { Eye, KeyRound, Pencil, Plus, PowerOff, ToggleLeft, Users } from 'lucide-react'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'
import { usePermissions } from '@/hooks/usePermissions'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { ESTADO_USUARIO_VARIANTE } from '@/constants/usuario'
import { UsuarioFormDialog } from './UsuarioFormDialog'
import { UsuarioDetailDialog } from './UsuarioDetailDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UsuariosPage() {
  const { tieneAccion } = usePermissions()

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [usuarioDetalle, setUsuarioDetalle] = useState<UsuarioItem | null>(null)

  const puedeEditar = tieneAccion('usuarios', 'update')
  const puedeDesactivar = tieneAccion('usuarios', 'delete')

  const estadoLabels = useMemo(() => {
    const items = getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO)
    return Object.fromEntries(items.map((e) => [e.codigo, e.nombre]))
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const { data } = await usuariosService.listar()
      if (data.finalizado) setUsuarios(data.datos.filas)
    } catch {
      toast.error('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const abrirCrear = () => {
    setUsuarioSeleccionado(null)
    setDialogOpen(true)
  }

  const abrirEditar = (usuario: UsuarioItem) => {
    setUsuarioSeleccionado(usuario)
    setDialogOpen(true)
  }

  const handleToggleEstado = async (u: UsuarioItem) => {
    try {
      const { data } =
        u.estado === 'ACTIVO'
          ? await usuariosService.inactivar(u.id)
          : await usuariosService.activar(u.id)

      if (data.finalizado) {
        toast.success(u.estado === 'ACTIVO' ? 'Usuario inactivado' : 'Usuario activado')
        cargarUsuarios()
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

  const nombreCompleto = (u: UsuarioItem) =>
    [u.persona.nombres, u.persona.primerApellido, u.persona.segundoApellido]
      .filter(Boolean)
      .join(' ')

  const hayAcciones = puedeEditar || puedeDesactivar

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-sm text-muted-foreground">Gestión de usuarios del sistema</p>
          </div>
        </div>
        {tieneAccion('usuarios', 'create') && (
          <Button onClick={abrirCrear}>
            <Plus className="size-4 mr-2" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre completo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Estado</TableHead>
                {hayAcciones && (
                  <TableHead className="text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={hayAcciones ? 6 : 5} className="text-center py-10 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hayAcciones ? 6 : 5} className="text-center py-10 text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{nombreCompleto(u)}</TableCell>
                    <TableCell className="text-muted-foreground">{u.usuario}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.persona.tipoDocumento}: {u.persona.nroDocumento}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(u.usuarioRol ?? []).map((r) => (
                          <Badge key={r.rol.id} variant="secondary">
                            {r.rol.rol}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_USUARIO_VARIANTE[u.estado]}>
                        {estadoLabels[u.estado] ?? u.estado}
                      </Badge>
                    </TableCell>
                    {hayAcciones && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
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
                                onClick={() => abrirEditar(u)}
                                title="Editar datos"
                              >
                                <Pencil className="size-4" />
                              </Button>

                              {(u.estado === 'ACTIVO' || u.estado === 'PENDIENTE') && (
                                <ConfirmDialog
                                  trigger={
                                    <Button variant="ghost" size="icon" title="Restaurar contraseña">
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
                                  title={u.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                >
                                  {u.estado === 'ACTIVO' ? (
                                    <PowerOff className="size-4 text-destructive" />
                                  ) : (
                                    <ToggleLeft className="size-4 text-primary" />
                                  )}
                                </Button>
                              }
                              icon={
                                u.estado === 'ACTIVO'
                                  ? <PowerOff className="size-4" />
                                  : <ToggleLeft className="size-4" />
                              }
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
          cargarUsuarios()
        }}
      />
    </div>
  )
}
