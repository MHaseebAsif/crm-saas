import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import { cn, initials } from '../../lib/utils'
import type { Role } from '../../types'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: Role[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['super_admin', 'company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Tenants',
    to: '/tenants',
    roles: ['super_admin'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Users',
    to: '/users',
    roles: ['super_admin'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    to: '/customers',
    roles: ['super_admin', 'company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Employees',
    to: '/employees',
    roles: ['super_admin', 'company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    to: '/tasks',
    roles: ['company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    to: '/notifications',
    roles: ['company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    label: 'System Health',
    to: '/system-health',
    roles: ['super_admin', 'company_admin', 'employee'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const sidebarStyle: React.CSSProperties = {
  background: 'rgba(10,8,30,0.7)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
}

const topbarStyle: React.CSSProperties = {
  background: 'rgba(10,8,30,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
}

export default function AppLayout() {
  const { user, role, logout } = useAuthStore()
  const nav = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const visible = navItems.filter((i) => role && i.roles.includes(role))

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (_) {
    } finally {
      logout()
      nav('/login')
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0',
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full',
          !mobileMenuOpen && collapsed ? 'md:w-16' : 'md:w-64'
        )}
        style={sidebarStyle}
      >
        <div
          className="flex items-center justify-between px-4 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {(!collapsed || mobileMenuOpen) && (
              <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: 17, letterSpacing: '-0.01em' }}>
                CRM SaaS
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex shrink-0 ml-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group', isActive ? '' : '')
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(99,102,241,0.18)',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#a5b4fc',
                boxShadow: '0 0 16px rgba(99,102,241,0.2)',
                borderLeft: '3px solid #6366f1',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                if (!el.classList.contains('active')) {
                  el.style.background = 'rgba(255,255,255,0.06)'
                  el.style.color = 'rgba(255,255,255,0.9)'
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                if (!el.classList.contains('active')) {
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {(!collapsed || mobileMenuOpen) && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm"
            style={{ color: '#fca5a5', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#fda4af' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fca5a5' }}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(!collapsed || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <header
          className="flex items-center justify-between px-6 py-3 shrink-0 sticky top-0 z-30"
          style={topbarStyle}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
              style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}></div>
          </div>
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen((o) => !o)}
              className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
              >
                {user ? initials(user.full_name) : 'U'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{user?.full_name}</span>
            </button>
            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
                  style={{
                    background: 'rgba(10,8,30,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => { setProfileMenuOpen(false); handleLogout() }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: '#fca5a5', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
