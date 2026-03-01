import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { catalogoService } from '@/services/catalogo.service'
import { catalogoDisponible, guardarCatalogo } from '@/lib/catalogo'

export function AuthGuard() {
  const { isAuthenticated, usuario } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !catalogoDisponible()) {
      catalogoService.obtener().then(({ data }) => {
        if (data.finalizado) guardarCatalogo(data.datos)
      })
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (usuario?.estado === 'PENDIENTE') {
    return <Navigate to="/cambiar-contrasena" replace />
  }

  return <Outlet />
}
