import type { BadgeProps } from '@/components/ui/badge'

export const ESTADO_PARAMETRO_VARIANTE: Record<string, BadgeProps['variant']> = {
  ACTIVO: 'success', // verde
  INACTIVO: 'secondary', // gris
}
