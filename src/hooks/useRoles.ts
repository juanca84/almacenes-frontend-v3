import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { rolesService } from '@/services/roles.service'
import { useModulosStore } from '@/store/modulos.store'
import { getErrorStatus, withToast } from '@/lib/utils'
import { toCSV, downloadCSV, csvFilename } from '@/lib/export'
import type { RolItem } from '@/types/roles.types'

export interface UseRolesReturn {
  roles: RolItem[]
  loading: boolean
  recargar: () => void
  inactivar: (id: string) => Promise<boolean>
  activar: (id: string) => Promise<boolean>
  exportarCSV: () => void
}

export function useRoles(): UseRolesReturn {
  const queryClient = useQueryClient()
  const { loaded, setModulos, setLoading: setLoadingModulos } = useModulosStore()

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
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await rolesService.listar()
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    meta: { errorMsg: 'Error al cargar los roles' },
  })

  const recargar = () => queryClient.invalidateQueries({ queryKey: ['roles'] })

  const inactivar = (id: string) =>
    withToast(() => rolesService.inactivar(id), {
      successMsg: 'Rol inactivado correctamente',
      errorMsg: 'Error al inactivar el rol',
      onSuccess: recargar,
      onError: (error) => {
        const status = getErrorStatus(error)
        if (status === 412) {
          recargar()
          return true
        }
        if (status === 403) {
          toast.error('No se puede modificar un rol del sistema')
          return true
        }
        return false
      },
    })

  const activar = (id: string) =>
    withToast(() => rolesService.activar(id), {
      successMsg: 'Rol activado correctamente',
      errorMsg: 'Error al activar el rol',
      onSuccess: recargar,
      onError: (error) => {
        if (getErrorStatus(error) === 403) {
          toast.error('No se puede modificar un rol del sistema')
          return true
        }
        return false
      },
    })

  const roles = data ?? []

  const exportarCSV = () => {
    const headers = ['Identificador', 'Nombre', 'Estado']
    const rows = roles.map((r) => [r.rol, r.nombre, r.estado])
    downloadCSV(csvFilename('roles'), toCSV(headers, rows))
  }

  return { roles, loading: isLoading, recargar, inactivar, activar, exportarCSV }
}
