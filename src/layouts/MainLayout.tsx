import { useMemo, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { NavSidebar } from '@/components/NavSidebar'
import { getMergedModulos } from '@/lib/permissions'
import { cn } from '@/lib/utils'

export function MainLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const modulos = useMemo(
    () => getMergedModulos(usuario?.roles?.map((r) => r.modulos) ?? []),
    [usuario]
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 flex flex-col shrink-0 transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo + toggle */}
        <div className="h-16 flex items-center border-b border-white/5 px-3 shrink-0">
          <div className={cn('flex items-center flex-1 min-w-0', collapsed ? 'justify-center' : 'gap-2.5 pl-2')}>
            <div className="size-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <Package className="size-4 text-primary" />
            </div>
            {!collapsed && (
              <span
                className="text-white font-semibold tracking-tight text-base truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Almacenes
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className="text-slate-400 hover:text-slate-200 hover:bg-white/5 shrink-0"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        {/* Nav */}
        <NavSidebar modulos={modulos} collapsed={collapsed} />

        {/* Usuario */}
        <div
          className={cn(
            'border-t border-white/5 shrink-0',
            collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4 flex items-center gap-3'
          )}
        >
          <Link
            to="/perfil"
            title="Mi perfil"
            className={cn(
              'flex items-center gap-3 rounded-md transition-colors hover:bg-white/5 min-w-0',
              collapsed ? 'shrink-0' : 'flex-1'
            )}
          >
            <Avatar className="size-8 ring-1 ring-white/10 shrink-0">
              <AvatarFallback className="text-xs bg-white/10 text-slate-300">
                {usuario?.usuario?.slice(0, 2).toUpperCase() ?? 'US'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {usuario?.usuario ?? 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {usuario?.roles?.[0]?.nombre ?? ''}
                </p>
              </div>
            )}
          </Link>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                title="Cerrar sesión"
                className="text-slate-400 hover:text-slate-200 hover:bg-white/5 shrink-0"
              >
                <LogOut className="size-4" />
              </Button>
            }
            title="¿Cerrar sesión?"
            description="¿Estás seguro de que quieres cerrar sesión?"
            confirmLabel="Cerrar sesión"
            onConfirm={handleLogout}
          />
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-6 shrink-0">
          <p className="text-sm font-medium text-muted-foreground">Sistema de Almacenes</p>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
