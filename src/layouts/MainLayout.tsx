import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <Package className="size-5 mr-2 text-primary" />
          <span className="font-bold text-lg">Almacenes</span>
        </div>

        <NavSidebar modulos={modulos} />

        <Separator />
        <div className="p-4 flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {usuario?.usuario?.slice(0, 2).toUpperCase() ?? 'US'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{usuario?.usuario ?? 'Usuario'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {usuario?.roles?.[0]?.nombre ?? ''}
            </p>
          </div>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" title="Cerrar sesión">
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

      {/* Main content */}
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
