import { useMemo } from 'react'
import { Calendar, CreditCard, Mail, Phone, ShieldCheck } from 'lucide-react'

import type { UsuarioItem } from '@/types/usuario.types'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { formatFecha } from '@/lib/format'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { ESTADO_USUARIO_VARIANTE } from '@/constants/usuario'
import { avatarClases, iniciales } from '@/lib/avatar'
import { getNombreCompleto } from '@/lib/usuario'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UsuarioDetailDialogProps {
  open: boolean
  onClose: () => void
  usuario: UsuarioItem | null
}

interface CampoProps {
  label: string
  value?: string | null
  icon?: React.ReactNode
}

function Campo({ label, value, icon }: CampoProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium">
        {value || <span className="text-muted-foreground italic font-normal">No registrado</span>}
      </p>
    </div>
  )
}

export function UsuarioDetailDialog({ open, onClose, usuario }: UsuarioDetailDialogProps) {
  const catalogoEstado  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO), [])
  const catalogoGenero  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.GENERO), [])
  const catalogoTipoDoc = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.TIPO_DOCUMENTO), [])

  if (!usuario) return null

  const { persona } = usuario

  const nombreCompleto = getNombreCompleto(persona)

  const estadoLabel  = catalogoEstado.find((e)  => e.codigo === usuario.estado)?.nombre  ?? usuario.estado
  const generoLabel  = catalogoGenero.find((g)  => g.codigo === persona.genero)?.nombre  ?? persona.genero
  const tipoDocLabel = catalogoTipoDoc.find((t) => t.codigo === persona.tipoDocumento)?.nombre ?? persona.tipoDocumento

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {/* Avatar + nombre + estado */}
          <div className="flex items-center gap-4 pr-6">
            <div className={`size-14 rounded-full flex items-center justify-center shrink-0 text-lg font-bold ${avatarClases(usuario)}`}>
              {iniciales(usuario)}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base leading-snug truncate">{nombreCompleto}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">@{usuario.usuario}</p>
              <div className="mt-1.5">
                <Badge variant={ESTADO_USUARIO_VARIANTE[usuario.estado]}>
                  {estadoLabel}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Contacto */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-sky-500 dark:text-sky-400" />
              Contacto
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
                  <Mail className="size-3.5 text-sky-500 dark:text-sky-400" />
                </div>
                {usuario.correoElectronico
                  ? <span className="truncate">{usuario.correoElectronico}</span>
                  : <span className="text-muted-foreground italic">Sin correo registrado</span>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Phone className="size-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                {persona.telefono
                  ? <span>{persona.telefono}</span>
                  : <span className="text-muted-foreground italic">Sin teléfono registrado</span>}
              </div>
            </div>
          </section>

          <Separator />

          {/* Información personal */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-blue-500 dark:text-blue-400" />
              Información personal
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo
                label="Tipo de documento"
                value={tipoDocLabel}
                icon={<CreditCard className="size-3 text-blue-500 dark:text-blue-400" />}
              />
              <Campo
                label="Nro. documento"
                value={persona.nroDocumento}
                icon={<CreditCard className="size-3 text-blue-500 dark:text-blue-400" />}
              />
              <Campo
                label="Género"
                value={generoLabel}
              />
              <Campo
                label="Fecha de nacimiento"
                value={formatFecha(persona.fechaNacimiento)}
                icon={<Calendar className="size-3 text-blue-500 dark:text-blue-400" />}
              />
            </div>
          </section>

          <Separator />

          {/* Roles */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-amber-500 dark:text-amber-400" />
              Roles asignados
            </h4>
            {(usuario.usuarioRol ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin roles asignados</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(usuario.usuarioRol ?? []).map((r) => (
                  <Badge key={r.rol.id} variant="secondary">{r.rol.rol}</Badge>
                ))}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
