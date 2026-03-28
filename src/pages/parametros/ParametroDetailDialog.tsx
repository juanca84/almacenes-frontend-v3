import { AlignLeft, Hash, Layers } from 'lucide-react'

import type { ParametroItem } from '@/types/parametro.types'
import { ESTADO_PARAMETRO_VARIANTE } from '@/constants/parametro'
import { grupoClases, grupoLetra } from '@/lib/parametro'
import { Campo } from '@/components/Campo'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ParametroDetailDialogProps {
  open: boolean
  onClose: () => void
  parametro: ParametroItem | null
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SeccionHeader({ icon, titulo }: { icon: React.ReactNode; titulo: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
      {icon}
      {titulo}
    </h4>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ParametroDetailDialog({ open, onClose, parametro }: ParametroDetailDialogProps) {
  if (!parametro) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Icono de grupo + código + nombre + estado */}
          <div className="flex items-center gap-4 pr-6">
            <div className={`size-14 rounded-full flex items-center justify-center shrink-0 text-lg font-bold ${grupoClases(parametro.grupo)}`}>
              {grupoLetra(parametro.grupo)}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-mono leading-snug truncate">
                {parametro.codigo}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{parametro.nombre}</p>
              <div className="mt-1.5">
                <Badge variant={ESTADO_PARAMETRO_VARIANTE[parametro.estado]}>
                  {parametro.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Identificación */}
          <section className="space-y-3">
            <SeccionHeader
              icon={<Hash className="size-3.5 text-violet-500 dark:text-violet-400" />}
              titulo="Identificación"
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo
                label="Código"
                value={parametro.codigo}
                icon={<Hash className="size-3 text-violet-500 dark:text-violet-400" />}
                mono
              />
              <Campo
                label="Grupo"
                value={parametro.grupo}
                icon={<Layers className="size-3 text-emerald-500 dark:text-emerald-400" />}
                mono
              />
            </div>
          </section>

          <Separator />

          {/* Detalle */}
          <section className="space-y-3">
            <SeccionHeader
              icon={<AlignLeft className="size-3.5 text-slate-500 dark:text-slate-400" />}
              titulo="Detalle"
            />
            <div className="space-y-4">
              <Campo
                label="Nombre"
                value={parametro.nombre}
              />
              <Campo
                label="Descripción"
                value={parametro.descripcion}
                icon={<AlignLeft className="size-3 text-slate-500 dark:text-slate-400" />}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
