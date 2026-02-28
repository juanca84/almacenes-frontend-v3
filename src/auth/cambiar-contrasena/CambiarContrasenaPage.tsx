import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { KeyRound, Package } from 'lucide-react'

import { useAuthStore } from '@/store/auth.store'
import { usuariosService } from '@/services/usuarios.service'
import { useValidarContrasena } from '@/hooks/useValidarContrasena'
import { FORTALEZA_CONTRASENA } from '@/constants/contrasena'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  contrasenaActual: z.string().min(1, 'Requerida'),
  contrasenaNueva:  z.string().min(1, 'Requerida'),
})

type FormValues = z.infer<typeof schema>

export function CambiarContrasenaPage() {
  const { isAuthenticated, usuario, updateEstado } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '' },
  })

  const contrasenaNueva = form.watch('contrasenaNueva')
  const { validacion, validando, errorValidacion } = useValidarContrasena(contrasenaNueva)

  // Guards — después de los hooks
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (usuario?.estado !== 'PENDIENTE') return <Navigate to="/dashboard" replace />

  const puedeGuardar = validacion?.valida === true && !validando
  const fortaleza    = validacion != null ? FORTALEZA_CONTRASENA[validacion.score] : null

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await usuariosService.cambiarContrasena({
        contrasenaActual: values.contrasenaActual,
        contrasenaNueva:  values.contrasenaNueva,
      })
      if (data.finalizado) {
        updateEstado('ACTIVO')
        toast.success('Contraseña actualizada. ¡Bienvenido!')
        navigate('/dashboard', { replace: true })
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      const mensaje = (error as { response?: { data?: { mensaje?: string } } })
        ?.response?.data?.mensaje
      toast.error(mensaje ?? 'Error al cambiar la contraseña')
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Marca */}
      <div className="flex flex-col items-center gap-3">
        <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Package className="size-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Almacenes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Sistema de gestión de inventario</p>
        </div>
      </div>

      {/* Card */}
      <Card className="shadow-xl shadow-slate-200/60 border-slate-200/80">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <KeyRound className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold">Cambiar contraseña</CardTitle>
          </div>
          <CardDescription>
            Tu cuenta está pendiente de activación. Establece una nueva contraseña para continuar.
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
                    <FormLabel>Contraseña temporal</FormLabel>
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

                    {/* Indicador de fortaleza */}
                    {contrasenaNueva && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1">
                          {FORTALEZA_CONTRASENA.map((f, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                !validando && validacion != null && i <= validacion.score
                                  ? ''
                                  : validando ? 'bg-muted animate-pulse' : 'bg-muted'
                              }`}
                              style={
                                !validando && validacion != null && i <= validacion.score
                                  ? { backgroundColor: f.hex }
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                        {validando ? (
                          <p className="text-xs text-muted-foreground">Validando...</p>
                        ) : errorValidacion ? (
                          <p className="text-xs text-destructive">No se pudo validar la contraseña</p>
                        ) : fortaleza ? (
                          <p className="text-xs font-medium" style={{ color: fortaleza.hex }}>
                            {validacion!.nivel}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full shadow-sm"
                disabled={form.formState.isSubmitting || !puedeGuardar}
              >
                {form.formState.isSubmitting ? 'Guardando...' : 'Establecer contraseña'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
