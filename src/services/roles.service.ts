import api from './axios'
import type { BaseResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ModuloDisponible,
  RolItem,
  RolModuloRaw,
  CreateRolPayload,
  UpdateRolPayload,
} from '@/types/roles.types'

export const rolesService = {
  // ── Módulos disponibles (árbol completo) ───────────────────────────────────
  listarModulos: () =>
    api.get<PaginatedResponse<ModuloDisponible>>('/autorizacion/modulos'),

  // ── CRUD de roles ──────────────────────────────────────────────────────────
  listar: () =>
    api.get<BaseResponse<RolItem[]>>('/autorizacion/roles'),

  crear: (payload: CreateRolPayload) =>
    api.post<BaseResponse<RolItem>>('/autorizacion/roles', payload),

  actualizar: (id: string, payload: UpdateRolPayload) =>
    api.patch<BaseResponse<{ id: string }>>(`/autorizacion/roles/${id}`, payload),

  // ── Módulos asignados a un rol específico (para precargar al editar) ───────
  obtenerModulos: (id: string) =>
    api.get<BaseResponse<RolModuloRaw[]>>(`/autorizacion/roles/${id}/modulos`),

  // ── Cambios de estado ──────────────────────────────────────────────────────
  inactivar: (id: string) =>
    api.patch<BaseResponse<{ id: string; estado: string }>>(`/autorizacion/roles/${id}/inactivacion`),

  activar: (id: string) =>
    api.patch<BaseResponse<{ id: string; estado: string }>>(`/autorizacion/roles/${id}/activacion`),
}
