export interface LoginPayload {
  usuario: string
  contrasena: string
}

export type Accion = 'read' | 'create' | 'update' | 'delete'

export interface SubModulo {
  id: string
  label: string
  url: string
  nombre: string
  propiedades: {
    icono: string
    color_dark: string
    color_light: string
    descripcion?: string
  }
  estado: string
  accion: Accion[]
}

export interface Modulo {
  id: string
  label: string
  url: string
  nombre: string
  propiedades: {
    icono: string
    color_dark: string
    color_light: string
  }
  estado: string
  subModulo: SubModulo[]
  accion: Accion[]
}

export interface Rol {
  idRol: string
  rol: string
  nombre: string
  modulos: Modulo[]
}

export interface Persona {
  nombres: string
  primerApellido: string
  segundoApellido: string
  tipoDocumento: string
  nroDocumento: string
  fechaNacimiento: string
}

export interface Usuario {
  id: string
  usuario: string
  estado: string
  roles: Rol[]
  persona: Persona
}

export interface LoginResponse extends Usuario {
  access_token: string
}

export interface TokenPayload {
  id: string
  roles: string[]
  exp: number
  iat: number
}
