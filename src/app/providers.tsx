import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ThemeProvider } from 'next-themes'

import { getErrorMensaje } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 0,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            const msg =
              (query.meta?.errorMsg as string | undefined) ??
              getErrorMensaje(error) ??
              'Error al cargar datos'
            toast.error(msg)
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter>
          {children}
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
