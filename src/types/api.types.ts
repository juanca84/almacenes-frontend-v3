export interface BaseResponse<T> {
  finalizado: boolean
  mensaje: string
  datos: T
}

export interface PaginatedData<T> {
  filas: T[]
  total: number
}

export type PaginatedResponse<T> = BaseResponse<PaginatedData<T>>
