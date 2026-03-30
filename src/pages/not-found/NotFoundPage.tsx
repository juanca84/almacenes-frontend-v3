import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mt-2 text-lg font-medium text-foreground">Página no encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
      </div>
      <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
    </div>
  )
}
