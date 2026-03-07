import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'

import { usuariosService } from '@/services/usuarios.service'
import { useValidarContrasena } from '@/hooks/useValidarContrasena'
import { getErrorMensaje } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator'
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

interface CambiarContrasenaDialogProps {
  open: boolean
  onClose: () => void
}

const schema = z.object({
  contrasenaActual:    z.string().min(1, 'Requerida'),
  contrasenaNueva:     z.string().min(1, 'Requerida'),
  confirmarContrasena: z.string().min(1, 'Requerida'),
}).refine((d) => d.contrasenaNueva === d.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
})

type FormValues = z.infer<typeof schema>

export function CambiarContrasenaDialog({ open, onClose }: CambiarContrasenaDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmarContrasena: '' },
  })

  const contrasenaNueva     = form.watch('contrasenaNueva')
  const confirmarContrasena = form.watch('confirmarContrasena')
  const { validacion, validando, errorValidacion } = useValidarContrasena(contrasenaNueva)

  const puedeGuardar = validacion?.valida === true && !validando && contrasenaNueva === confirmarContrasena

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await usuariosService.cambiarContrasena({
        contrasenaActual: values.contrasenaActual,
        contrasenaNueva:  values.contrasenaNueva,
      })
      if (data.finalizado) {
        toast.success('Contraseña actualizada correctamente')
        handleClose()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al cambiar la contraseña')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="size-5 text-primary" />
            </div>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contrasenaActual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Contraseña actual</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contrasenaNueva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <PasswordStrengthIndicator
                    visible={!!contrasenaNueva}
                    validacion={validacion}
                    validando={validando}
                    errorValidacion={errorValidacion}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmarContrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || !puedeGuardar}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Actualizar contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
