import { NavLink } from 'react-router-dom'

import type { Modulo } from '@/types/auth.types'
import { getIcon } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

interface NavSidebarProps {
  modulos: Modulo[]
  collapsed?: boolean
}

export function NavSidebar({ modulos, collapsed = false }: NavSidebarProps) {
  const activeModulos = modulos.filter((m) => m.estado === 'ACTIVO')

  return (
    <nav className={cn('flex-1 overflow-y-auto space-y-5', collapsed ? 'p-2' : 'p-4')}>
      {activeModulos.map((modulo) => {
        const subItems = modulo.subModulo.filter((s) => s.estado === 'ACTIVO')
        if (subItems.length === 0) return null

        return (
          <div key={modulo.id}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {modulo.label}
              </p>
            )}
            <div className="space-y-0.5">
              {subItems.map((sub) => {
                const Icon = getIcon(sub.propiedades.icono)
                return (
                  <NavLink
                    key={sub.id}
                    to={sub.url}
                    title={collapsed ? sub.label : sub.propiedades.descripcion}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center rounded-md py-2 text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                      )
                    }
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    {!collapsed && sub.label}
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
