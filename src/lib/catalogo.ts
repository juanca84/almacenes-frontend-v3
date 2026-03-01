import type { Catalogo, CatalogoItem } from '@/types/catalogo.types'

const STORAGE_KEY = 'catalogo'

export function getCatalogoGrupo(grupo: string): CatalogoItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const catalogo = JSON.parse(raw) as Catalogo
    return catalogo[grupo] ?? []
  } catch {
    return []
  }
}

export function guardarCatalogo(datos: Catalogo): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(datos))
}

export function limpiarCatalogo(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function catalogoDisponible(): boolean {
  return !!sessionStorage.getItem(STORAGE_KEY)
}
