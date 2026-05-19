import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
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
  const token = localStorage.getItem("accessToken")
  const url = config.url ?? ""
  const isAuthEndpoint = authEndpointPaths.some((path) => url.includes(path))

  if (token && config.headers && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
