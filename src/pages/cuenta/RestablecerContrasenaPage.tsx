import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { KeyRound, ShieldCheck } from 'lucide-react'

import { usuariosService } from '@/services/usuarios.service'
import { useValidarContrasena } from '@/hooks/useValidarContrasena'
import { getErrorMensaje } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  contrasenaActual:    z.string().min(1, 'Requerida'),
  contrasenaNueva:     z.string().min(1, 'Requerida'),
  confirmarContrasena: z.string().min(1, 'Requerida'),
}).refine((d) => d.contrasenaNueva === d.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
})

type FormValues = z.infer<typeof schema>

export function RestablecerContrasenaPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmarContrasena: '' },
  })

  const contrasenaNueva     = form.watch('contrasenaNueva')
  const confirmarContrasena = form.watch('confirmarContrasena')
  const { validacion, validando, errorValidacion } = useValidarContrasena(contrasenaNueva)

  const puedeGuardar = validacion?.valida === true && !validando && contrasenaNueva === confirmarContrasena

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await usuariosService.cambiarContrasena({
        contrasenaActual: values.contrasenaActual,
        contrasenaNueva:  values.contrasenaNueva,
      })
      if (data.finalizado) {
        toast.success('Contraseña actualizada correctamente')
        form.reset()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al cambiar la contraseña')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Restablecer contraseña</h2>
          <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Cambiar contraseña</CardTitle>
          </div>
          <CardDescription>
            La nueva contraseña debe cumplir los requisitos de seguridad del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contrasenaActual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
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
                    <FormLabel>Nueva contraseña</FormLabel>
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
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting || !puedeGuardar}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Actualizar contraseña'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
