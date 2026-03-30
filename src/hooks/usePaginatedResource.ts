import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

import type { PaginatedData } from '@/types/api.types'

const DEFAULT_LIMITE = 10

export interface Pagination {
  pagina: number
  limite: number
  sortBy: string | null
  sortDir: 'ASC' | 'DESC'
}

interface UsePaginatedResourceOptions<TItem> {
  /** Construye la query key completa a partir de la paginación actual. */
  queryKey: (pagination: Pagination) => unknown[]
  /** Prefijo usado para invalidar el caché al llamar `recargar()`. */
  invalidateKey: unknown[]
  /** Función que ejecuta la llamada al servicio y devuelve `PaginatedData<TItem>`. */
  queryFn: (pagination: Pagination) => Promise<PaginatedData<TItem>>
  /** Mensaje de error mostrado por el `QueryCache` global en caso de fallo. */
  errorMsg: string
  defaultLimite?: number
  defaultSortBy?: string | null
  defaultSortDir?: 'ASC' | 'DESC'
}

export interface UsePaginatedResourceReturn<TItem> {
  items: TItem[]
  loading: boolean
  total: number
  totalPaginas: number
  pagina: number
  limite: number
  sortBy: string | null
  sortDir: 'ASC' | 'DESC'
  setPagina: (v: number) => void
  setLimite: (v: number) => void
  setSort: (col: string) => void
  recargar: () => void
}

/**
 * Hook genérico de paginación con TanStack Query.
 *
 * Gestiona `pagina` y `limite`, calcula `totalPaginas` y expone `recargar()`.
 * Cada módulo aporta su propia lógica de filtros y llama a este hook
 * pasando factories de `queryKey` y `queryFn` que capturan esos filtros.
 *
 * @example
 * const { items, loading, pagina, setLimite, recargar } =
 *   usePaginatedResource<UsuarioItem>({
 *     queryKey: ({ pagina, limite }) => ['usuarios', 'list', { pagina, limite, filtro }],
 *     invalidateKey: ['usuarios', 'list'],
 *     queryFn: async ({ pagina, limite }) => { ... },
 *     errorMsg: 'Error al cargar los usuarios',
 *   })
 */
export function usePaginatedResource<TItem>({
  queryKey,
  invalidateKey,
  queryFn,
  errorMsg,
  defaultLimite = DEFAULT_LIMITE,
  defaultSortBy = null,
  defaultSortDir = 'ASC',
}: UsePaginatedResourceOptions<TItem>): UsePaginatedResourceReturn<TItem> {
  const queryClient = useQueryClient()

  const [pagina, setPagina] = useState(1)
  const [limite, _setLimite] = useState(defaultLimite)
  const [sortBy, setSortBy] = useState<string | null>(defaultSortBy)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>(defaultSortDir)

  const pagination: Pagination = { pagina, limite, sortBy, sortDir }

  const { data, isLoading } = useQuery({
    queryKey: queryKey(pagination),
    queryFn: () => queryFn(pagination),
    placeholderData: keepPreviousData,
    meta: { errorMsg },
  })

  const items = data?.filas ?? []
  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / limite))

  const setLimite = (v: number) => {
    _setLimite(v)
    setPagina(1)
  }
  const recargar = () => queryClient.invalidateQueries({ queryKey: invalidateKey })

  const setSort = (col: string) => {
    if (col === sortBy) {
      setSortDir((d) => (d === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortDir('ASC')
    }
    setPagina(1)
  }

  return {
    items,
    loading: isLoading,
    total,
    totalPaginas,
    pagina,
    limite,
    sortBy,
    sortDir,
    setPagina,
    setLimite,
    setSort,
    recargar,
  }
}
