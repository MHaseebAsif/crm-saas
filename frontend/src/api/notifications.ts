import client from './client'
import { useAuthStore } from '../store/authStore'
import type { Notification, PaginatedResponse } from '../types'

type RawNotif = {
  id: string
  tenant_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  recipient: string
  content: string
  created_at: string | null
}

function mapNotif(raw: RawNotif): Notification {
  return {
    id: raw.id,
    user_id: raw.recipient,
    title: raw.title || raw.content,
    message: raw.message || raw.content,
    is_read: raw.is_read,
    created_at: raw.created_at ?? new Date().toISOString(),
  }
}

function tenantHeader() {
  return { 'X-Tenant-Id': useAuthStore.getState().tenantId || '' }
}

export const notificationsApi = {
  list: async (page = 1, size = 20): Promise<{ data: PaginatedResponse<Notification> }> => {
    const res = await client.get<{ items: RawNotif[]; total: number; page: number; size: number; pages: number }>(
      '/notifications',
      { params: { page, size }, headers: tenantHeader() }
    )
    return {
      data: {
        ...res.data,
        items: res.data.items.map(mapNotif),
      },
    }
  },

  markRead: (id: string) =>
    client.patch(`/notifications/${id}/read`, null, { headers: tenantHeader() }),

  markAllRead: () =>
    client.post('/notifications/read-all', null, { headers: tenantHeader() }),

  delete: (id: string) =>
    client.delete(`/notifications/${id}`, { headers: tenantHeader() }),
}
