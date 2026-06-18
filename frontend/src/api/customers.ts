import client from './client'
import type { Customer, PaginatedResponse } from '../types'

export interface CustomerPayload {
  name: string
  email: string
  phone?: string
  company?: string
  status?: 'active' | 'inactive' | 'lead'
  notes?: string
}

export const customersApi = {
  list: (page = 1, size = 20, search?: string) =>
    client.get<PaginatedResponse<Customer>>('/customers', {
      params: { page, size, search },
    }),

  get: (id: string) => client.get<Customer>(`/customers/${id}`),

  create: (data: CustomerPayload) => client.post<Customer>('/customers', data),

  update: (id: string, data: Partial<CustomerPayload>) =>
    client.patch<Customer>(`/customers/${id}`, data),

  delete: (id: string) => client.delete(`/customers/${id}`),
}
