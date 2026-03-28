import type { Accion, EstadoEntidad } from './auth.types'

export type { Accion, EstadoEntidad }

export interface PropiedadesModulo {
  icono: string
  descripcion?: string
  color_light?: string
  color_dark?: string
}

export interface SubModuloDisponible {
  id: string
  label: string
  url: string
  nombre: string
  propiedades: PropiedadesModulo
}

export interface ModuloDisponible {
  id: string
  label: string
  url: string
  nombre: string
  propiedades: PropiedadesModulo
  subModulo?: SubModuloDisponible[]
}

export interface RolItem {
  id: string
  rol: string    // identificador inmutable, ej: "SUPERVISOR"
  nombre: string // nombre legible, ej: "Supervisor de almacén"
  estado: EstadoEntidad
}

// Permiso de un módulo/submódulo asignado a un rol
export interface ModuloPermiso {
  id: string
  acciones: Accion[]
}

// Shape que retorna GET /roles/:id/modulos (árbol con accion[] en cada nodo)
export interface RolModuloSubRaw {
  id: string
  accion: Accion[]
}

export interface RolModuloRaw {
  id: string
  accion: Accion[]
  subModulo?: RolModuloSubRaw[]
}

// Shape normalizado que usa ModuloArbol (flat: id → acciones)
// Idéntico a ModuloPermiso — es el mismo contrato
export type RolModuloItem = ModuloPermiso

export interface CreateRolPayload {
  rol: string
  nombre: string
  modulos: ModuloPermiso[]
}

export interface UpdateRolPayload {
  nombre?: string
  modulos?: ModuloPermiso[]
}
