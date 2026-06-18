import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((cfg) => {
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
    const { refreshToken, token, logout, setTokens } = useAuthStore.getState()
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
      const res = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refreshToken })
      const { access_token, refresh_token } = res.data
      setTokens(access_token, refresh_token)
      queue.forEach((p) => p.resolve(access_token))
      queue = []
      orig.headers.Authorization = `Bearer ${access_token}`
      return client(orig)
    } catch (e) {
      queue.forEach((p) => p.reject(e))
      queue = []
      logout()
      return Promise.reject(e)
    } finally {
      refreshing = false
    }
    void token
  },
)

export default client
