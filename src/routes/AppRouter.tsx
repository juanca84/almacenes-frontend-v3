import { Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from '@/auth/guards/AuthGuard'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/auth/login/LoginPage'
import { CambiarContrasenaPage } from '@/auth/cambiar-contrasena/CambiarContrasenaPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage'
import { RestablecerContrasenaPage } from '@/pages/cuenta/RestablecerContrasenaPage'

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cambiar-contrasena" element={<CambiarContrasenaPage />} />
      </Route>

      {/* Rutas privadas */}
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/cuenta/contrasena" element={<RestablecerContrasenaPage />} />
        </Route>
      </Route>

      {/* Redirect raíz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
