import client from './client'
import { useAuthStore } from '../store/authStore'
import type { Notification, PaginatedResponse } from '../types'

export const notificationsApi = {
  list: (page = 1, size = 20) =>
    client.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, size },
      headers: {
        'X-Tenant-Id': useAuthStore.getState().tenantId || '',
      },
    }),

  markRead: (id: string) =>
    client.patch<Notification>(`/notifications/${id}/read`),

  markAllRead: () => client.post('/notifications/read-all'),

  delete: (id: string) => client.delete(`/notifications/${id}`),
}
