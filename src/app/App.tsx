import { Providers } from './providers'
import { AppRouter } from '@/routes/AppRouter'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  )
}
