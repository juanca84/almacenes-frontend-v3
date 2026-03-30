import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { parametrosService } from '@/services/parametros.service'
import type { ParametroItem } from '@/types/parametro.types'
import { toCSV, downloadCSV, csvFilename } from '@/lib/export'
import { usePaginatedResource } from './usePaginatedResource'

export interface UseParametrosReturn {
  parametros:           ParametroItem[]
  loading:              boolean
  total:                number
  totalPaginas:         number
  pagina:               number
  limite:               number
  gruposSeleccionados:  string[]
  estadosSeleccionados: string[]
  sortBy:               string | null
  sortDir:              'ASC' | 'DESC'
  gruposDisponibles:    string[]
  loadingGrupos:        boolean
  setGrupos:            (v: string[]) => void
  setEstados:           (v: string[]) => void
  setPagina:            (v: number) => void
  setLimite:            (v: number) => void
  setSort:              (col: string) => void
  exportarCSV:          () => Promise<void>
  recargar:             () => void
}

export function useParametros(): UseParametrosReturn {
  const [gruposSeleccionados, _setGrupos]   = useState<string[]>([])
  const [estadosSeleccionados, _setEstados] = useState<string[]>([])

  const {
    items: parametros, loading, total, totalPaginas,
    pagina, limite, sortBy, sortDir, setPagina, setLimite, setSort, recargar,
  } = usePaginatedResource<ParametroItem>({
    queryKey: ({ pagina, limite, sortBy, sortDir }) =>
      ['parametros', 'list', { pagina, limite, gruposSeleccionados, estadosSeleccionados, sortBy, sortDir }],
    // Prefijo 'parametros' invalida lista + grupos simultáneamente
    invalidateKey: ['parametros'],
    queryFn: async ({ pagina, limite, sortBy, sortDir }) => {
      const { data } = await parametrosService.listar({
        pagina,
        limite,
        grupos: gruposSeleccionados.length > 0 ? gruposSeleccionados.join(',') : undefined,
        estado: estadosSeleccionados.length > 0 ? estadosSeleccionados.join(',') : undefined,
        orden:  sortBy ? `${sortBy}:${sortDir}` : undefined,
      })
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    errorMsg: 'Error al cargar los parámetros',
  })

  // Grupos disponibles para el filtro — se invalidan junto a 'list' al recargar
  const { data: gruposData, isLoading: loadingGrupos } = useQuery({
    queryKey: ['parametros', 'grupos'],
    queryFn:  async () => {
      const { data } = await parametrosService.listarGrupos()
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    staleTime: 5 * 60 * 1000,
    meta: { errorMsg: 'Error al cargar los grupos' },
  })

  const setGrupos  = (v: string[]) => { _setGrupos(v);  setPagina(1) }
  const setEstados = (v: string[]) => { _setEstados(v); setPagina(1) }

  const exportarCSV = async () => {
    const { data } = await parametrosService.exportar({
      grupos: gruposSeleccionados.length > 0 ? gruposSeleccionados.join(',') : undefined,
      estado: estadosSeleccionados.length > 0 ? estadosSeleccionados.join(',') : undefined,
      orden:  sortBy ? `${sortBy}:${sortDir}` : undefined,
    })
    if (!data.finalizado) return
    const headers = ['Grupo', 'Código', 'Nombre', 'Descripción', 'Estado']
    const rows = data.datos.map((p) => [
      p.grupo,
      p.codigo,
      p.nombre,
      p.descripcion,
      p.estado,
    ])
    downloadCSV(csvFilename('parametros'), toCSV(headers, rows))
  }

  return {
    parametros, loading, total, totalPaginas,
    pagina, limite, gruposSeleccionados, estadosSeleccionados, sortBy, sortDir,
    gruposDisponibles: gruposData ?? [],
    loadingGrupos,
    setGrupos, setEstados, setPagina, setLimite, setSort, exportarCSV, recargar,
  }
}
