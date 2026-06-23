import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const PROM = 'http://localhost:9090/api/v1'
const REFRESH_MS = 30_000
const RANGE_S = 3600
const STEP = 60

type DataPoint = { time: string; value: number }
type DualPoint = { time: string; rx: number; tx: number }
type ServiceRow = { name: string; instance: string; job: string; value: number }

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function queryRange(expr: string): Promise<DataPoint[]> {
  const end = nowSec()
  const start = end - RANGE_S
  const url =
    `${PROM}/query_range?query=${encodeURIComponent(expr)}&start=${start}&end=${end}&step=${STEP}`
  const r = await fetch(url)
  const j = await r.json()
  const result = j?.data?.result ?? []
  if (!result.length) return []
  return (result[0].values as [number, string][]).map(([t, v]) => ({
    time: fmtTime(t),
    value: parseFloat(parseFloat(v).toFixed(2)),
  }))
}

async function queryNetworkRange(): Promise<DualPoint[]> {
  const end = nowSec()
  const start = end - RANGE_S
  const params = `&start=${start}&end=${end}&step=${STEP}`
  const rxExpr = encodeURIComponent('rate(node_network_receive_bytes_total[1m])')
  const txExpr = encodeURIComponent('rate(node_network_transmit_bytes_total[1m])')
  const [rxRes, txRes] = await Promise.all([
    fetch(`${PROM}/query_range?query=${rxExpr}${params}`).then((r) => r.json()),
    fetch(`${PROM}/query_range?query=${txExpr}${params}`).then((r) => r.json()),
  ])
  const rxVals: [number, string][] = rxRes?.data?.result?.[0]?.values ?? []
  const txMap: Map<number, number> = new Map(
    (txRes?.data?.result?.[0]?.values ?? []).map(([t, v]: [number, string]) => [t, parseFloat(v)])
  )
  return rxVals.map(([t, v]) => ({
    time: fmtTime(t),
    rx: parseFloat((parseFloat(v) / 1024).toFixed(2)),
    tx: parseFloat(((txMap.get(t) ?? 0) / 1024).toFixed(2)),
  }))
}

async function queryServices(): Promise<ServiceRow[]> {
  const url = `${PROM}/query?query=${encodeURIComponent('up')}`
  const r = await fetch(url)
  const j = await r.json()
  const result = j?.data?.result ?? []
  return result.map((item: { metric: Record<string, string>; value: [number, string] }) => ({
    name: item.metric.job ?? item.metric.__name__ ?? 'unknown',
    instance: item.metric.instance ?? '',
    job: item.metric.job ?? '',
    value: parseInt(item.value[1], 10),
  }))
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-28 bg-slate-700 rounded mb-3" />
      <div className="h-8 w-20 bg-slate-700 rounded" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-40 bg-slate-700 rounded mb-6" />
      <div className="h-56 bg-slate-700 rounded" />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  borderColor: string
  valueColor: string
  loading: boolean
}

function StatCard({ label, value, unit, borderColor, valueColor, loading }: StatCardProps) {
  if (loading) return <SkeletonCard />
  return (
    <div className={`bg-slate-800 border-l-4 ${borderColor} border-t border-r border-b border-slate-700 rounded-xl p-6`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${valueColor}`}>
        {value}
        {unit && <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 12,
}

type Tab = 'Overview' | 'CPU' | 'Memory' | 'Network' | 'Services'
const TABS: Tab[] = ['Overview', 'CPU', 'Memory', 'Network', 'Services']

export default function SystemHealthPage() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [cpuData, setCpuData] = useState<DataPoint[]>([])
  const [memData, setMemData] = useState<DataPoint[]>([])
  const [netData, setNetData] = useState<DualPoint[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loadingCpu, setLoadingCpu] = useState(true)
  const [loadingMem, setLoadingMem] = useState(true)
  const [loadingNet, setLoadingNet] = useState(true)
  const [loadingSvc, setLoadingSvc] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCpu = useCallback(async () => {
    setLoadingCpu(true)
    try {
      const d = await queryRange(
        '100-(avg(rate(node_cpu_seconds_total{mode="idle"}[1m]))*100)'
      )
      setCpuData(d)
    } catch (_) {}
    setLoadingCpu(false)
  }, [])

  const fetchMem = useCallback(async () => {
    setLoadingMem(true)
    try {
      const d = await queryRange(
        '(1-(node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes))*100'
      )
      setMemData(d)
    } catch (_) {}
    setLoadingMem(false)
  }, [])

  const fetchNet = useCallback(async () => {
    setLoadingNet(true)
    try {
      const d = await queryNetworkRange()
      setNetData(d)
    } catch (_) {}
    setLoadingNet(false)
  }, [])

  const fetchSvc = useCallback(async () => {
    setLoadingSvc(true)
    try {
      const d = await queryServices()
      setServices(d)
    } catch (_) {}
    setLoadingSvc(false)
  }, [])

  const fetchAll = useCallback(() => {
    fetchCpu()
    fetchMem()
    fetchNet()
    fetchSvc()
    setLastUpdated(new Date())
  }, [fetchCpu, fetchMem, fetchNet, fetchSvc])

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(() => {
      fetchAll()
    }, REFRESH_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchAll])

  const latestCpu = cpuData.length ? cpuData[cpuData.length - 1].value : 0
  const latestMem = memData.length ? memData[memData.length - 1].value : 0
  const latestRx = netData.length ? netData[netData.length - 1].rx : 0
  const latestTx = netData.length ? netData[netData.length - 1].tx : 0
  const upCount = services.filter((s) => s.value === 1).length
  const downCount = services.filter((s) => s.value === 0).length

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">System Health</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time infrastructure monitoring via Prometheus
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t}
            id={`tab-${t.toLowerCase()}`}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              tab === t
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="CPU Usage" value={latestCpu.toFixed(1)} unit="%" borderColor="border-blue-500" valueColor="text-blue-400" loading={loadingCpu} />
            <StatCard label="Memory Usage" value={latestMem.toFixed(1)} unit="%" borderColor="border-emerald-500" valueColor="text-emerald-400" loading={loadingMem} />
            <StatCard label="Services Up" value={upCount} borderColor="border-emerald-500" valueColor="text-emerald-400" loading={loadingSvc} />
            <StatCard label="Services Down" value={downCount} borderColor="border-rose-500" valueColor="text-rose-400" loading={loadingSvc} />
          </div>

          {loadingCpu ? (
            <SkeletonChart />
          ) : (
            <div className="bg-slate-800 border border-blue-500/20 rounded-xl p-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">CPU Usage — Last 1h</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'CPU']) as any} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'CPU' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="Current CPU" value={latestCpu.toFixed(1)} unit="%" borderColor="border-blue-500" valueColor="text-blue-400" loading={loadingCpu} />
            <StatCard label="Peak (1h)" value={cpuData.length ? Math.max(...cpuData.map((d) => d.value)).toFixed(1) : '—'} unit="%" borderColor="border-blue-400" valueColor="text-blue-300" loading={loadingCpu} />
          </div>
          {loadingCpu ? (
            <SkeletonChart />
          ) : (
            <div className="bg-slate-800 border border-blue-500/20 rounded-xl p-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">CPU Usage — Last 1h (10s refresh)</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="cpuGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'CPU']) as any} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cpuGrad2)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'Memory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="Current Memory" value={latestMem.toFixed(1)} unit="%" borderColor="border-emerald-500" valueColor="text-emerald-400" loading={loadingMem} />
            <StatCard label="Peak (1h)" value={memData.length ? Math.max(...memData.map((d) => d.value)).toFixed(1) : '—'} unit="%" borderColor="border-emerald-400" valueColor="text-emerald-300" loading={loadingMem} />
          </div>
          {loadingMem ? (
            <SkeletonChart />
          ) : (
            <div className="bg-slate-800 border border-emerald-500/20 rounded-xl p-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">Memory Usage — Last 1h</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={memData}>
                  <defs>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'Memory']) as any} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#memGrad)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'Network' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Current RX" value={latestRx.toFixed(2)} unit="KB/s" borderColor="border-purple-500" valueColor="text-purple-400" loading={loadingNet} />
            <StatCard label="Current TX" value={latestTx.toFixed(2)} unit="KB/s" borderColor="border-violet-500" valueColor="text-violet-400" loading={loadingNet} />
          </div>
          {loadingNet ? (
            <SkeletonChart />
          ) : (
            <div className="bg-slate-800 border border-purple-500/20 rounded-xl p-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">Network Throughput — Last 1h</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={netData}>
                  <defs>
                    <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit=" KB/s" />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown, name: unknown) => [`${Number(v).toFixed(2)} KB/s`, name === 'rx' ? 'Receive' : 'Transmit']) as any} />
                  <Legend formatter={(v) => (v === 'rx' ? 'Receive' : 'Transmit')} wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Area type="monotone" dataKey="rx" stroke="#a855f7" strokeWidth={2} fill="url(#rxGrad)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="tx" stroke="#8b5cf6" strokeWidth={2} fill="url(#txGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'Services' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">Service Status</h3>
            {!loadingSvc && (
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {upCount} up
                </span>
                {downCount > 0 && (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                    {downCount} down
                  </span>
                )}
              </div>
            )}
          </div>

          {loadingSvc ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">
              No service data returned from Prometheus.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Instance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {services.map((svc, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{svc.job || svc.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{svc.instance}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          svc.value === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${svc.value === 1 ? 'bg-emerald-400' : 'bg-rose-400'} ${svc.value === 1 ? 'animate-pulse' : ''}`}
                        />
                        {svc.value === 1 ? 'UP' : 'DOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${svc.value === 1 ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-1/4'}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
