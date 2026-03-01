import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { catalogoService } from '@/services/catalogo.service'
import { guardarCatalogo, limpiarCatalogo } from '@/lib/catalogo'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const { token, usuario, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const { data } = await authService.login(payload)
    if (data.finalizado) {
      const { access_token, ...userData } = data.datos
      setAuth(access_token, userData)
      const catalogo = await catalogoService.obtener()
      if (catalogo.data.finalizado) guardarCatalogo(catalogo.data.datos)
    }
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      limpiarCatalogo()
      clearAuth()
    }
  }

  return { token, usuario, isAuthenticated, login, logout }
}
