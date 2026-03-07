import { useMemo } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { Accion } from '@/types/auth.types'

export { getMergedModulos } from '@/lib/permissions'

/**
 * Hook para verificar permisos del usuario autenticado.
 *
 * @example
 * const { tieneAccion, getAcciones } = usePermissions()
 *
 * tieneAccion('usuarios', 'delete')  // true | false
 * getAcciones('usuarios')            // ['read', 'create', 'update', 'delete']
 */
export function usePermissions() {
  const usuario = useAuthStore((state) => state.usuario)

  const permisosMap = useMemo(() => {
    const map = new Map<string, Set<Accion>>()
    usuario?.roles?.forEach((rol) => {
      rol.modulos.forEach((modulo) => {
        modulo.subModulo.forEach((sub) => {
          const acciones = map.get(sub.nombre) ?? new Set<Accion>()
          ;(sub.accion ?? []).forEach((a) => acciones.add(a))
          map.set(sub.nombre, acciones)
        })
      })
    })
    return map
  }, [usuario])

  const tieneAccion = (subModuloNombre: string, accion: Accion): boolean => {
    return permisosMap.get(subModuloNombre)?.has(accion) ?? false
  }

  const getAcciones = (subModuloNombre: string): Accion[] => {
    return Array.from(permisosMap.get(subModuloNombre) ?? [])
  }

  return { tieneAccion, getAcciones }
}
