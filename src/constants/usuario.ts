import type { BadgeProps } from '@/components/ui/badge'

export const ESTADO_USUARIO_VARIANTE: Record<string, BadgeProps['variant']> = {
  ACTIVO:   'success',     // verde
  INACTIVO: 'destructive', // rojo
  PENDIENTE: 'warning',    // ámbar
}
