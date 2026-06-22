/// <reference types="vite/client" />
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const client = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((cfg) => {
  const url = cfg.url || ''
  if (url.startsWith('/auth')) {
    cfg.baseURL = import.meta.env.VITE_AUTH_URL
  } else if (url.startsWith('/users')) {
    cfg.baseURL = import.meta.env.VITE_USER_URL
  } else if (url.startsWith('/notifications')) {
    cfg.baseURL = import.meta.env.VITE_NOTIFICATION_URL
  } else if (
    url.startsWith('/customers') ||
    url.startsWith('/tenants') ||
    url.startsWith('/tasks') ||
    url.startsWith('/employees')
  ) {
    cfg.baseURL = import.meta.env.VITE_CRM_URL
  }

  const token = useAuthStore.getState().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

let refreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config
    if (err.response?.status !== 401 || orig._retry) {
      return Promise.reject(err)
    }
    orig._retry = true
    const { refreshToken, logout, setTokens } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      return Promise.reject(err)
    }
    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((t) => {
        orig.headers.Authorization = `Bearer ${t}`
        return client(orig)
      })
    }
    refreshing = true
    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || ''
      const res = await axios.post(`${authUrl}/auth/refresh`, { refresh_token: refreshToken })
      const { tok, ref } = res.data
      setTokens(tok, ref)
      queue.forEach((p) => p.resolve(tok))
      queue = []
      orig.headers.Authorization = `Bearer ${tok}`
      return client(orig)
    } catch (e) {
      queue.forEach((p) => p.reject(e))
      queue = []
      logout()
      return Promise.reject(e)
    } finally {
      refreshing = false
    }
  },
)

export default client
