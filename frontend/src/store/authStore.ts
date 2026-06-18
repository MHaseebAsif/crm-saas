import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  tenantId: string | null
  role: Role | null
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      tenantId: null,
      role: null,
      setUser: (user) => set({ user, tenantId: user.tenant_id, role: user.role }),
      setTokens: (access, refresh) => set({ token: access, refreshToken: refresh }),
      logout: () => set({ user: null, token: null, refreshToken: null, tenantId: null, role: null }),
    }),
    { name: 'auth' },
  ),
)
