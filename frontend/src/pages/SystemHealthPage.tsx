import { useState, useEffect } from 'react'

export default function SystemHealthPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [cpu, setCpu] = useState('0')
  const [mem, setMem] = useState('0')
  const [upCount, setUpCount] = useState('0')

  useEffect(() => {
    let interval: any
    const fetchMetrics = () => {
      if (activeTab === 'Metrics') {
        fetch('http://localhost:9090/api/v1/query?query=' + encodeURIComponent('100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'))
          .then(r => r.json())
          .then(d => setCpu(parseFloat(d.data?.result?.[0]?.value?.[1] || 0).toFixed(1)))
          .catch(() => {})
        
        fetch('http://localhost:9090/api/v1/query?query=' + encodeURIComponent('(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'))
          .then(r => r.json())
          .then(d => setMem(parseFloat(d.data?.result?.[0]?.value?.[1] || 0).toFixed(1)))
          .catch(() => {})

        fetch('http://localhost:9090/api/v1/query?query=' + encodeURIComponent('count(up == 1)'))
          .then(r => r.json())
          .then(d => setUpCount(d.data?.result?.[0]?.value?.[1] || '0'))
          .catch(() => {})
      }
    }

    if (activeTab === 'Metrics') {
      fetchMetrics()
      interval = setInterval(fetchMetrics, 30000)
    }

    return () => clearInterval(interval)
  }, [activeTab])

  const services = [
    { name: 'auth-service', status: 'UP', port: 8001 },
    { name: 'crm-service', status: 'UP', port: 8003 },
    { name: 'notification-service', status: 'UP', port: 8004 },
    { name: 'frontend', status: 'UP', port: 3000 },
    { name: 'postgresql', status: 'UP', port: 5432 },
    { name: 'redis', status: 'UP', port: 6379 },
    { name: 'rabbitmq', status: 'UP', port: 5672 },
  ]

  const totalServices = services.length
  const upServices = services.filter((s) => s.status === 'UP').length
  const downServices = totalServices - upServices

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          System Health
        </h1>
      </div>

      <div className="flex space-x-1 rounded-lg bg-slate-800 p-1">
        {['Overview', 'Services', 'Metrics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="font-semibold leading-none tracking-tight text-sm text-slate-400">Total Services</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-slate-100">{totalServices}</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="font-semibold leading-none tracking-tight text-sm text-slate-400">Services Up</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-emerald-400">{upServices}</div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <h3 className="font-semibold leading-none tracking-tight text-sm text-slate-400">Services Down</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-rose-400">{downServices}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Services' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight text-lg">Services Status</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="rounded-md border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="p-3 text-left font-medium text-slate-300">Service Name</th>
                    <th className="p-3 text-left font-medium text-slate-300">Status</th>
                    <th className="p-3 text-left font-medium text-slate-300">Port</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.name} className="border-b border-slate-700 last:border-0">
                      <td className="p-3 font-medium text-slate-200">{service.name}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            service.status === 'UP'
                              ? 'bg-emerald-400/10 text-emerald-400'
                              : 'bg-rose-400/10 text-rose-400'
                          }`}
                        >
                          {service.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{service.port}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Metrics' && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-indigo-600 text-white shadow-sm p-6">
            <h3 className="font-semibold text-indigo-100 mb-2">CPU Usage</h3>
            <div className="text-3xl font-bold">{cpu}%</div>
          </div>
          <div className="rounded-lg bg-emerald-600 text-white shadow-sm p-6">
            <h3 className="font-semibold text-emerald-100 mb-2">Memory Used</h3>
            <div className="text-3xl font-bold">{mem}%</div>
          </div>
          <div className="rounded-lg bg-rose-600 text-white shadow-sm p-6">
            <h3 className="font-semibold text-rose-100 mb-2">Services UP Count</h3>
            <div className="text-3xl font-bold">{upCount}</div>
          </div>
        </div>
      )}
    </div>
  )
}
