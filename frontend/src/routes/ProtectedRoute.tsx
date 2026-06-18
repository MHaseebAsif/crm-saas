import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface Props {
  roles?: Role[]
  children?: React.ReactNode
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { token, role } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
