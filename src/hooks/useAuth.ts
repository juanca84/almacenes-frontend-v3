import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const { token, usuario, isAuthenticated, setToken, setUsuario, logout: clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const { data } = await authService.login({
      ...payload,
      contrasena: btoa(payload.contrasena),
    })
    if (data.finalizado) {
      const { access_token, ...userData } = data.datos
      setToken(access_token)
      setUsuario(userData)
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
