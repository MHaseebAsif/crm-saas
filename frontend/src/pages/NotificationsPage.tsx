import { useEffect, useState } from 'react'
import { notificationsApi } from '../api/notifications'
import type { Notification } from '../types'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { fmtDateTime } from '../lib/utils'
import { cn } from '../lib/utils'

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

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
          <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
          <p className="text-slate-400 mt-1">
            {unread > 0 ? <span className="text-indigo-400 font-medium">{unread} unread</span> : 'All caught up'} &middot; {total} total
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
            <ul className="divide-y divide-slate-800">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn('flex gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors', !n.is_read && 'bg-indigo-500/5')}
                >
                  <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', n.is_read ? 'bg-slate-600' : 'bg-indigo-500')} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', n.is_read ? 'text-slate-300' : 'text-slate-100')}>{n.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{fmtDateTime(n.created_at)}</p>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs px-2.5 py-1 rounded-full border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition-colors mt-0.5"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => del(n.id)}
                      className="text-xs px-2.5 py-1 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10 transition-colors mt-0.5"
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
          <span className="text-slate-400 text-sm py-1.5">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
