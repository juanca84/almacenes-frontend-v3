import { Providers } from './providers'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
