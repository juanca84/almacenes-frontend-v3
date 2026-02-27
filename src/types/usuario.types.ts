import type { Persona, TipoDocumento, EstadoEntidad } from './auth.types'

// Re-exportamos para que los consumidores sigan importando desde aquí
export type { Persona, TipoDocumento }
export type EstadoUsuario = EstadoEntidad

export interface UsuarioItem {
  id: string
  usuario: string
  correoElectronico?: string
  estado: EstadoUsuario
  roles?: { idRol: string; nombre: string }[]
  persona: Persona
}

export interface CreateUsuarioPayload {
  usuario: string
  contrasena: string
  nombres: string
  primerApellido: string
  segundoApellido?: string
  tipoDocumento: TipoDocumento
  nroDocumento: string
  fechaNacimiento: string
}

// estado se gestiona con endpoints dedicados: /activacion | /inactivacion
export interface UpdateUsuarioPayload {
  correoElectronico?: string
  roles?: string[]
  persona?: {
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
