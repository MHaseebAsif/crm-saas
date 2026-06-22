import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AuthLayout() {
  const { token } = useAuthStore()
  if (token) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">CRM SaaS</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Manage your business relationships smarter
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Multi-tenant CRM platform with role-based access, customer management, task tracking and team collaboration.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {['Customer Tracking', 'Team Management', 'Task Workflows', 'Real-time Alerts'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} CRM SaaS. All rights reserved.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
