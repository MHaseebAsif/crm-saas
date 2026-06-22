import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { customersApi } from '../api/customers'
import { employeesApi } from '../api/employees'
import { tasksApi } from '../api/tasks'
import { tenantsApi } from '../api/tenants'
import { Card, CardBody } from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

interface Stat {
  label: string
  value: string | number
  link: string
  color: string
}

export default function DashboardPage() {
  const { role, user } = useAuthStore()
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (role === 'super_admin') {
          const [t] = await Promise.all([tenantsApi.list(1, 1)])
          setStats([
            { label: 'Total Tenants', value: t.data.total, link: '/tenants', color: 'text-indigo-400' },
          ])
        } else if (role === 'company_admin') {
          const [c, e, t] = await Promise.all([
            customersApi.list(1, 1),
            employeesApi.list(1, 1),
            tasksApi.list(1, 1),
          ])
          setStats([
            { label: 'Customers', value: c.data.total, link: '/customers', color: 'text-emerald-400' },
            { label: 'Employees', value: e.data.total, link: '/employees', color: 'text-indigo-400' },
            { label: 'Tasks', value: t.data.total, link: '/tasks', color: 'text-amber-400' },
          ])
        } else {
          const [t] = await Promise.all([tasksApi.list(1, 1)])
          setStats([
            { label: 'My Tasks', value: t.data.total, link: '/tasks', color: 'text-indigo-400' },
          ])
        }
      } catch (_) {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [role])

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, <span className="text-slate-200 font-medium">{user?.full_name}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <Link key={s.label} to={s.link}>
              <Card className="hover:border-slate-600 transition-all duration-200 cursor-pointer group">
                <CardBody className="py-6">
                  <p className="text-sm text-slate-400 mb-2">{s.label}</p>
                  <p className={`text-4xl font-bold ${s.color} group-hover:scale-105 transition-transform origin-left`}>
                    {s.value}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-100">{user?.full_name}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 capitalize">
                {role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
