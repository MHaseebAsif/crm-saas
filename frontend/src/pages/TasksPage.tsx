import { useEffect, useState } from 'react'
import { tasksApi, type TaskPayload } from '../api/tasks'
import { getEmployees } from '../api/employees'
import type { Task, TaskStatus, TaskPriority } from '../types'
import { Card } from '../components/ui/Card'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const priorityVariant: Record<TaskPriority, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
}

const gradientTitle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: 26,
  fontWeight: 800,
}

const glassSelect: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)',
  fontSize: 13,
  outline: 'none',
}

const statusSelectInline: React.CSSProperties = {
  fontSize: 11,
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.8)',
  borderRadius: 8,
  padding: '4px 8px',
  outline: 'none',
  cursor: 'pointer',
}

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<TaskStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<TaskPayload>({ title: '', priority: 'medium' })
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([])

  const load = async (p = page, s = filter) => {
    setLoading(true)
    try {
      const { data } = await tasksApi.list(p, 20, s || undefined)
      setItems(data.items)
      setTotal(data.total)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, filter])

  useEffect(() => {
    getEmployees()
      .then((res) => setEmployees((res.data.items || []).map(e => ({ id: e.id, name: e.name }))))
      .catch(() => setEmployees([]))
  }, [])

  const set = (k: keyof TaskPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const payload: Partial<TaskPayload> = {}
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          payload[k as keyof TaskPayload] = v as any
        }
      })
      await tasksApi.create(payload as TaskPayload)
      setOpen(false)
      setForm({ title: '', priority: 'medium' })
      toast.success('Task created')
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, status: TaskStatus) => {
    try {
      await tasksApi.update(id, { status })
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
      toast.success('Status updated')
    } catch (_) {
      toast.error('Failed to update status')
    }
  }

  const del = async (id: string) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await tasksApi.delete(id)
      toast.success('Task deleted')
      load()
    } catch (_) {
      toast.error('Failed to delete task')
    }
  }

  const statuses: { v: TaskStatus | ''; l: string }[] = [
    { v: '', l: 'All' },
    { v: 'pending', l: 'Pending' },
    { v: 'in_progress', l: 'In Progress' },
    { v: 'completed', l: 'Completed' },
  ]

  const rowHover = (e: React.MouseEvent<HTMLTableRowElement>, enter: boolean) => {
    const el = e.currentTarget
    el.style.background = enter ? 'rgba(255,255,255,0.04)' : 'transparent'
    el.style.transform = enter ? 'translateY(-1px)' : 'translateY(0)'
    el.style.boxShadow = enter ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
  }

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 style={gradientTitle}>Tasks</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 13 }}>{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">New Task</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto flex-nowrap whitespace-nowrap pb-2">
        {statuses.map((s) => (
          <button
            key={s.v}
            onClick={() => { setPage(1); setFilter(s.v) }}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: filter === s.v ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(255,255,255,0.06)',
              border: filter === s.v ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: filter === s.v ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: filter === s.v ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            {s.l}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Create a new task to get started"
            action={<Button onClick={() => setOpen(true)}>New Task</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Title', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={i === 1 || i === 3 ? 'hidden md:table-cell' : i === 4 ? 'hidden lg:table-cell' : ''}
                      style={{ textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 24px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    style={{ transition: 'all 0.2s ease', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => rowHover(e, true)}
                    onMouseLeave={(e) => rowHover(e, false)}
                  >
                    <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{t.title}</p>
                      {t.description && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{t.description}</p>}
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 24px', textAlign: 'left' }}>
                      <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                        style={statusSelectInline}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>{t.assigned_to ? (employees.find(e => e.id === t.assigned_to)?.name || t.assigned_to) : '-'}</td>
                    <td className="hidden lg:table-cell" style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => del(t.id)}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(244,63,94,0.25)'
                          e.currentTarget.style.boxShadow = '0 0 14px rgba(244,63,94,0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(244,63,94,0.15)'
                          e.currentTarget.style.boxShadow = '0 0 10px rgba(244,63,94,0.1)'
                        }}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {total > 20 && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '6px 0' }}>Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="t-title" label="Title" value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Assigned To</label>
            <select id="t-assign" value={form.assigned_to || ''} onChange={set('assigned_to')} style={glassSelect}>
              <option value="">Unassigned</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Description</label>
            <textarea
              id="t-desc"
              value={form.description || ''}
              onChange={set('description')}
              rows={3}
              style={{ ...glassSelect, resize: 'none', lineHeight: 1.6 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Priority</label>
              <select id="t-priority" value={form.priority || 'medium'} onChange={set('priority')} style={glassSelect}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input id="t-due" label="Due Date" type="date" value={form.due_date || ''} onChange={set('due_date')} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
