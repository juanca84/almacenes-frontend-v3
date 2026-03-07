import { useCallback, useEffect, useState } from 'react'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'

export function usePerfil() {
  const [perfil, setPerfil]   = useState<UsuarioItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await usuariosService.obtenerPerfil()
      if (data.finalizado) {
        setPerfil(data.datos)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { perfil, loading, error, recargar: cargar }
}
