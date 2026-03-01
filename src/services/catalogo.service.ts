import api from './axios'
import type { BaseResponse } from '@/types/api.types'
import type { Catalogo } from '@/types/catalogo.types'

export const catalogoService = {
  obtener: () => api.get<BaseResponse<Catalogo>>('/catalogo'),
}
