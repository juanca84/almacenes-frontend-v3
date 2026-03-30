import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { usePaginatedResource } from './usePaginatedResource'
import type { PaginatedData } from '@/types/api.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const TEST_KEY = ({ pagina, limite }: { pagina: number; limite: number }) => [
  'test',
  { pagina, limite },
]
const INVALIDATE_KEY = ['test']

function emptyFn(): Promise<PaginatedData<never>> {
  return Promise.resolve({ filas: [], total: 0 })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('usePaginatedResource', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = makeQueryClient()
  })

  // ── Estado inicial ─────────────────────────────────────────────────────────

  it('inicia en pagina=1, limite=10 con datos vacíos', () => {
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    expect(result.current.pagina).toBe(1)
    expect(result.current.limite).toBe(10)
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.totalPaginas).toBe(1)
  })

  it('respeta defaultLimite personalizado', () => {
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
          defaultLimite: 25,
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    expect(result.current.limite).toBe(25)
  })

  // ── Paginación ─────────────────────────────────────────────────────────────

  it('setPagina actualiza la página', () => {
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    act(() => result.current.setPagina(4))
    expect(result.current.pagina).toBe(4)
  })

  it('setLimite actualiza el límite y resetea pagina a 1', () => {
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    act(() => result.current.setPagina(3))
    expect(result.current.pagina).toBe(3)

    act(() => result.current.setLimite(20))
    expect(result.current.limite).toBe(20)
    expect(result.current.pagina).toBe(1)
  })

  // ── totalPaginas ───────────────────────────────────────────────────────────

  it('calcula totalPaginas = ceil(total / limite)', async () => {
    const queryFn = vi.fn().mockResolvedValue({ filas: [], total: 25 } as PaginatedData<never>)
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    await waitFor(() => expect(result.current.total).toBe(25))
    expect(result.current.totalPaginas).toBe(3) // ceil(25 / 10)
  })

  it('totalPaginas es mínimo 1 aunque total sea 0', async () => {
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalPaginas).toBe(1)
  })

  it('totalPaginas exacto cuando total es múltiplo de limite', async () => {
    const queryFn = vi.fn().mockResolvedValue({ filas: [], total: 20 } as PaginatedData<never>)
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    await waitFor(() => expect(result.current.total).toBe(20))
    expect(result.current.totalPaginas).toBe(2) // 20 / 10 = 2 exacto
  })

  // ── recargar ───────────────────────────────────────────────────────────────

  it('recargar invoca invalidateQueries con invalidateKey', () => {
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn: emptyFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    // Sin act(): invalidateQueries es síncrono — solo verificamos que el spy lo captura
    result.current.recargar()
    expect(spy).toHaveBeenCalledWith({ queryKey: INVALIDATE_KEY })
  })

  // ── queryFn ────────────────────────────────────────────────────────────────

  it('llama queryFn con pagina y limite correctos', async () => {
    const queryFn = vi.fn().mockResolvedValue({ filas: [], total: 0 } as PaginatedData<never>)
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(queryFn).toHaveBeenCalledWith({ pagina: 1, limite: 10, sortBy: null, sortDir: 'ASC' })
  })

  it('expone los items retornados por queryFn', async () => {
    const items = [{ id: '1' }, { id: '2' }]
    const queryFn = vi
      .fn()
      .mockResolvedValue({ filas: items, total: 2 } as PaginatedData<{ id: string }>)
    const { result } = renderHook(
      () =>
        usePaginatedResource({
          queryKey: TEST_KEY,
          invalidateKey: INVALIDATE_KEY,
          queryFn,
          errorMsg: 'Error',
        }),
      { wrapper: makeWrapper(queryClient) }
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual(items)
    expect(result.current.total).toBe(2)
  })
})
