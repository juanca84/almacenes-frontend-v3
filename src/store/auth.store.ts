import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types/auth.types'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
}

interface AuthActions {
  setToken: (token: string) => void
  setUsuario: (usuario: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: true }),
      setUsuario: (usuario) => set({ usuario }),
      logout: () => set({ token: null, usuario: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, usuario: state.usuario, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
