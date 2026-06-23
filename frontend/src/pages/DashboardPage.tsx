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
  glow: string
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
    const res = await fetch(`${PROMETHEUS}/query?query=${encodeURIComponent(query)}`)
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
    const query = '100-(avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))*100)'
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

const gradientTitle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: 26,
  fontWeight: 800,
  lineHeight: 1.2,
}

function CountUp({ end, duration = 1000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    let rafId: number
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [end, duration])

  return <>{count}</>
}

export default function DashboardPage() {
  const { role, user, token } = useAuthStore()
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<HealthMetrics>({ cpu: null, memory: null, servicesUp: null })
  const [cpuHistory, setCpuHistory] = useState<CpuDataPoint[]>([])
  
  const [topStatsLoading, setTopStatsLoading] = useState(true)
  const [topStats, setTopStats] = useState({ customers: 0, employees: 0, tasks: 0, notifications: 0 })

  useEffect(() => {
    const loadTopStats = async () => {
      if (!token) return
      setTopStatsLoading(true)
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [cRes, eRes, tRes, nRes] = await Promise.all([
          fetch('http://localhost:8003/customers/?limit=1', { headers }),
          fetch('http://localhost:8003/employees/?limit=1', { headers }),
          fetch('http://localhost:8003/tasks/?limit=1', { headers }),
          fetch('http://localhost:8004/notifications/?is_read=false&limit=1', { headers }),
        ])
        
        const c = cRes.ok ? await cRes.json() : { total: 0 }
        const e = eRes.ok ? await eRes.json() : { total: 0 }
        const t = tRes.ok ? await tRes.json() : { total: 0 }
        const n = nRes.ok ? await nRes.json() : { total: 0 }

        setTopStats({
          customers: c.total || 0,
          employees: e.total || 0,
          tasks: t.total || 0,
          notifications: n.total || 0
        })
      } catch (err) {
        console.error(err)
      } finally {
        setTopStatsLoading(false)
      }
    }
    loadTopStats()
  }, [token])

  useEffect(() => {
    const load = async () => {
      try {
        if (role === 'super_admin') {
          const [t] = await Promise.all([tenantsApi.list(1, 1)])
          setStats([
            { label: 'Total Tenants', value: t.data.total, link: '/tenants', color: '#a5b4fc', glow: 'rgba(99,102,241,0.4)' },
          ])
        } else if (role === 'company_admin') {
          const [c, e, t] = await Promise.all([
            customersApi.list(1, 1),
            employeesApi.list(1, 1),
            tasksApi.list(1, 1),
          ])
          setStats([
            { label: 'Customers', value: c.data.total, link: '/customers', color: '#6ee7b7', glow: 'rgba(16,185,129,0.4)' },
            { label: 'Employees', value: e.data.total, link: '/employees', color: '#a5b4fc', glow: 'rgba(99,102,241,0.4)' },
            { label: 'Tasks', value: t.data.total, link: '/tasks', color: '#fcd34d', glow: 'rgba(245,158,11,0.4)' },
          ])
        } else {
          const [t] = await Promise.all([tasksApi.list(1, 1)])
          setStats([
            { label: 'My Tasks', value: t.data.total, link: '/tasks', color: '#a5b4fc', glow: 'rgba(99,102,241,0.4)' },
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
      color: health.cpu === null ? 'rgba(255,255,255,0.3)' : health.cpu > 80 ? '#fca5a5' : health.cpu > 60 ? '#fcd34d' : '#6ee7b7',
      glow: health.cpu !== null && health.cpu > 80 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
    },
    {
      label: 'Memory Usage',
      value: health.memory !== null ? `${fmt(health.memory)}%` : '—',
      color: health.memory === null ? 'rgba(255,255,255,0.3)' : health.memory > 80 ? '#fca5a5' : health.memory > 60 ? '#fcd34d' : '#6ee7b7',
      glow: health.memory !== null && health.memory > 80 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
    },
    {
      label: 'Services Up',
      value: health.servicesUp !== null ? health.servicesUp : '—',
      color: health.servicesUp === null ? 'rgba(255,255,255,0.3)' : '#6ee7b7',
      glow: 'rgba(16,185,129,0.3)',
    },
  ]

  const topCardsData = [
    {
      label: 'Total Customers',
      value: topStats.customers,
      color: '#60a5fa',
      glow: 'rgba(96,165,250,0.3)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: 'Total Employees',
      value: topStats.employees,
      color: '#4ade80',
      glow: 'rgba(74,222,128,0.3)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    },
    {
      label: 'Total Tasks',
      value: topStats.tasks,
      color: '#c084fc',
      glow: 'rgba(192,132,252,0.3)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      label: 'Unread Notifications',
      value: topStats.notifications,
      color: '#fb923c',
      glow: 'rgba(251,146,60,0.3)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 style={gradientTitle}>Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 14 }}>
          Welcome back, <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{user?.full_name}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} style={{ transition: 'all 0.25s ease' }}>
              <Link to={s.link}>
                <Card style={{ boxShadow: `0 0 20px ${s.glow}` }} className="cursor-pointer">
                  <CardBody className="py-6">
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</p>
                    <p style={{ fontSize: 40, fontWeight: 700, color: s.color, textShadow: `0 0 20px ${s.glow}`, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {topCardsData.map((c) => (
            <Card key={c.label} style={{ borderColor: c.glow, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 16px ${c.glow}` }}>
              <CardBody className="py-6 flex items-center gap-4">
                <div style={{ color: c.color, background: `rgba(255,255,255,0.05)`, padding: '12px', borderRadius: '12px' }}>
                  {c.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{c.label}</p>
                  {topStatsLoading ? (
                    <div style={{ width: 48, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6 }} className="animate-pulse" />
                  ) : (
                    <p style={{ fontSize: 32, fontWeight: 700, color: c.color, textShadow: `0 0 12px ${c.glow}`, lineHeight: 1 }}>
                      <CountUp end={c.value} />
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {healthCards.map((hc) => (
            <Card key={hc.label}>
              <CardBody className="py-6">
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{hc.label}</p>
                <p style={{ fontSize: 40, fontWeight: 700, color: hc.color, textShadow: `0 0 20px ${hc.glow}`, lineHeight: 1 }}>{hc.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>CPU Usage (last 1h)</p>
            {cpuHistory.length === 0 ? (
              <div className="flex items-center justify-center h-48" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                No data from Prometheus
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={cpuHistory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,8,30,0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#e2e8f0',
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'CPU']}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#818cf8', stroke: '#c7d2fe', strokeWidth: 2 }}
                    style={{ filter: 'drop-shadow(0 0 6px #818cf8)' }}
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
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#a5b4fc' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{user?.full_name}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
            </div>
            <div className="ml-auto">
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(99,102,241,0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.35)',
                  textTransform: 'capitalize',
                }}
              >
                {role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
