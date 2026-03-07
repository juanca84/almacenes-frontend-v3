import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from '@/auth/guards/AuthGuard'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/auth/login/LoginPage'
import { CambiarContrasenaPage } from '@/auth/cambiar-contrasena/CambiarContrasenaPage'

const DashboardPage          = lazy(() => import('@/pages/dashboard/DashboardPage').then(({ DashboardPage })                   => ({ default: DashboardPage })))
const UsuariosPage           = lazy(() => import('@/pages/usuarios/UsuariosPage').then(({ UsuariosPage })                     => ({ default: UsuariosPage })))
const RestablecerContrasenaPage = lazy(() => import('@/pages/cuenta/RestablecerContrasenaPage').then(({ RestablecerContrasenaPage }) => ({ default: RestablecerContrasenaPage })))
const PerfilPage             = lazy(() => import('@/pages/perfil/PerfilPage').then(({ PerfilPage })                           => ({ default: PerfilPage })))

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
          <Route path="/dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
          <Route path="/usuarios" element={<Suspense fallback={null}><UsuariosPage /></Suspense>} />
          <Route path="/cuenta/contrasena" element={<Suspense fallback={null}><RestablecerContrasenaPage /></Suspense>} />
          <Route path="/perfil" element={<Suspense fallback={null}><PerfilPage /></Suspense>} />
        </Route>
      </Route>

      {/* Redirect raíz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
