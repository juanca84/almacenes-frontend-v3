import type { Accion } from '@/types/auth.types'

export const ROLES_SISTEMA = ['ADMINISTRADOR', 'TECNICO'] as const

export const ACCIONES_MODULO = ['read', 'create', 'update', 'delete'] as const satisfies Accion[]

export const ACCION_LABEL: Record<Accion, string> = {
  read:   'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
}

/**
 * Convierte el input del usuario al formato que guardará el backend.
 * Ejemplo: "supervisor almacén" → "SUPERVISOR_ALMACÉN"
 * Preview orientativa — el backend aplica su propia transformación.
 */
export const formatearIdentificador = (valor: string): string =>
  valor.trim().toUpperCase().replace(/\s+/g, '_')

export const esRolSistema = (rol: string): boolean =>
  (ROLES_SISTEMA as readonly string[]).includes(rol)
