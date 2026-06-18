import client from './client'
import type { User, PaginatedResponse } from '../types'

export interface UpdateProfilePayload {
  full_name?: string
  current_password?: string
  new_password?: string
}

export const usersApi = {
  list: (page = 1, size = 20) =>
    client.get<PaginatedResponse<User>>('/users', { params: { page, size } }),

  get: (id: string) => client.get<User>(`/users/${id}`),

  updateProfile: (data: UpdateProfilePayload) =>
    client.patch<User>('/users/me', data),

  delete: (id: string) => client.delete(`/users/${id}`),
}
