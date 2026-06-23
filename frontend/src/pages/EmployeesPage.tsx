import { useEffect, useState } from 'react'
import { employeesApi, type EmployeePayload } from '../api/employees'
import type { Employee } from '../types'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

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

const glassTableWrap: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  borderRadius: 16,
  overflow: 'hidden',
}

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EmployeePayload>({ name: '', email: '', role: 'employee' })

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

  const set = (k: keyof EmployeePayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    setSaving(true)
    try {
      await employeesApi.create(form)
      setOpen(false)
      setForm({ name: '', email: '', role: 'employee' })
      toast.success('Employee created')
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!window.confirm('Remove this employee?')) return
    try {
      await employeesApi.delete(id)
      toast.success('Employee deleted')
      load()
    } catch (_) {}
  }

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
          <h1 style={gradientTitle}>Employees</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 13 }}>{total} total</p>
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
        <div style={glassTableWrap}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Name', 'Email', 'Role', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 24px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((emp) => (
                  <tr
                    key={emp.id}
                    style={{ transition: 'all 0.2s ease', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => rowHover(e, true)}
                    onMouseLeave={(e) => rowHover(e, false)}
                  >
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{emp.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{emp.email}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <Badge variant={emp.role === 'company_admin' ? 'success' : 'default'}>{emp.role}</Badge>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => del(emp.id)}
                        style={{ fontSize: 12, color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fda4af' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#fca5a5' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        title="Add Employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="e-name" label="Name" value={form.name} onChange={set('name')} required />
          <Input id="e-email" label="Email" type="email" value={form.email} onChange={set('email')} required />
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Role</label>
            <select id="e-role" value={form.role} onChange={set('role')} style={glassSelect}>
              <option value="employee">Employee</option>
              <option value="company_admin">Company Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
