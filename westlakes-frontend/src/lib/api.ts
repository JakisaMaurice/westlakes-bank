import axios from "axios"
import { useAuthStore } from "@/stores/authStore"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

const authEndpointPaths = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/register/admin/",
  "/api/auth/token/refresh/",
]

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  const url = config.url ?? ""
  const isAuthEndpoint = authEndpointPaths.some((path) => url.includes(path))

  if (token && config.headers && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const { refreshToken, setAccessToken, clearSession } = useAuthStore.getState()

      if (!refreshToken) {
        clearSession()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const newAccessToken = response.data.access
        setAccessToken(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch {
        clearSession()
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
