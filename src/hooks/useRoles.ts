import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { rolesService } from '@/services/roles.service'
import { useModulosStore } from '@/store/modulos.store'
import { getErrorStatus } from '@/lib/utils'
import type { RolItem } from '@/types/roles.types'

export interface UseRolesReturn {
  roles: RolItem[]
  loading: boolean
  recargar: () => void
  inactivar: (id: string) => Promise<void>
  activar: (id: string) => Promise<void>
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<RolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const { loaded, setModulos, setLoading: setLoadingModulos } =
    useModulosStore()

  // Carga el árbol de módulos en el store global (solo una vez por sesión)
  useEffect(() => {
    if (loaded) return
    let cancelled = false
    setLoadingModulos(true)
    rolesService
      .listarModulos()
      .then(({ data }) => {
        if (!cancelled && data.finalizado) setModulos(data.datos?.filas ?? [])
      })
      .catch(() => {
        if (!cancelled) toast.error('Error al cargar los módulos')
      })
      .finally(() => {
        setLoadingModulos(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, setModulos, setLoadingModulos])

  // Carga la lista de roles; se repite cuando se llama recargar()
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    rolesService
      .listar()
      .then(({ data }) => {
        if (!cancelled && data.finalizado) setRoles(data.datos)
      })
      .catch(() => {
        if (!cancelled) toast.error('Error al cargar los roles')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [tick])

  const recargar = useCallback(() => setTick((t) => t + 1), [])

  const inactivar = useCallback(async (id: string) => {
    try {
      const { data } = await rolesService.inactivar(id)
      if (data.finalizado) {
        toast.success('Rol inactivado correctamente')
        recargar()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      const status = getErrorStatus(error)
      if (status === 412) {
        // Estado desincronizado — refrescar lista silenciosamente
        recargar()
        return
      }
      if (status === 403) {
        toast.error('No se puede modificar un rol del sistema')
        return
      }
      toast.error('Error al inactivar el rol')
    }
  }, [recargar])

  const activar = useCallback(async (id: string) => {
    try {
      const { data } = await rolesService.activar(id)
      if (data.finalizado) {
        toast.success('Rol activado correctamente')
        recargar()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      if (getErrorStatus(error) === 403) {
        toast.error('No se puede modificar un rol del sistema')
        return
      }
      toast.error('Error al activar el rol')
    }
  }, [recargar])

  return { roles, loading, recargar, inactivar, activar }
}
