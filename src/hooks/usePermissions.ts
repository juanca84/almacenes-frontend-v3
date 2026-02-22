import { useAuthStore } from '@/store/auth.store'
import type { Accion, Modulo } from '@/types/auth.types'

/**
 * Fusiona módulos y submódulos de todos los roles del usuario eliminando duplicados.
 * Las acciones de cada submódulo se unen entre roles (union de sets).
 *
 * Ejemplo: ADMINISTRADOR tiene ["read","delete"] en /usuarios y
 *          TECNICO tiene ["read"] en /usuarios
 *          → el usuario tiene ["read","delete"]
 */
export function getMergedModulos(roles: Modulo[][] ): Modulo[] {
  const modulosMap = new Map<string, Modulo>()

  roles.forEach((modulos) => {
    modulos.forEach((modulo) => {
      if (!modulosMap.has(modulo.id)) {
        modulosMap.set(modulo.id, { ...modulo, subModulo: [] })
      }

      const moduloExistente = modulosMap.get(modulo.id)!

      modulo.subModulo.forEach((sub) => {
        const subExistente = moduloExistente.subModulo.find((s) => s.id === sub.id)
        if (!subExistente) {
          moduloExistente.subModulo.push({ ...sub, accion: [...sub.accion] })
        } else {
          // Unir acciones sin duplicados
          const accionesUnidas = new Set([...subExistente.accion, ...sub.accion])
          subExistente.accion = Array.from(accionesUnidas) as Accion[]
        }
      })
    })
  })

  return Array.from(modulosMap.values())
}

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

  // Mapa: nombre del submódulo → Set de acciones (fusión de todos los roles)
  const permisosMap = new Map<string, Set<Accion>>()

  usuario?.roles?.forEach((rol) => {
    rol.modulos.forEach((modulo) => {
      modulo.subModulo.forEach((sub) => {
        if (!permisosMap.has(sub.nombre)) {
          permisosMap.set(sub.nombre, new Set())
        }
        sub.accion.forEach((a) => permisosMap.get(sub.nombre)!.add(a))
      })
    })
  })

  const tieneAccion = (subModuloNombre: string, accion: Accion): boolean => {
    return permisosMap.get(subModuloNombre)?.has(accion) ?? false
  }

  const getAcciones = (subModuloNombre: string): Accion[] => {
    return Array.from(permisosMap.get(subModuloNombre) ?? [])
  }

  return { tieneAccion, getAcciones }
}
