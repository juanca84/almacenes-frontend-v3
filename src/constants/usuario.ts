import type { BadgeProps } from '@/components/ui/badge'

export const ESTADO_USUARIO_VARIANTE: Record<string, BadgeProps['variant']> = {
  ACTIVO:   'success',     // verde
  INACTIVO: 'secondary',   // gris
  PENDIENTE: 'warning',    // ámbar
}
