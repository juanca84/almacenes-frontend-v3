import { useQuery, useQueryClient } from '@tanstack/react-query'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem } from '@/types/usuario.types'

export function usePerfil() {
  const queryClient = useQueryClient()

  const {
    data: perfil = null,
    isLoading: loading,
    isError: error,
  } = useQuery<UsuarioItem>({
    queryKey: ['perfil'],
    queryFn: async () => {
      const { data } = await usuariosService.obtenerPerfil()
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    meta: { errorMsg: 'Error al cargar el perfil' },
  })

  const recargar = () => queryClient.invalidateQueries({ queryKey: ['perfil'] })

  return { perfil, loading, error, recargar }
}
