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
    <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
      {activeModulos.map((modulo) => {
        const subItems = modulo.subModulo.filter((s) => s.estado === 'ACTIVO')
        if (subItems.length === 0) return null

        return (
          <div key={modulo.id}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {modulo.label}
            </p>
            <div className="space-y-0.5">
              {subItems.map((sub) => {
                const Icon = getIcon(sub.propiedades.icono)
                return (
                  <NavLink
                    key={sub.id}
                    to={sub.url}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                      )
                    }
                    title={sub.propiedades.descripcion}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
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
