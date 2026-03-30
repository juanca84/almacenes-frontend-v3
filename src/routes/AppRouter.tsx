import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from '@/auth/guards/AuthGuard'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { PageSkeleton } from '@/components/PageSkeleton'
import { AuthPageSkeleton } from '@/components/AuthPageSkeleton'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

const LoginPage = lazy(() =>
  import('@/auth/login/LoginPage').then(({ LoginPage }) => ({ default: LoginPage }))
)
const CambiarContrasenaPage = lazy(() =>
  import('@/auth/cambiar-contrasena/CambiarContrasenaPage').then(({ CambiarContrasenaPage }) => ({
    default: CambiarContrasenaPage,
  }))
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then(({ DashboardPage }) => ({
    default: DashboardPage,
  }))
)
const UsuariosPage = lazy(() =>
  import('@/pages/usuarios/UsuariosPage').then(({ UsuariosPage }) => ({ default: UsuariosPage }))
)
const RestablecerContrasenaPage = lazy(() =>
  import('@/pages/cuenta/RestablecerContrasenaPage').then(({ RestablecerContrasenaPage }) => ({
    default: RestablecerContrasenaPage,
  }))
)
const PerfilPage = lazy(() =>
  import('@/pages/perfil/PerfilPage').then(({ PerfilPage }) => ({ default: PerfilPage }))
)
const RolesPage = lazy(() =>
  import('@/pages/roles/RolesPage').then(({ RolesPage }) => ({ default: RolesPage }))
)
const ParametrosPage = lazy(() =>
  import('@/pages/parametros/ParametrosPage').then(({ ParametrosPage }) => ({
    default: ParametrosPage,
  }))
)

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <Suspense fallback={<AuthPageSkeleton />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/cambiar-contrasena"
          element={
            <Suspense fallback={<AuthPageSkeleton />}>
              <CambiarContrasenaPage />
            </Suspense>
          }
        />
      </Route>

      {/* Rutas privadas */}
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/usuarios"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <UsuariosPage />
              </Suspense>
            }
          />
          <Route
            path="/cuenta/contrasena"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <RestablecerContrasenaPage />
              </Suspense>
            }
          />
          <Route
            path="/perfil"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PerfilPage />
              </Suspense>
            }
          />
          <Route
            path="/roles"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <RolesPage />
              </Suspense>
            }
          />
          <Route
            path="/parametros"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ParametrosPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Redirect raíz y 404 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
