import client from './client'
import type { Employee, PaginatedResponse } from '../types'

export interface EmployeePayload {
  name: string
  email: string
  role: string
}

export const employeesApi = {
  list: (page = 1, size = 20, search?: string) =>
    client.get<PaginatedResponse<Employee>>('/employees', {
      params: { page, size, search },
    }),

  get: (id: string) => client.get<Employee>(`/employees/${id}`),

  create: (data: EmployeePayload) => client.post<Employee>('/employees', data),

  update: (id: string, data: Partial<EmployeePayload>) =>
    client.patch<Employee>(`/employees/${id}`, data),

  delete: (id: string) => client.delete(`/employees/${id}`),
}

export const getEmployees = () =>
  client.get<PaginatedResponse<Employee>>('/employees', { params: { page: 1, size: 100 } })
