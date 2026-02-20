import api from './axios'
import type { BaseResponse } from '@/types/api.types'
import type { LoginPayload, LoginResponse } from '@/types/auth.types'

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<BaseResponse<LoginResponse>>('/auth', payload),

  logout: () => api.get<BaseResponse<null>>('/logout'),

  refreshToken: () => api.post<BaseResponse<{ access_token: string }>>('/token'),
}
