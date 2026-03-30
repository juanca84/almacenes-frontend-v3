import { Shield } from 'lucide-react'

import { useModulosStore } from '@/store/modulos.store'
import { useRolModulos } from '@/hooks/useRolModulos'
import { esRolSistema } from '@/constants/roles'
import type { RolItem } from '@/types/roles.types'
import { ModuloArbol } from './components/ModuloArbol'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RolDetailDialogProps {
  open: boolean
  onClose: () => void
  rol: RolItem | null
}

export function RolDetailDialog({ open, onClose, rol }: RolDetailDialogProps) {
  const { modulos, loading: loadingModulos } = useModulosStore()
  const { modulosRol, loading: loadingModulosRol } = useRolModulos(
    rol && open ? rol.id : null,
  )

  if (!rol) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base flex items-center gap-2">
                {rol.nombre}
                {esRolSistema(rol.rol) && (
                  <Badge variant="secondary" className="text-[10px]">
                    Sistema
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {rol.rol}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Permisos por módulo
          </p>
          <div className="border rounded-lg px-2 pb-2 bg-muted/10 max-h-[60vh] overflow-y-auto">
            <ModuloArbol
              modulos={modulos}
              value={modulosRol}
              onChange={() => {}}
              loading={loadingModulos || loadingModulosRol}
              disabled
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
