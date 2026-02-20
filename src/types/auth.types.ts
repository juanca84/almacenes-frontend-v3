export interface Usuario {
  id: string
  usuario: string
  nombre: string
  correo: string
  roles: string[]
}

export interface LoginPayload {
  usuario: string
  contrasena: string
}

export interface LoginResponse {
  access_token: string
  usuario: Usuario
}

export interface TokenPayload {
  id: string
  roles: string[]
  exp: number
  iat: number
}
