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

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tasks</h1>
          <p className="text-slate-400 mt-1">{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">New Task</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto flex-nowrap whitespace-nowrap pb-2">
        {statuses.map((s) => (
          <button
            key={s.v}
            onClick={() => { setPage(1); setFilter(s.v) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === s.v
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
            }`}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Title</th>
                  <th className="hidden md:table-cell text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Priority</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="hidden md:table-cell text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Assigned To</th>
                  <th className="hidden lg:table-cell text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Due Date</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-100">{t.title}</p>
                      {t.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                        className="text-xs bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-400">{t.assigned_to ? (employees.find(e => e.id === t.assigned_to)?.name || t.assigned_to) : '-'}</td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => del(t.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
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
          <span className="text-slate-400 text-sm py-1.5">Page {page}</span>
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
            <label className="text-sm font-medium text-slate-300">Assigned To</label>
            <select
              id="t-assign"
              value={form.assigned_to || ''}
              onChange={set('assigned_to')}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              id="t-desc"
              value={form.description || ''}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Priority</label>
              <select
                id="t-priority"
                value={form.priority || 'medium'}
                onChange={set('priority')}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
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
