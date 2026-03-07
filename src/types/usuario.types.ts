import type { Persona, TipoDocumento, EstadoEntidad } from './auth.types'

// Re-exportamos para que los consumidores sigan importando desde aquí
export type { Persona, TipoDocumento }
export type EstadoUsuario = EstadoEntidad

export interface UsuarioItem {
  id: string
  usuario: string
  correoElectronico?: string
  estado: EstadoUsuario
  usuarioRol?: { id: string; estado: string; rol: { id: string; rol: string } }[]
  persona: Persona
}

export interface RolDisponible {
  id: string
  rol: string
  nombre: string
}

export interface CreateUsuarioPayload {
  correoElectronico: string
  roles: string[]
  persona: {
    tipoDocumento: string
    nroDocumento: string
    genero?: string
    telefono?: string
    nombres: string
    primerApellido: string
    segundoApellido?: string
    fechaNacimiento: string
  }
}

// estado se gestiona con endpoints dedicados: /activacion | /inactivacion
export interface UpdateUsuarioPayload {
  correoElectronico?: string
  roles?: string[]
  persona?: {
    genero?: string
    telefono?: string
    nombres?: string
    primerApellido?: string
    segundoApellido?: string
    fechaNacimiento?: string
  }
}

export interface CambiarContrasenaPayload {
  contrasenaActual: string
  contrasenaNueva: string
}

export interface ActualizarPerfilPayload {
  correoElectronico?: string
  telefono?: string
}

export interface ActualizarPerfilResult {
  id: string
}

export interface ValidarContrasenaResult {
  valida: boolean
  score: number   // 0-4
  nivel: string   // "Muy débil" | "Débil" | "Regular" | "Fuerte" | "Muy fuerte"
}
