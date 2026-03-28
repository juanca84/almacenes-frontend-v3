export type EstadoParametro = 'ACTIVO' | 'INACTIVO'

export interface ParametroItem {
  id: string
  codigo: string
  nombre: string
  grupo: string
  descripcion: string
  estado: EstadoParametro
}

export interface CreateParametroPayload {
  codigo: string
  nombre: string
  grupo: string
  descripcion: string
}

export interface UpdateParametroPayload {
  nombre?: string
  grupo?: string
  descripcion?: string
}
