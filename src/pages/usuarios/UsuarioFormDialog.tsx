import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPen, UserPlus } from 'lucide-react'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem, RolDisponible } from '@/types/usuario.types'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Subcomponentes ────────────────────────────────────────────────────────────

interface RolesCheckboxListProps {
  roles: RolDisponible[]
  loading: boolean
  value: string[]
  onChange: (ids: string[]) => void
}

function RolesCheckboxList({ roles, loading, value, onChange }: RolesCheckboxListProps) {
  if (loading) return <p className="text-sm text-muted-foreground">Cargando roles...</p>
  if (roles.length === 0) return <p className="text-sm text-muted-foreground">No hay roles disponibles</p>

  return (
    <>
      {roles.map((rol) => (
        <label key={rol.id} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            value={rol.id}
            checked={value.includes(rol.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...value, rol.id])
              } else {
                onChange(value.filter((id) => id !== rol.id))
              }
            }}
            className="size-4 accent-primary"
          />
          <span className="text-sm">{rol.nombre}</span>
        </label>
      ))}
    </>
  )
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const crearSchema = z.object({
  correoElectronico: z.email('Email inválido'),
  roles: z.array(z.string()).min(1, 'Seleccione al menos un rol'),
  persona: z.object({
    tipoDocumento: z.string().min(1, 'Requerido'),
    nroDocumento: z.string().min(5, 'Mínimo 5 caracteres'),
    genero: z.string().optional(),
    telefono: z.string().optional(),
    nombres: z.string().min(2, 'Requerido'),
    primerApellido: z.string().min(2, 'Requerido'),
    segundoApellido: z.string().optional(),
    fechaNacimiento: z.string().min(1, 'Requerido'),
  }),
})

// estado se cambia desde la tabla con endpoints dedicados (/activacion | /inactivacion)
const editarSchema = z.object({
  correoElectronico: z.email('Email inválido').optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'Seleccione al menos un rol'),
  genero: z.string().optional(),
  telefono: z.string().optional(),
  nombres: z.string().min(2, 'Requerido'),
  primerApellido: z.string().min(2, 'Requerido'),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string().min(1, 'Requerido'),
})

type CrearValues = z.infer<typeof crearSchema>
type EditarValues = z.infer<typeof editarSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface UsuarioFormDialogProps {
  open: boolean
  onClose: () => void
  usuario?: UsuarioItem | null
  onSuccess: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function UsuarioFormDialog({ open, onClose, usuario, onSuccess }: UsuarioFormDialogProps) {
  const esEdicion = !!usuario
  const [roles, setRoles] = useState<RolDisponible[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const crearForm = useForm<CrearValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: {
      correoElectronico: '',
      roles: [],
      persona: {
        tipoDocumento: '',
        nroDocumento: '',
        genero: '',
        telefono: '',
        nombres: '',
        primerApellido: '',
        segundoApellido: '',
        fechaNacimiento: '',
      },
    },
  })

  const editarForm = useForm<EditarValues>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      correoElectronico: '',
      roles: [],
      genero: '',
      telefono: '',
      nombres: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
    },
  })

  const { reset: resetCrear } = crearForm
  const { reset: resetEditar } = editarForm

  useEffect(() => {
    if (!open) return

    if (usuario) {
      resetEditar({
        correoElectronico: usuario.correoElectronico ?? '',
        roles: (usuario.usuarioRol ?? []).map((r) => r.rol.id),
        genero: usuario.persona.genero ?? '',
        telefono: usuario.persona.telefono ?? '',
        nombres: usuario.persona.nombres,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido ?? '',
        fechaNacimiento: usuario.persona.fechaNacimiento ?? '',
      })
    }

    // Cargar roles disponibles tanto para crear como para editar
    setLoadingRoles(true)
    usuariosService.listarRoles()
      .then(({ data }) => {
        if (data.finalizado) setRoles(data.datos)
      })
      .catch(() => toast.error('Error al cargar los roles'))
      .finally(() => setLoadingRoles(false))

    if (!usuario) resetCrear()
  }, [usuario, open, resetCrear, resetEditar])

  const onSubmitCrear = async (values: CrearValues) => {
    try {
      const { data } = await usuariosService.crear(values)
      if (data.finalizado) {
        toast.success('Usuario creado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al crear el usuario')
    }
  }

  const onSubmitEditar = async (values: EditarValues) => {
    try {
      const payload = {
        correoElectronico: values.correoElectronico || undefined,
        roles: values.roles,
        persona: {
          genero: values.genero || undefined,
          telefono: values.telefono || undefined,
          nombres: values.nombres,
          primerApellido: values.primerApellido,
          segundoApellido: values.segundoApellido || undefined,
          fechaNacimiento: values.fechaNacimiento,
        },
      }
      const { data } = await usuariosService.actualizar(usuario!.id, payload)
      if (data.finalizado) {
        toast.success('Usuario actualizado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al actualizar el usuario')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${esEdicion ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
              {esEdicion ? <UserPen className="size-4" /> : <UserPlus className="size-4" />}
            </div>
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
        </DialogHeader>

        {esEdicion ? (
          /* ── Editar ─────────────────────────────────────────────────────── */
          <Form {...editarForm}>
            <form onSubmit={editarForm.handleSubmit(onSubmitEditar)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editarForm.control}
                  name="correoElectronico"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Tipo / Nro. documento</label>
                  <Input value={`${usuario!.persona.tipoDocumento}: ${usuario!.persona.nroDocumento}`} disabled />
                </div>

                <FormField
                  control={editarForm.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="primerApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer apellido</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="segundoApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo apellido</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCatalogoGrupo(CATALOGO_GRUPOS.GENERO).map((g) => (
                            <SelectItem key={g.codigo} value={g.codigo}>
                              {g.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl><Input type="tel" placeholder="Ej. 70012345" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editarForm.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
                          <RolesCheckboxList
                            roles={roles}
                            loading={loadingRoles}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={editarForm.formState.isSubmitting}>
                  {editarForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          /* ── Crear ──────────────────────────────────────────────────────── */
          <Form {...crearForm}>
            <form onSubmit={crearForm.handleSubmit(onSubmitCrear)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={crearForm.control}
                  name="correoElectronico"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.primerApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer apellido</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.segundoApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo apellido</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.tipoDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCatalogoGrupo(CATALOGO_GRUPOS.TIPO_DOCUMENTO).map((t) => (
                            <SelectItem key={t.codigo} value={t.codigo}>
                              {t.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.nroDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nro. documento</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCatalogoGrupo(CATALOGO_GRUPOS.GENERO).map((g) => (
                            <SelectItem key={g.codigo} value={g.codigo}>
                              {g.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="persona.telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl><Input type="tel" placeholder="Ej. 70012345" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
                          <RolesCheckboxList
                            roles={roles}
                            loading={loadingRoles}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={crearForm.formState.isSubmitting || loadingRoles}>
                  {crearForm.formState.isSubmitting ? 'Creando...' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
