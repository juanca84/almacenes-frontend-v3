import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Bienvenido al Sistema de Almacenes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(['Entradas', 'Salidas', 'Stock Total', 'Alertas'] as const).map((titulo) => (
          <Card key={titulo}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
