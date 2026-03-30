import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

import { cn } from '@/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  dashboard:   'Dashboard',
  usuarios:    'Usuarios',
  roles:       'Roles',
  parametros:  'Parámetros',
  perfil:      'Perfil',
  cuenta:      'Cuenta',
  contrasena:  'Contraseña',
}

// Segmentos que no tienen página propia — se muestran como texto, no como Link
const NON_NAVIGABLE = new Set(['cuenta'])

interface Crumb {
  label:      string
  path:       string
  last:       boolean
  navigable:  boolean
}

export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label:       ROUTE_LABELS[seg] ?? seg,
    path:        '/' + segments.slice(0, i + 1).join('/'),
    last:        i === segments.length - 1,
    navigable:   !NON_NAVIGABLE.has(seg),
  }))
}

export function AppBreadcrumb() {
  const { pathname } = useLocation()
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname])

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
      <Link
        to="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Inicio"
      >
        <Home className="size-3.5" />
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
          {crumb.last ? (
            <span className={cn('font-medium text-foreground truncate', crumbs.length === 1 && 'text-base')}>
              {crumb.label}
            </span>
          ) : crumb.navigable ? (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-muted-foreground truncate">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
