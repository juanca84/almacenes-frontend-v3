import api from './axios'
import type { BaseResponse, PaginatedResponse } from '@/types/api.types'
import type {
  UsuarioItem,
  RolDisponible,
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  CambiarContrasenaPayload,
  ActualizarPerfilPayload,
  ActualizarPerfilResult,
  ValidarContrasenaResult,
} from '@/types/usuario.types'

export const usuariosService = {
  // ── Roles disponibles ──────────────────────────────────────────────────────
  listarRoles: () =>
    api.get<BaseResponse<RolDisponible[]>>('/autorizacion/roles'),

  // ── CRUD principal ─────────────────────────────────────────────────────────
  listar: (params?: { pagina?: number; limite?: number; filtro?: string; rol?: string; estado?: string }) =>
    api.get<PaginatedResponse<UsuarioItem>>('/usuarios', { params }),

  obtener: (id: string) =>
    api.get<BaseResponse<UsuarioItem>>(`/usuarios/${id}`),

  crear: (payload: CreateUsuarioPayload) =>
    api.post<BaseResponse<UsuarioItem>>('/usuarios', payload),

  actualizar: (id: string, payload: UpdateUsuarioPayload) =>
    api.patch<BaseResponse<UsuarioItem>>(`/usuarios/${id}`, payload),

  // ── Cambios de estado ──────────────────────────────────────────────────────
  activar: (id: string) =>
    api.patch<BaseResponse<null>>(`/usuarios/${id}/activacion`),

  inactivar: (id: string) =>
    api.patch<BaseResponse<null>>(`/usuarios/${id}/inactivacion`),

  restaurarContrasena: (id: string) =>
    api.patch<BaseResponse<null>>(`/usuarios/${id}/restauracion`),

  // ── Cuenta propia ──────────────────────────────────────────────────────────
  obtenerPerfil: () =>
    api.get<BaseResponse<UsuarioItem>>('/usuarios/cuenta/perfil'),

  actualizarPerfil: (payload: ActualizarPerfilPayload) =>
    api.patch<BaseResponse<ActualizarPerfilResult>>('/usuarios/cuenta/perfil', payload),

  validarContrasena: (contrasena: string) =>
    api.post<BaseResponse<ValidarContrasenaResult>>('/usuarios/cuenta/validar-contrasena', { contrasena }),

  cambiarContrasena: (payload: CambiarContrasenaPayload) =>
    api.patch<BaseResponse<null>>('/usuarios/cuenta/contrasena', payload),
}
