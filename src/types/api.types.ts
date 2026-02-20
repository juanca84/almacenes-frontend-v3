export interface BaseResponse<T> {
  finalizado: boolean
  mensaje: string
  datos: T
}

export interface PaginatedData<T> {
  filas: T[]
  totalFilas: number
}

export type PaginatedResponse<T> = BaseResponse<PaginatedData<T>>
