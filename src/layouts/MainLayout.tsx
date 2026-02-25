import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { NavSidebar } from '@/components/NavSidebar'
import { getMergedModulos } from '@/hooks/usePermissions'

export function MainLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const modulos = getMergedModulos(usuario?.roles?.map((r) => r.modulos) ?? [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Package className="size-4 text-primary" />
            </div>
            <span className="text-white font-semibold tracking-tight text-base"
              style={{ fontFamily: 'var(--font-display)' }}>
              Almacenes
            </span>
          </div>
        </div>

        {/* Nav */}
        <NavSidebar modulos={modulos} />

        {/* Usuario */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <Avatar className="size-8 ring-1 ring-white/10">
            <AvatarFallback className="text-xs bg-white/10 text-slate-300">
              {usuario?.usuario?.slice(0, 2).toUpperCase() ?? 'US'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {usuario?.usuario ?? 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {usuario?.roles?.[0]?.nombre ?? ''}
            </p>
          </div>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                title="Cerrar sesión"
                className="text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
          <h1 className="text-sm font-medium text-muted-foreground">Sistema de Almacenes</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
