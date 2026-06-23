import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationsApi } from '../api/notifications'
import { useAuthStore } from '../store/authStore'
import type { Notification } from '../types'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { fmtDateTime } from '../lib/utils'
import { cn } from '../lib/utils'

const WS_BASE = import.meta.env.VITE_NOTIFICATION_WS_URL || 'ws://localhost:8004'

const gradientTitle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: 26,
  fontWeight: 800,
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const tenantId = useAuthStore((s) => s.tenantId)

  const load = async (p = page) => {
    setLoading(true)
    try {
      const { data } = await notificationsApi.list(p, 20)
      setItems(data.items)
      setTotal(data.total)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  useEffect(() => {
    if (!tenantId) return
    let retryCount = 0
    let timeout: ReturnType<typeof setTimeout>

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_BASE}/notifications/ws/${tenantId}`)
        wsRef.current = ws

        ws.onopen = () => {
          retryCount = 0
        }

        ws.onmessage = (evt) => {
          try {
            const raw = JSON.parse(evt.data) as {
              id: string; type: string; title: string; message: string; is_read: boolean; created_at: string | null
            }
            const notif: Notification = {
              id: raw.id,
              user_id: tenantId,
              title: raw.title || raw.type,
              message: raw.message,
              is_read: false,
              created_at: raw.created_at ?? new Date().toISOString(),
            }
            setItems((prev) => [notif, ...prev])
            setTotal((t) => t + 1)
            toast.custom(
              (t) => (
                <div
                  className={cn('flex gap-3 items-start max-w-sm', t.visible ? 'animate-enter' : 'animate-leave')}
                  style={{
                    background: 'rgba(10,8,30,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', marginTop: 4, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.title}</p>
                    {notif.message && notif.message !== notif.title && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{notif.message}</p>}
                  </div>
                </div>
              ),
              { duration: 4000 }
            )
          } catch (_) {}
        }
        ws.onerror = () => {}
        ws.onclose = () => {
          if (retryCount < 3) {
            retryCount++
            timeout = setTimeout(connect, 5000)
          }
        }
      } catch (_) {}
    }

    connect()

    return () => {
      clearTimeout(timeout)
      if (wsRef.current) wsRef.current.close()
    }
  }, [tenantId])

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (_) {}
  }

  const markAll = async () => {
    setMarking(true)
    try {
      await notificationsApi.markAllRead()
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (_) {
    } finally {
      setMarking(false)
    }
  }

  const del = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setItems((prev) => prev.filter((n) => n.id !== id))
      setTotal((t) => t - 1)
    } catch (_) {}
  }

  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 style={gradientTitle}>Notifications</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 13 }}>
            {unread > 0 ? <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{unread} unread</span> : 'All caught up'} &middot; {total} total
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAll} loading={marking} className="w-full sm:w-auto">
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : items.length === 0 ? (
            <EmptyState title="No notifications" description="You are all caught up" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Message', 'Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 24px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((n) => (
                    <tr
                      key={n.id}
                      style={{ transition: 'all 0.2s ease', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                        <p style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 600, color: n.is_read ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)' }}>{n.title}</p>
                        {n.message && n.message !== n.title && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.message}</p>}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                        {fmtDateTime(n.created_at)}
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                        <Badge variant={n.is_read ? 'success' : 'warning'}>{n.is_read ? 'Read' : 'Unread'}</Badge>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          {!n.is_read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="inline-flex items-center justify-center transition-all"
                              style={{
                                padding: '4px 12px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#a5b4fc',
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: 999,
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)' }}
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => del(n.id)}
                            className="inline-flex items-center justify-center transition-all"
                            style={{
                              width: 32,
                              height: 32,
                              color: '#fca5a5',
                              background: 'rgba(244,63,94,0.15)',
                              border: '1px solid rgba(244,63,94,0.3)',
                              borderRadius: 999,
                              cursor: 'pointer',
                              boxShadow: '0 0 10px rgba(244,63,94,0.1)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.25)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)' }}
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {total > 20 && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '6px 0' }}>Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
