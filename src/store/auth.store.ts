import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EstadoEntidad, Usuario } from '@/types/auth.types'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (token: string, usuario: Usuario) => void
  updateToken: (token: string) => void
  updateEstado: (estado: EstadoEntidad) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      setAuth: (token, usuario) => set({ token, usuario, isAuthenticated: true }),
      updateToken: (token) => set({ token }),
      updateEstado: (estado) =>
        set((s) => ({ usuario: s.usuario ? { ...s.usuario, estado } : null })),
      logout: () => set({ token: null, usuario: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
