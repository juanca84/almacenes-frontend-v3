import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem, RolDisponible } from '@/types/usuario.types'
import { useDebounce } from './useDebounce'

const LIMITE_DEFAULT = 10

export interface UseUsuariosReturn {
  usuarios: UsuarioItem[]
  loading: boolean
  total: number
  totalPaginas: number
  pagina: number
  limite: number
  filtro: string
  roles: string[]
  estados: string[]
  rolesDisponibles: RolDisponible[]
  setFiltro: (v: string) => void
  setRoles: (v: string[]) => void
  setEstados: (v: string[]) => void
  setPagina: (v: number) => void
  setLimite: (v: number) => void
  recargar: () => void
}

export function useUsuarios(): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pagina, _setPagina] = useState(1)
  const [limite, _setLimite] = useState(LIMITE_DEFAULT)
  const [filtro, _setFiltro] = useState('')
  const [roles, _setRoles] = useState<string[]>([])
  const [estados, _setEstados] = useState<string[]>([])
  const [rolesDisponibles, setRolesDisponibles] = useState<RolDisponible[]>([])
  const [tick, setTick] = useState(0)

  const debouncedFiltro = useDebounce(filtro, 300)
  const totalPaginas = Math.max(1, Math.ceil(total / limite))

  const setFiltro  = (v: string)   => { _setFiltro(v);  _setPagina(1) }
  const setRoles   = (v: string[]) => { _setRoles(v);   _setPagina(1) }
  const setEstados = (v: string[]) => { _setEstados(v); _setPagina(1) }
  const setPagina  = (v: number)   => _setPagina(v)
  const setLimite  = (v: number)   => { _setLimite(v);  _setPagina(1) }
  const recargar   = useCallback(() => setTick((t) => t + 1), [])

  // Cargar roles disponibles una sola vez
  useEffect(() => {
    usuariosService.listarRoles()
      .then(({ data }) => { if (data.finalizado) setRolesDisponibles(data.datos) })
      .catch(() => {})
  }, [])

  // Fetch de usuarios cuando cambian los parámetros
  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await usuariosService.listar({
          pagina,
          limite,
          filtro: debouncedFiltro || undefined,
          rol:    roles.length   > 0 ? roles.join(',')   : undefined,
          estado: estados.length > 0 ? estados.join(',') : undefined,
        })
        if (!cancelled && data.finalizado) {
          setUsuarios(data.datos.filas)
          setTotal(data.datos.total)
        }
      } catch {
        if (!cancelled) toast.error('Error al cargar los usuarios')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [debouncedFiltro, roles, estados, pagina, limite, tick])

  return {
    usuarios, loading, total, totalPaginas,
    pagina, limite, filtro, roles, estados, rolesDisponibles,
    setFiltro, setRoles, setEstados, setPagina, setLimite, recargar,
  }
}
