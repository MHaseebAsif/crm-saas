import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AuthLayout() {
  const { token } = useAuthStore()
  if (token) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{
          background: 'rgba(10,8,30,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -120, left: -120, width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>CRM SaaS</span>
        </div>
        <div className="relative space-y-6">
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Manage your business relationships smarter
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7 }}>
            Multi-tenant CRM platform with role-based access, customer management, task tracking and team collaboration.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {['Customer Tracking', 'Team Management', 'Task Workflows', 'Real-time Alerts'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#a5b4fc' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} CRM SaaS. All rights reserved.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className="w-full max-w-md mx-auto rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
