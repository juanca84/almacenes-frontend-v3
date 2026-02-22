import { NavLink } from 'react-router-dom'

import type { Modulo } from '@/types/auth.types'
import { getIcon } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

interface NavSidebarProps {
  modulos: Modulo[]
}

export function NavSidebar({ modulos }: NavSidebarProps) {
  const activeModulos = modulos.filter((m) => m.estado === 'ACTIVO')

  return (
    <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
      {activeModulos.map((modulo) => {
        const subItems = modulo.subModulo.filter((s) => s.estado === 'ACTIVO')
        if (subItems.length === 0) return null

        return (
          <div key={modulo.id}>
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {modulo.label}
            </p>
            <div className="space-y-1">
              {subItems.map((sub) => {
                const Icon = getIcon(sub.propiedades.icono)
                return (
                  <NavLink
                    key={sub.id}
                    to={sub.url}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                    title={sub.propiedades.descripcion}
                  >
                    <Icon className="size-4 shrink-0" />
                    {sub.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
