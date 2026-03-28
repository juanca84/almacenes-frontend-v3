import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { parametrosService } from '@/services/parametros.service'
import type { ParametroItem } from '@/types/parametro.types'

const LIMITE_DEFAULT = 10

export interface UseParametrosReturn {
  parametros: ParametroItem[]
  loading: boolean
  total: number
  totalPaginas: number
  pagina: number
  limite: number
  gruposSeleccionados: string[]
  estadosSeleccionados: string[]
  gruposDisponibles: string[]
  loadingGrupos: boolean
  setGrupos: (v: string[]) => void
  setEstados: (v: string[]) => void
  setPagina: (v: number) => void
  setLimite: (v: number) => void
  recargar: () => void
}

export function useParametros(): UseParametrosReturn {
  const [parametros, setParametros] = useState<ParametroItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pagina, _setPagina] = useState(1)
  const [limite, _setLimite] = useState(LIMITE_DEFAULT)
  const [gruposSeleccionados, _setGrupos] = useState<string[]>([])
  const [estadosSeleccionados, _setEstados] = useState<string[]>([])
  const [gruposDisponibles, setGruposDisponibles] = useState<string[]>([])
  const [loadingGrupos, setLoadingGrupos] = useState(true)
  const [tick, setTick] = useState(0)
  const [tickGrupos, setTickGrupos] = useState(0)

  const totalPaginas = Math.max(1, Math.ceil(total / limite))

  const setGrupos  = (v: string[]) => { _setGrupos(v);  _setPagina(1) }
  const setEstados = (v: string[]) => { _setEstados(v); _setPagina(1) }
  const setPagina  = (v: number)   => _setPagina(v)
  const setLimite  = (v: number)   => { _setLimite(v);  _setPagina(1) }
  const recargar   = useCallback(() => {
    setTick((t) => t + 1)
    setTickGrupos((t) => t + 1)
  }, [])

  // Recarga grupos cuando se crea/edita un parámetro (tickGrupos)
  useEffect(() => {
    let cancelled = false
    setLoadingGrupos(true)
    parametrosService.listarGrupos()
      .then(({ data }) => { if (!cancelled && data.finalizado) setGruposDisponibles(data.datos) })
      .catch(() => { if (!cancelled) toast.error('Error al cargar los grupos') })
      .finally(() => { if (!cancelled) setLoadingGrupos(false) })
    return () => { cancelled = true }
  }, [tickGrupos])

  // Fetch de parámetros cuando cambian los filtros o la paginación
  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await parametrosService.listar({
          pagina,
          limite,
          grupos: gruposSeleccionados.length > 0 ? gruposSeleccionados.join(',') : undefined,
          estado: estadosSeleccionados.length > 0 ? estadosSeleccionados.join(',') : undefined,
        })
        if (!cancelled && data.finalizado) {
          setParametros(data.datos.filas)
          setTotal(data.datos.total)
        }
      } catch {
        if (!cancelled) toast.error('Error al cargar los parámetros')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [gruposSeleccionados, estadosSeleccionados, pagina, limite, tick])

  return {
    parametros, loading, total, totalPaginas,
    pagina, limite, gruposSeleccionados, estadosSeleccionados,
    gruposDisponibles, loadingGrupos,
    setGrupos, setEstados, setPagina, setLimite, recargar,
  }
}
