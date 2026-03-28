import api from './axios'
import type { BaseResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ParametroItem,
  CreateParametroPayload,
  UpdateParametroPayload,
} from '@/types/parametro.types'

export const parametrosService = {
  listarGrupos: () =>
    api.get<BaseResponse<string[]>>('/parametros/grupos'),

  listar: (params?: {
    pagina?: number
    limite?: number
    grupos?: string
    estado?: string
    orden?: string
  }) =>
    api.get<PaginatedResponse<ParametroItem>>('/parametros', { params }),

  obtener: (id: string) =>
    api.get<BaseResponse<ParametroItem>>(`/parametros/${id}`),

  crear: (payload: CreateParametroPayload) =>
    api.post<BaseResponse<ParametroItem>>('/parametros', payload),

  actualizar: (id: string, payload: UpdateParametroPayload) =>
    api.patch<BaseResponse<{ id: string }>>(`/parametros/${id}`, payload),

  activar: (id: string) =>
    api.patch<BaseResponse<null>>(`/parametros/${id}/activacion`),

  inactivar: (id: string) =>
    api.patch<BaseResponse<null>>(`/parametros/${id}/inactivacion`),
}
