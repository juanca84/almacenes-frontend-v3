import { useEffect, useState } from 'react'
import { KeyRound, Pencil, Plus, PowerOff, ToggleLeft } from 'lucide-react'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'
import { usePermissions } from '@/hooks/usePermissions'
import { UsuarioFormDialog } from './UsuarioFormDialog'
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

  const puedeEditar = tieneAccion('usuarios', 'update')
  const puedeDesactivar = tieneAccion('usuarios', 'delete')

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-sm text-muted-foreground">Gestión de usuarios del sistema</p>
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
                        {(u.roles ?? []).map((r) => (
                          <Badge key={r.idRol} variant="secondary">
                            {r.nombre}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.estado === 'ACTIVO' ? 'success' : 'warning'}>
                        {u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {hayAcciones && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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

                              <ConfirmDialog
                                trigger={
                                  <Button variant="ghost" size="icon" title="Restaurar contraseña">
                                    <KeyRound className="size-4" />
                                  </Button>
                                }
                                title="¿Restaurar contraseña?"
                                description={`Se restaurará la contraseña de "${nombreCompleto(u)}" a la contraseña por defecto.`}
                                confirmLabel="Restaurar"
                                onConfirm={() => handleRestaurarContrasena(u.id)}
                              />
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
                              title={u.estado === 'ACTIVO' ? '¿Inactivar usuario?' : '¿Activar usuario?'}
                              description={
                                u.estado === 'ACTIVO'
                                  ? `"${nombreCompleto(u)}" no podrá iniciar sesión mientras esté inactivo.`
                                  : `"${nombreCompleto(u)}" podrá volver a iniciar sesión.`
                              }
                              confirmLabel={u.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
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
