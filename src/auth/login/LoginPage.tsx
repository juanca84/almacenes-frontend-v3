import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Package } from 'lucide-react'
import type { ControllerRenderProps } from 'react-hook-form'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es requerido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usuario: '', contrasena: '' },
  })

  const onSubmit = async (values: LoginForm) => {
    setLoading(true)
    try {
      const result = await login(values)
      if (result.finalizado) {
        toast.success('Sesión iniciada correctamente')
        navigate('/dashboard')
      } else {
        toast.error(result.mensaje)
      }
    } catch {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Almacenes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sistema de gestión de inventario
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="shadow-xl shadow-slate-200/60 border-slate-200/80">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-semibold">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usuario"
                render={({ field }: { field: ControllerRenderProps<LoginForm, 'usuario'> }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu usuario" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contrasena"
                render={({ field }: { field: ControllerRenderProps<LoginForm, 'contrasena'> }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full shadow-sm" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
