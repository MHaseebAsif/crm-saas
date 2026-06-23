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

function useCountUp(target: number, duration = 1000) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)
  const prev = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const from = prev.current
    const diff = target - from
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(from + diff * ease)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return display
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  borderRadius: 16,
}

const tooltipStyle: React.CSSProperties = {
  background: 'rgba(15,12,41,0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 12,
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
}

const METRIC_COLORS: Record<string, { border: string; glow: string; text: string; accent: string }> = {
  cpu:     { border: 'rgba(59,130,246,0.5)',  glow: '0 0 24px rgba(59,130,246,0.4)',  text: '#93c5fd', accent: '#3b82f6' },
  mem:     { border: 'rgba(16,185,129,0.5)',  glow: '0 0 24px rgba(16,185,129,0.4)',  text: '#6ee7b7', accent: '#10b981' },
  svcup:   { border: 'rgba(16,185,129,0.5)',  glow: '0 0 24px rgba(16,185,129,0.4)',  text: '#6ee7b7', accent: '#10b981' },
  svcdown: { border: 'rgba(244,63,94,0.5)',   glow: '0 0 24px rgba(244,63,94,0.4)',   text: '#fca5a5', accent: '#f43f5e' },
}

interface MetricCardProps {
  label: string
  value: number
  decimals?: number
  unit?: string
  colorKey: string
  loading: boolean
}

function MetricCard({ label, value, decimals = 1, unit, colorKey, loading }: MetricCardProps) {
  const c = METRIC_COLORS[colorKey]
  const animated = useCountUp(loading ? 0 : value)
  const [hovered, setHovered] = useState(false)

  if (loading) {
    return (
      <div style={{ ...glassCard, padding: 24 }}>
        <div style={{ height: 12, width: 96, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 32, width: 72, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glassCard,
        padding: 24,
        border: hovered ? `1px solid ${c.border}` : '1px solid rgba(255,255,255,0.1)',
        boxShadow: hovered ? `${c.glow}, 0 8px 32px rgba(0,0,0,0.3)` : '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s ease, border 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{
        fontSize: 32,
        fontWeight: 700,
        color: c.text,
        textShadow: hovered ? `0 0 20px ${c.accent}` : 'none',
        transition: 'text-shadow 0.3s ease',
        animation: 'valuePulse 3s ease-in-out infinite',
        lineHeight: 1,
      }}>
        {animated.toFixed(decimals)}
        {unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>{unit}</span>}
      </p>
    </div>
  )
}

type Tab = 'Overview' | 'CPU' | 'Memory' | 'Network' | 'Services'
const TABS: Tab[] = ['Overview', 'CPU', 'Memory', 'Network', 'Services']

const TAB_GLOW: Record<string, string> = {
  Overview: 'rgba(139,92,246,0.6)',
  CPU:      'rgba(59,130,246,0.6)',
  Memory:   'rgba(16,185,129,0.6)',
  Network:  'rgba(168,85,247,0.6)',
  Services: 'rgba(245,158,11,0.6)',
}

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
      const d = await queryRange('100-(avg(rate(node_cpu_seconds_total{mode="idle"}[1m]))*100)')
      setCpuData(d)
    } catch (_) {}
    setLoadingCpu(false)
  }, [])

  const fetchMem = useCallback(async () => {
    setLoadingMem(true)
    try {
      const d = await queryRange('(1-(node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes))*100')
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
    timerRef.current = setInterval(() => { fetchAll() }, REFRESH_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchAll])

  const latestCpu = cpuData.length ? cpuData[cpuData.length - 1].value : 0
  const latestMem = memData.length ? memData[memData.length - 1].value : 0
  const latestRx = netData.length ? netData[netData.length - 1].rx : 0
  const latestTx = netData.length ? netData[netData.length - 1].tx : 0
  const upCount = services.filter((s) => s.value === 1).length
  const downCount = services.filter((s) => s.value === 0).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        @keyframes valuePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.85; }
        }

        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          50%       { box-shadow: 0 0 0 5px transparent; opacity: 0.7; }
        }

        @keyframes rowLift {
          from { transform: translateY(0); }
          to   { transform: translateY(-2px); }
        }

        .glass-page-wrapper {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e, #0f0c29, #1a1a3e);
          background-size: 400% 400%;
          animation: gradientShift 18s ease infinite;
          padding: 32px 24px;
          box-sizing: border-box;
        }

        .glass-chart-wrap {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          border-radius: 16px;
          padding: 24px;
        }

        .svc-row {
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .svc-row:hover {
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          border-radius: 8px;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 4px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }

        .tab-btn.inactive {
          background: transparent;
          color: rgba(255,255,255,0.4);
        }

        .tab-btn.inactive:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.75);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          border-radius: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .refresh-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
          box-shadow: 0 0 16px rgba(139,92,246,0.3);
          border-color: rgba(139,92,246,0.4);
        }

        .status-badge-up {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          color: #6ee7b7;
        }

        .status-badge-down {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(244,63,94,0.12);
          border: 1px solid rgba(244,63,94,0.3);
          color: #fca5a5;
        }

        .dot-up {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: statusPulse 2s ease-in-out infinite;
        }

        .dot-down {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f43f5e;
          box-shadow: 0 0 8px #f43f5e;
        }

        .gradient-title {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(139,92,246,0.4));
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
        }

        .chart-title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="glass-page-wrapper">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <h1 className="gradient-title">System Health</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
                Real-time infrastructure monitoring via Prometheus
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {lastUpdated && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button className="refresh-btn" onClick={fetchAll}>
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 4,
            padding: 6,
            marginBottom: 28,
            ...glassCard,
            borderRadius: 14,
          }}>
            {TABS.map((t) => {
              const active = tab === t
              return (
                <button
                  key={t}
                  id={`tab-${t.toLowerCase()}`}
                  onClick={() => setTab(t)}
                  className={`tab-btn ${active ? '' : 'inactive'}`}
                  style={active ? {
                    background: `rgba(255,255,255,0.1)`,
                    color: '#fff',
                    boxShadow: `0 0 16px ${TAB_GLOW[t]}, inset 0 0 12px rgba(255,255,255,0.05)`,
                    border: `1px solid ${TAB_GLOW[t]}`,
                    backdropFilter: 'blur(10px)',
                  } : {}}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {tab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <MetricCard label="CPU Usage" value={latestCpu} unit="%" colorKey="cpu" loading={loadingCpu} />
                <MetricCard label="Memory Usage" value={latestMem} unit="%" colorKey="mem" loading={loadingMem} />
                <MetricCard label="Services Up" value={upCount} decimals={0} colorKey="svcup" loading={loadingSvc} />
                <MetricCard label="Services Down" value={downCount} decimals={0} colorKey="svcdown" loading={loadingSvc} />
              </div>
              <div className="glass-chart-wrap">
                <p className="chart-title">CPU Usage — Last 1h</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuGradOv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'CPU']) as any} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cpuGradOv)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'CPU' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <MetricCard label="Current CPU" value={latestCpu} unit="%" colorKey="cpu" loading={loadingCpu} />
                <MetricCard label="Peak (1h)" value={cpuData.length ? Math.max(...cpuData.map((d) => d.value)) : 0} unit="%" colorKey="cpu" loading={loadingCpu} />
              </div>
              <div className="glass-chart-wrap">
                <p className="chart-title">CPU Usage — Last 1h (30s refresh)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuGradFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'CPU']) as any} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cpuGradFull)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'Memory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <MetricCard label="Current Memory" value={latestMem} unit="%" colorKey="mem" loading={loadingMem} />
                <MetricCard label="Peak (1h)" value={memData.length ? Math.max(...memData.map((d) => d.value)) : 0} unit="%" colorKey="mem" loading={loadingMem} />
              </div>
              <div className="glass-chart-wrap">
                <p className="chart-title">Memory Usage — Last 1h</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={memData}>
                    <defs>
                      <linearGradient id="memGradFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => [`${Number(v).toFixed(1)}%`, 'Memory']) as any} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#memGradFull)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#6ee7b7', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 8px #10b981)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'Network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <MetricCard label="Current RX" value={latestRx} decimals={2} unit="KB/s" colorKey="mem" loading={loadingNet} />
                <MetricCard label="Current TX" value={latestTx} decimals={2} unit="KB/s" colorKey="cpu" loading={loadingNet} />
              </div>
              <div className="glass-chart-wrap">
                <p className="chart-title">Network Throughput — Last 1h</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={netData}>
                    <defs>
                      <linearGradient id="rxGradFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="txGradFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} unit=" KB/s" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown, name: unknown) => [`${Number(v).toFixed(2)} KB/s`, name === 'rx' ? 'Receive' : 'Transmit']) as any} />
                    <Legend formatter={(v) => (v === 'rx' ? 'Receive' : 'Transmit')} wrapperStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="rx" stroke="#a855f7" strokeWidth={2.5} fill="url(#rxGradFull)" dot={false} activeDot={{ r: 4, fill: '#a855f7', stroke: '#d8b4fe', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }} />
                    <Area type="monotone" dataKey="tx" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#txGradFull)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 8px #8b5cf6)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'Services' && (
            <div style={{ ...glassCard, overflow: 'hidden' }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>Service Status</h3>
                {!loadingSvc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6ee7b7' }}>
                      <span className="dot-up" />
                      {upCount} up
                    </span>
                    {downCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5' }}>
                        <span className="dot-down" />
                        {downCount} down
                      </span>
                    )}
                  </div>
                )}
              </div>

              {loadingSvc ? (
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div style={{ padding: '64px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No service data returned from Prometheus.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Service', 'Instance', 'Status', 'Indicator'].map((h) => (
                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((svc, i) => (
                      <tr key={i} className="svc-row">
                        <td style={{ padding: '14px 24px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{svc.job || svc.name}</td>
                        <td style={{ padding: '14px 24px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11 }}>{svc.instance}</td>
                        <td style={{ padding: '14px 24px' }}>
                          {svc.value === 1 ? (
                            <span className="status-badge-up">
                              <span className="dot-up" />
                              UP
                            </span>
                          ) : (
                            <span className="status-badge-down">
                              <span className="dot-down" />
                              DOWN
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ width: 80, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              borderRadius: 999,
                              width: svc.value === 1 ? '100%' : '20%',
                              background: svc.value === 1
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                              boxShadow: svc.value === 1 ? '0 0 8px #10b981' : '0 0 8px #f43f5e',
                              transition: 'width 0.6s ease',
                            }} />
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
      </div>
    </>
  )
}
