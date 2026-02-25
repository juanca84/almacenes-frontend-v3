import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'
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

// ── Schemas ──────────────────────────────────────────────────────────────────

const crearSchema = z.object({
  usuario: z.string().min(3, 'Mínimo 3 caracteres'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  nombres: z.string().min(2, 'Requerido'),
  primerApellido: z.string().min(2, 'Requerido'),
  segundoApellido: z.string().optional(),
  tipoDocumento: z.enum(['CI', 'PASAPORTE', 'DNI', 'RUC']),
  nroDocumento: z.string().min(5, 'Mínimo 5 caracteres'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
})

// estado se cambia desde la tabla con endpoints dedicados (/activacion | /inactivacion)
const editarSchema = z.object({
  correoElectronico: z.string().email('Email inválido').optional().or(z.literal('')),
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

  const crearForm = useForm<CrearValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: {
      usuario: '',
      contrasena: '',
      nombres: '',
      primerApellido: '',
      segundoApellido: '',
      tipoDocumento: 'CI',
      nroDocumento: '',
      fechaNacimiento: '',
    },
  })

  const editarForm = useForm<EditarValues>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      correoElectronico: '',
      nombres: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
    },
  })

  // Cargar datos al abrir en modo edición
  useEffect(() => {
    if (usuario) {
      editarForm.reset({
        correoElectronico: usuario.correoElectronico ?? '',
        nombres: usuario.persona.nombres,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido ?? '',
        fechaNacimiento: usuario.persona.fechaNacimiento ?? '',
      })
    } else {
      crearForm.reset()
    }
  }, [usuario, open])

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
        persona: {
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
          <DialogTitle>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>

        {esEdicion ? (
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
          <Form {...crearForm}>
            <form onSubmit={crearForm.handleSubmit(onSubmitCrear)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={crearForm.control}
                  name="usuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="contrasena"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
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
                  control={crearForm.control}
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
                  control={crearForm.control}
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
                  control={crearForm.control}
                  name="tipoDocumento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo documento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CI">CI</SelectItem>
                          <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="RUC">RUC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={crearForm.control}
                  name="nroDocumento"
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
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de nacimiento</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={crearForm.formState.isSubmitting}>
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
