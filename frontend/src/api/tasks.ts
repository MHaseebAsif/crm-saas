import client from './client'
import type { Task, PaginatedResponse, TaskStatus, TaskPriority } from '../types'

export interface TaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: string
  customer_id?: string
  due_date?: string
}

export const tasksApi = {
  list: (page = 1, size = 20, status?: TaskStatus) =>
    client.get<PaginatedResponse<Task>>('/tasks', {
      params: { page, size, status },
    }),

  get: (id: string) => client.get<Task>(`/tasks/${id}`),

  create: (data: TaskPayload) => client.post<Task>('/tasks', data),

  update: (id: string, data: Partial<TaskPayload>) =>
    client.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) => client.delete(`/tasks/${id}`),
}
