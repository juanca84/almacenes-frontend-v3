import { useMemo } from 'react'
import { User } from 'lucide-react'

import type { UsuarioItem } from '@/types/usuario.types'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { ESTADO_USUARIO_VARIANTE } from '@/constants/usuario'
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
}

function Campo({ label, value }: CampoProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {value || <span className="text-muted-foreground italic font-normal">No registrado</span>}
      </p>
    </div>
  )
}

export function UsuarioDetailDialog({ open, onClose, usuario }: UsuarioDetailDialogProps) {
  const catalogoEstado   = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO), [])
  const catalogoGenero   = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.GENERO), [])
  const catalogoTipoDoc  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.TIPO_DOCUMENTO), [])

  if (!usuario) return null

  const { persona } = usuario

  const nombreCompleto = [persona.nombres, persona.primerApellido, persona.segundoApellido]
    .filter(Boolean)
    .join(' ')

  const estadoLabel   = catalogoEstado.find((e) => e.codigo === usuario.estado)?.nombre ?? usuario.estado
  const generoLabel   = catalogoGenero.find((g) => g.codigo === persona.genero)?.nombre ?? persona.genero
  const tipoDocLabel  = catalogoTipoDoc.find((t) => t.codigo === persona.tipoDocumento)?.nombre ?? persona.tipoDocumento

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base leading-tight truncate">{nombreCompleto}</DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground">@{usuario.usuario}</p>
                <Badge variant={ESTADO_USUARIO_VARIANTE[usuario.estado]}>
                  {estadoLabel}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Información personal */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Información personal
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo label="Tipo de documento" value={tipoDocLabel} />
              <Campo label="Nro. documento"    value={persona.nroDocumento} />
              <Campo label="Género"            value={generoLabel} />
              <Campo label="Teléfono"          value={persona.telefono} />
              <Campo label="Fecha de nacimiento" value={persona.fechaNacimiento} />
            </div>
          </section>

          <Separator />

          {/* Acceso */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Acceso
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo label="Usuario"            value={usuario.usuario} />
              <Campo label="Correo electrónico" value={usuario.correoElectronico} />
            </div>
          </section>

          <Separator />

          {/* Roles */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
