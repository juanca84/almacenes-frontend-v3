import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, Boxes, AlertTriangle } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { getMergedModulos } from '@/lib/permissions'
import { getNombreCompleto } from '@/lib/usuario'
import { getIcon } from '@/lib/icon-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/app'
import type { Modulo } from '@/types/auth.types'

// ── Constantes ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { titulo: 'Entradas', icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { titulo: 'Salidas', icon: ArrowUpFromLine, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { titulo: 'Stock Total', icon: Boxes, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { titulo: 'Alertas', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
] as const

function getSaludo(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function ModuloShortcut({ modulo }: { modulo: Modulo }) {
  const Icon = getIcon(modulo.propiedades.icono)
  const href = modulo.subModulo[0]?.url ?? modulo.url
  const colorLight = modulo.propiedades.color_light

  return (
    <Link to={href}>
      <Card className="h-full transition-colors hover:bg-accent cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div
            className="size-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colorLight ? `${colorLight}20` : undefined }}
          >
            <Icon className="size-5" style={{ color: colorLight ?? undefined }} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{modulo.label}</p>
            {modulo.subModulo.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                {modulo.subModulo.length} sección{modulo.subModulo.length !== 1 ? 'es' : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { usuario } = useAuth()

  const modulos = useMemo(
    () => getMergedModulos(usuario?.roles?.map((r) => r.modulos) ?? []),
    [usuario]
  )

  const nombre = usuario ? getNombreCompleto(usuario.persona) : ''
  const rol = usuario?.roles?.[0]?.nombre ?? ''

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <APP_CONFIG.icon className="size-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{getSaludo()},</p>
          <h2 className="text-2xl font-bold tracking-tight">{nombre || usuario?.usuario}</h2>
          {rol && <p className="text-sm text-muted-foreground mt-0.5">{rol}</p>}
        </div>
      </div>

      {/* KPIs */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Resumen
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(({ titulo, icon: Icon, color, bg }) => (
            <Card key={titulo}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {titulo}
                </CardTitle>
                <div className={`size-8 rounded-md flex items-center justify-center ${bg}`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">—</p>
                <p className="text-xs text-muted-foreground mt-1">Sin datos aún</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Acceso rápido */}
      {modulos.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Acceso rápido
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modulos.map((modulo) => (
              <ModuloShortcut key={modulo.id} modulo={modulo} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
