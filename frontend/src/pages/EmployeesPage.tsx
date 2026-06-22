import { useEffect, useState } from 'react'
import { employeesApi, type EmployeePayload } from '../api/employees'
import type { Employee } from '../types'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { fmt, initials } from '../lib/utils'

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EmployeePayload>({ full_name: '', email: '' })
  const [err, setErr] = useState('')

  const load = async (p = page, q = search) => {
    setLoading(true)
    try {
      const { data } = await employeesApi.list(p, 20, q || undefined)
      setItems(data.items)
      setTotal(data.total)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const set = (k: keyof EmployeePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.full_name || !form.email) { setErr('Name and email required'); return }
    setSaving(true)
    setErr('')
    try {
      await employeesApi.create(form)
      setOpen(false)
      setForm({ full_name: '', email: '' })
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Remove this employee?')) return
    try {
      await employeesApi.delete(id)
      load()
    } catch (_) {}
  }

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Employees</h1>
          <p className="text-slate-400 mt-1">{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">Add Employee</Button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(1, search) }}
        className="flex gap-3 max-w-md"
      >
        <Input
          id="employee-search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Add team members to get started"
          action={<Button onClick={() => setOpen(true)}>Add Employee</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((emp) => (
            <div key={emp.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                  {initials(emp.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{emp.full_name}</p>
                  <p className="text-sm text-slate-400 truncate">{emp.email}</p>
                  {emp.position && <p className="text-xs text-slate-500 mt-1">{emp.position}</p>}
                  {emp.department && <p className="text-xs text-slate-500">{emp.department}</p>}
                </div>
                <Badge variant={emp.is_active ? 'success' : 'default'}>
                  {emp.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">{fmt(emp.created_at)}</span>
                <button
                  onClick={() => del(emp.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-slate-400 text-sm py-1.5">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => { setOpen(false); setErr('') }}
        title="Add Employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          {err && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{err}</div>}
          <Input id="e-name" label="Full Name" value={form.full_name} onChange={set('full_name')} required />
          <Input id="e-email" label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Input id="e-dept" label="Department" value={form.department || ''} onChange={set('department')} />
          <Input id="e-pos" label="Position" value={form.position || ''} onChange={set('position')} />
        </div>
      </Modal>
    </div>
  )
}
