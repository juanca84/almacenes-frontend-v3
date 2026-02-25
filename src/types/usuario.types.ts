export type EstadoUsuario = 'ACTIVO' | 'INACTIVO'
export type TipoDocumento = 'CI' | 'PASAPORTE' | 'DNI' | 'RUC'

export interface UsuarioItem {
  id: string
  usuario: string
  correoElectronico?: string
  estado: EstadoUsuario
  roles?: { idRol: string; nombre: string }[]
  persona: {
    nombres: string
    primerApellido: string
    segundoApellido: string
    tipoDocumento: TipoDocumento
    nroDocumento: string
    fechaNacimiento: string
  }
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
