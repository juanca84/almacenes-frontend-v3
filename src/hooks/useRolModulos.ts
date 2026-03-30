import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { rolesService } from '@/services/roles.service'
import type { RolModuloItem, RolModuloRaw } from '@/types/roles.types'

// Aplana el árbol de módulos del rol en un flat array { id, acciones }
// que es el formato que espera ModuloArbol (value prop)
function aplanarModulosRol(arbol: RolModuloRaw[]): RolModuloItem[] {
  const result: RolModuloItem[] = []
  for (const mod of arbol) {
    if (mod.accion.length > 0) result.push({ id: mod.id, acciones: mod.accion })
    for (const sub of mod.subModulo ?? []) {
      if (sub.accion.length > 0) result.push({ id: sub.id, acciones: sub.accion })
    }
  }
  return result
}

/**
 * Obtiene los módulos y acciones actualmente asignados a un rol.
 * Solo realiza el fetch cuando rolId es no nulo (modo edición/detalle).
 */
export function useRolModulos(rolId: string | null) {
  const [modulosRol, setModulosRol] = useState<RolModuloItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!rolId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModulosRol([])
      return
    }

    let cancelled = false
    setLoading(true)

    rolesService
      .obtenerModulos(rolId)
      .then(({ data }) => {
        if (!cancelled && data.finalizado) {
          setModulosRol(aplanarModulosRol(data.datos))
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Error al cargar los permisos del rol')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [rolId])

  return { modulosRol, loading }
}
