import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const { token, usuario, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const { data } = await authService.login(payload)
    if (data.finalizado) {
      const { access_token, ...userData } = data.datos
      setAuth(access_token, userData)
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
