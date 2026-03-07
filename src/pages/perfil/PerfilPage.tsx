import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, CreditCard, KeyRound, Mail, Pencil, Phone, ShieldCheck, User } from 'lucide-react'

import { usePerfil } from '@/hooks/usePerfil'
import { avatarClases, iniciales } from '@/lib/avatar'
import { formatFecha } from '@/lib/format'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { getNombreCompleto } from '@/lib/usuario'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { ESTADO_USUARIO_VARIANTE } from '@/constants/usuario'
import { EditarContactoDialog } from './EditarContactoDialog'
import { CambiarContrasenaDialog } from './CambiarContrasenaDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ── Subcomponentes locales ─────────────────────────────────────────────────────

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

function PerfilSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="rounded-xl border bg-muted/20 h-28" />
      <div className="rounded-xl border bg-muted/20 h-40" />
      <div className="rounded-xl border bg-muted/20 h-32" />
      <div className="rounded-xl border bg-muted/20 h-20" />
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

export function PerfilPage() {
  const { perfil, loading, recargar } = usePerfil()
  const [editarContacto, setEditarContacto]       = useState(false)
  const [cambiarContrasena, setCambiarContrasena] = useState(false)

  const catalogoEstado  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.ESTADO_USUARIO), [])
  const catalogoGenero  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.GENERO), [])
  const catalogoTipoDoc = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.TIPO_DOCUMENTO), [])

  if (loading) return <PerfilSkeleton />

  if (!perfil) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 text-muted-foreground text-sm">
        No se pudo cargar el perfil.
      </div>
    )
  }

  const { persona } = perfil

  const nombreCompleto = getNombreCompleto(persona)
  const estadoLabel  = catalogoEstado.find((e)  => e.codigo === perfil.estado)?.nombre  ?? perfil.estado
  const generoLabel  = catalogoGenero.find((g)  => g.codigo === persona.genero)?.nombre  ?? persona.genero
  const tipoDocLabel = catalogoTipoDoc.find((t) => t.codigo === persona.tipoDocumento)?.nombre ?? persona.tipoDocumento

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="rounded-xl border bg-gradient-to-br from-background via-primary/5 to-muted/40 p-5">
        <div className="flex items-center gap-4">
          <div
            className={`size-16 rounded-full flex items-center justify-center shrink-0 text-xl font-bold ${avatarClases(perfil)}`}
          >
            {iniciales(perfil)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight truncate">{nombreCompleto}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">@{perfil.usuario}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant={ESTADO_USUARIO_VARIANTE[perfil.estado]}>{estadoLabel}</Badge>
              {(perfil.usuarioRol ?? []).map((r) => (
                <Badge key={r.rol.id} variant="secondary">{r.rol.rol}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Información personal ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-blue-500 dark:text-blue-400" />
            Información personal
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              icon={<User className="size-3 text-blue-500 dark:text-blue-400" />}
            />
            <Campo
              label="Fecha de nacimiento"
              value={formatFecha(persona.fechaNacimiento)}
              icon={<Calendar className="size-3 text-blue-500 dark:text-blue-400" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Contacto ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-sky-500 dark:text-sky-400" />
              Contacto
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setEditarContacto(true)}
            >
              <Pencil className="size-3" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
              <Mail className="size-3.5 text-sky-500 dark:text-sky-400" />
            </div>
            {perfil.correoElectronico
              ? <span className="truncate">{perfil.correoElectronico}</span>
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
        </CardContent>
      </Card>

      {/* ── Seguridad ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-amber-500 dark:text-amber-400" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <KeyRound className="size-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Contraseña</p>
                <p className="text-xs text-muted-foreground tracking-widest">••••••••••••</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setCambiarContrasena(true)}
            >
              <KeyRound className="size-3" />
              Cambiar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      <EditarContactoDialog
        open={editarContacto}
        onClose={() => setEditarContacto(false)}
        correoActual={perfil.correoElectronico}
        telefonoActual={persona.telefono}
        onSuccess={recargar}
      />

      <CambiarContrasenaDialog
        open={cambiarContrasena}
        onClose={() => setCambiarContrasena(false)}
      />
    </div>
  )
}
