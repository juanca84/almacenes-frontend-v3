import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function AuthGuard() {
  const { isAuthenticated, usuario } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (usuario?.estado === 'PENDIENTE') {
    return <Navigate to="/cambiar-contrasena" replace />
  }

  return <Outlet />
}
