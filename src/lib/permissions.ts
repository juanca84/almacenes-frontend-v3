import type { Accion, Modulo } from '@/types/auth.types'

/**
 * Fusiona módulos y submódulos de todos los roles del usuario eliminando duplicados.
 * Las acciones de cada submódulo se unen entre roles (union de sets).
 *
 * Ejemplo: ADMINISTRADOR tiene ["read","delete"] en /usuarios y
 *          TECNICO tiene ["read"] en /usuarios
 *          → el usuario tiene ["read","delete"]
 */
export function getMergedModulos(roles: Modulo[][]): Modulo[] {
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
          moduloExistente.subModulo.push({ ...sub, accion: [...(sub.accion ?? [])] })
        } else {
          const accionesUnidas = new Set([...subExistente.accion, ...(sub.accion ?? [])])
          subExistente.accion = Array.from(accionesUnidas) as Accion[]
        }
      })
    })
  })

  return Array.from(modulosMap.values())
}
