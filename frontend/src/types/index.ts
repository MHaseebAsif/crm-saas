export type Role = 'super_admin' | 'company_admin' | 'employee'

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  tenant_id: string | null
  is_active: boolean
  created_at: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  is_active: boolean
  owner_email: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  status: 'active' | 'inactive' | 'lead'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  name: string
  email: string
  role: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  tenant_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  assigned_to_name: string | null
  customer_id: string | null
  customer_name: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
}

export interface TokenResponse {
  tok: string
  ref: string
  token_type?: string
}

export interface LoginRequest {
  email: string
  pwd: string
}

export interface SignupRequest {
  email: string
  password: string
  full_name: string
  tenant_name?: string
}
