import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone } from 'lucide-react'

import { usuariosService } from '@/services/usuarios.service'
import type { ActualizarPerfilPayload } from '@/types/usuario.types'
import { getErrorMensaje } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const contactoSchema = z.object({
  correoElectronico: z.string().email('Email inválido').or(z.literal('')),
  telefono: z.string().max(50, 'Máximo 50 caracteres'),
})

type ContactoValues = z.infer<typeof contactoSchema>

interface EditarContactoDialogProps {
  open: boolean
  onClose: () => void
  correoActual?: string
  telefonoActual?: string
  onSuccess: () => void
}

export function EditarContactoDialog({
  open,
  onClose,
  correoActual,
  telefonoActual,
  onSuccess,
}: EditarContactoDialogProps) {
  const form = useForm<ContactoValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues: { correoElectronico: '', telefono: '' },
  })

  const { reset } = form

  useEffect(() => {
    if (open) reset({ correoElectronico: correoActual ?? '', telefono: telefonoActual ?? '' })
  }, [open, correoActual, telefonoActual, reset])

  const onSubmit = async (values: ContactoValues) => {
    try {
      const payload: ActualizarPerfilPayload = { telefono: values.telefono }
      if (values.correoElectronico) payload.correoElectronico = values.correoElectronico

      const { data } = await usuariosService.actualizarPerfil(payload)
      if (data.finalizado) {
        toast.success('Información de contacto actualizada')
        onSuccess()
        onClose()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al actualizar el contacto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="size-5 text-primary" />
            </div>
            <DialogTitle>Editar contacto</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="correoElectronico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3 opacity-60" />
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3 opacity-60" />
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ej. 70012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
