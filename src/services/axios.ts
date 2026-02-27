import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(
          `${BASE_URL}/token`,
          {},
          { withCredentials: true },
        )
        const newToken: string = data.datos.access_token
        useAuthStore.getState().updateToken(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
