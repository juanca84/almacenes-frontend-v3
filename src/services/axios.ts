import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// --- Refresh lock ---
// Evita que múltiples peticiones con 401 simultáneas disparen
// varias llamadas a POST /api/token al mismo tiempo.
let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

function resolveQueue(token: string) {
  refreshQueue.forEach(cb => cb(token))
  refreshQueue = []
}

function clearQueue() {
  refreshQueue = []
}
// --------------------

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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encolar y esperar el nuevo token
    if (isRefreshing) {
      return new Promise<string>(resolve => {
        refreshQueue.push(resolve)
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        originalRequest._retry = true
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    // Separamos el refresh del retry: el catch solo maneja fallos del refresh,
    // no errores posteriores del request original.
    let newToken: string | undefined
    try {
      const { data } = await axios.post(
        `${BASE_URL}/token`,
        {},
        { withCredentials: true },
      )
      newToken = data.datos.access_token as string
    } catch {
      isRefreshing = false
      clearQueue()
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (!newToken) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    isRefreshing = false
    useAuthStore.getState().updateToken(newToken)
    resolveQueue(newToken)
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return api(originalRequest)
  },
)

export default api
