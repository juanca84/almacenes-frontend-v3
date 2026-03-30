import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem, RolDisponible } from '@/types/usuario.types'
import { toCSV, downloadCSV, csvFilename } from '@/lib/export'
import { usePaginatedResource } from './usePaginatedResource'
import { useDebounce } from './useDebounce'

export interface UseUsuariosReturn {
  usuarios: UsuarioItem[]
  loading: boolean
  total: number
  totalPaginas: number
  pagina: number
  limite: number
  filtro: string
  roles: string[]
  estados: string[]
  sortBy: string | null
  sortDir: 'ASC' | 'DESC'
  rolesDisponibles: RolDisponible[]
  setFiltro: (v: string) => void
  setRoles: (v: string[]) => void
  setEstados: (v: string[]) => void
  setPagina: (v: number) => void
  setLimite: (v: number) => void
  setSort: (col: string) => void
  exportarCSV: () => Promise<void>
  recargar: () => void
}

export function useUsuarios(): UseUsuariosReturn {
  const [filtro, _setFiltro] = useState('')
  const [roles, _setRoles] = useState<string[]>([])
  const [estados, _setEstados] = useState<string[]>([])

  const debouncedFiltro = useDebounce(filtro, 300)

  const {
    items: usuarios,
    loading,
    total,
    totalPaginas,
    pagina,
    limite,
    sortBy,
    sortDir,
    setPagina,
    setLimite,
    setSort,
    recargar,
  } = usePaginatedResource<UsuarioItem>({
    queryKey: ({ pagina, limite, sortBy, sortDir }) => [
      'usuarios',
      'list',
      { pagina, limite, filtro: debouncedFiltro, roles, estados, sortBy, sortDir },
    ],
    invalidateKey: ['usuarios', 'list'],
    queryFn: async ({ pagina, limite, sortBy, sortDir }) => {
      const { data } = await usuariosService.listar({
        pagina,
        limite,
        filtro: debouncedFiltro || undefined,
        rol: roles.length > 0 ? roles.join(',') : undefined,
        estado: estados.length > 0 ? estados.join(',') : undefined,
        orden: sortBy ? `${sortBy}:${sortDir}` : undefined,
      })
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    errorMsg: 'Error al cargar los usuarios',
  })

  // Roles disponibles para el formulario — se cachean, rara vez cambian
  const { data: rolesData } = useQuery({
    queryKey: ['usuarios', 'roles-disponibles'],
    queryFn: async () => {
      const { data } = await usuariosService.listarRoles()
      if (!data.finalizado) throw new Error(data.mensaje)
      return data.datos
    },
    staleTime: 5 * 60 * 1000,
    meta: { errorMsg: 'Error al cargar los roles disponibles' },
  })

  const setFiltro = (v: string) => {
    _setFiltro(v)
    setPagina(1)
  }
  const setRoles = (v: string[]) => {
    _setRoles(v)
    setPagina(1)
  }
  const setEstados = (v: string[]) => {
    _setEstados(v)
    setPagina(1)
  }

  const exportarCSV = async () => {
    const { data } = await usuariosService.exportar({
      filtro: debouncedFiltro || undefined,
      rol: roles.length > 0 ? roles.join(',') : undefined,
      estado: estados.length > 0 ? estados.join(',') : undefined,
      orden: sortBy ? `${sortBy}:${sortDir}` : undefined,
    })
    if (!data.finalizado) return
    const headers = [
      'Usuario',
      'Nombres',
      'Primer apellido',
      'Segundo apellido',
      'Correo',
      'Teléfono',
      'Tipo documento',
      'Nro. documento',
      'Estado',
      'Roles',
    ]
    const rows = data.datos.map((u) => [
      u.usuario,
      u.persona.nombres,
      u.persona.primerApellido,
      u.persona.segundoApellido ?? '',
      u.correoElectronico ?? '',
      u.persona.telefono ?? '',
      u.persona.tipoDocumento,
      u.persona.nroDocumento,
      u.estado,
      (u.usuarioRol ?? []).map((r) => r.rol.rol).join(', '),
    ])
    downloadCSV(csvFilename('usuarios'), toCSV(headers, rows))
  }

  return {
    usuarios,
    loading,
    total,
    totalPaginas,
    pagina,
    limite,
    filtro,
    roles,
    estados,
    sortBy,
    sortDir,
    rolesDisponibles: rolesData ?? [],
    setFiltro,
    setRoles,
    setEstados,
    setPagina,
    setLimite,
    setSort,
    exportarCSV,
    recargar,
  }
}
