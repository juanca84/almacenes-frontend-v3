import { create } from 'zustand'
import type { ModuloDisponible } from '@/types/roles.types'

/**
 * Store global para el árbol de módulos disponibles.
 * Se carga una sola vez al entrar al módulo de roles y se reutiliza
 * en el formulario de crear/editar sin nuevas peticiones al servidor.
 * No persiste en localStorage — el árbol cambia entre deploys del backend.
 */
interface ModulosState {
  modulos: ModuloDisponible[]
  loading: boolean
  loaded: boolean
}

interface ModulosActions {
  setModulos: (modulos: ModuloDisponible[]) => void
  setLoading: (loading: boolean) => void
}

export const useModulosStore = create<ModulosState & ModulosActions>((set) => ({
  modulos: [],
  loading: false,
  loaded: false,

  setModulos: (modulos) => set({ modulos, loaded: true }),
  setLoading: (loading) => set({ loading }),
}))
