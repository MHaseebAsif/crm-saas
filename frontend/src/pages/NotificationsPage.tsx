import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationsApi } from '../api/notifications'
import { useAuthStore } from '../store/authStore'
import type { Notification } from '../types'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
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
    const ws = new WebSocket(`${WS_BASE}/notifications/ws/${tenantId}`)
    wsRef.current = ws
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
                {notif.message && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{notif.message}</p>}
              </div>
            </div>
          ),
          { duration: 4000 }
        )
      } catch (_) {}
    }
    ws.onerror = () => {}
    return () => { ws.close() }
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
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6 max-w-3xl mx-auto md:mx-0">
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
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((n) => (
                <li
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent' }}
                >
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: 5,
                      background: n.is_read ? 'rgba(255,255,255,0.15)' : '#6366f1',
                      boxShadow: n.is_read ? 'none' : '0 0 8px rgba(99,102,241,0.7)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: n.is_read ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)' }}>{n.title}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{fmtDateTime(n.created_at)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        style={{
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: '1px solid rgba(99,102,241,0.5)',
                          color: '#a5b4fc',
                          background: 'transparent',
                          cursor: 'pointer',
                          marginTop: 2,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => del(n.id)}
                      style={{
                        fontSize: 11,
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(244,63,94,0.4)',
                        color: '#fca5a5',
                        background: 'transparent',
                        cursor: 'pointer',
                        marginTop: 2,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
