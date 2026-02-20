import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const { token, usuario, isAuthenticated, setToken, setUsuario, logout: clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const { data } = await authService.login(payload)
    if (data.finalizado) {
      setToken(data.datos.access_token)
      setUsuario(data.datos.usuario)
    }
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }

  return { token, usuario, isAuthenticated, login, logout }
}
