import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { customersApi } from '../api/customers'
import { employeesApi } from '../api/employees'
import { tasksApi } from '../api/tasks'
import { tenantsApi } from '../api/tenants'
import { Card, CardBody } from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stat {
  label: string
  value: string | number
  link: string
  color: string
}

interface HealthMetrics {
  cpu: number | null
  memory: number | null
  servicesUp: number | null
}

interface CpuDataPoint {
  time: string
  cpu: number
}

const PROMETHEUS = 'http://localhost:9090/api/v1'

async function fetchScalar(query: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${PROMETHEUS}/query?query=${encodeURIComponent(query)}`
    )
    const json = await res.json()
    const raw = json?.data?.result?.[0]?.value?.[1]
    const val = parseFloat(raw)
    return isNaN(val) ? null : val
  } catch {
    return null
  }
}

async function fetchCpuHistory(): Promise<CpuDataPoint[]> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const start = now - 3600
    const query =
      '100-(avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))*100)'
    const url =
      `${PROMETHEUS}/query_range` +
      `?query=${encodeURIComponent(query)}` +
      `&start=${start}&end=${now}&step=60`
    const res = await fetch(url)
    const json = await res.json()
    const values: [number, string][] = json?.data?.result?.[0]?.values ?? []
    return values.map(([ts, val]) => {
      const d = new Date(ts * 1000)
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return { time: `${hh}:${mm}`, cpu: parseFloat(parseFloat(val).toFixed(1)) }
    })
  } catch {
    return []
  }
}

function fmt(val: number | null, decimals = 1): string {
  if (val === null) return '—'
  return val.toFixed(decimals)
}

export default function DashboardPage() {
  const { role, user } = useAuthStore()
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<HealthMetrics>({
    cpu: null,
    memory: null,
    servicesUp: null,
  })
  const [cpuHistory, setCpuHistory] = useState<CpuDataPoint[]>([])

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

  const fetchHealth = useCallback(async () => {
    const [cpu, memory, servicesRaw, history] = await Promise.all([
      fetchScalar('100-(avg(rate(node_cpu_seconds_total{mode="idle"}[1m]))*100)'),
      fetchScalar('(1-(node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes))*100'),
      fetch(`${PROMETHEUS}/query?query=${encodeURIComponent('up')}`)
        .then((r) => r.json())
        .then((j) => {
          const results: { value: [number, string] }[] = j?.data?.result ?? []
          return results.filter((r) => r.value[1] === '1').length
        })
        .catch(() => null),
      fetchCpuHistory(),
    ])
    setHealth({ cpu, memory, servicesUp: servicesRaw as number | null })
    setCpuHistory(history)
  }, [])

  useEffect(() => {
    fetchHealth()
    const id = setInterval(fetchHealth, 30000)
    return () => clearInterval(id)
  }, [fetchHealth])

  const healthCards = [
    {
      label: 'CPU Usage',
      value: health.cpu !== null ? `${fmt(health.cpu)}%` : '—',
      color:
        health.cpu === null
          ? 'text-slate-400'
          : health.cpu > 80
          ? 'text-red-400'
          : health.cpu > 60
          ? 'text-amber-400'
          : 'text-emerald-400',
    },
    {
      label: 'Memory Usage',
      value: health.memory !== null ? `${fmt(health.memory)}%` : '—',
      color:
        health.memory === null
          ? 'text-slate-400'
          : health.memory > 80
          ? 'text-red-400'
          : health.memory > 60
          ? 'text-amber-400'
          : 'text-emerald-400',
    },
    {
      label: 'Services Up',
      value: health.servicesUp !== null ? health.servicesUp : '—',
      color: health.servicesUp === null ? 'text-slate-400' : 'text-emerald-400',
    },
  ]

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

      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {healthCards.map((hc) => (
            <Card key={hc.label}>
              <CardBody className="py-6">
                <p className="text-sm text-slate-400 mb-2">{hc.label}</p>
                <p className={`text-4xl font-bold ${hc.color}`}>{hc.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-300 mb-4">CPU Usage (last 1h)</p>
            {cpuHistory.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data from Prometheus
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={cpuHistory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#e2e8f0',
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value}%`, 'CPU']}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#818cf8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

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
