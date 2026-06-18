import client from './client'
import type { Tenant, PaginatedResponse } from '../types'

export interface TenantPayload {
  name: string
  owner_email: string
  owner_password?: string
  owner_full_name?: string
}

export const tenantsApi = {
  list: (page = 1, size = 20, search?: string) =>
    client.get<PaginatedResponse<Tenant>>('/tenants', {
      params: { page, size, search },
    }),

  get: (id: string) => client.get<Tenant>(`/tenants/${id}`),

  create: (data: TenantPayload) => client.post<Tenant>('/tenants', data),

  update: (id: string, data: Partial<TenantPayload>) =>
    client.patch<Tenant>(`/tenants/${id}`, data),

  toggleActive: (id: string, active: boolean) =>
    client.patch(`/tenants/${id}`, { is_active: active }),

  delete: (id: string) => client.delete(`/tenants/${id}`),
}
