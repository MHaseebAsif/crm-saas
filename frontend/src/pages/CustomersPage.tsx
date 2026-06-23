import { useEffect, useState } from 'react'
import { customersApi, type CustomerPayload } from '../api/customers'
import type { Customer } from '../types'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const statusVariant = { active: 'success', inactive: 'default', lead: 'warning' } as const

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

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerPayload>({ name: '', email: '', status: 'lead', company: '', phone: '' })

  const load = async (p = page, q = search) => {
    setLoading(true)
    try {
      const { data } = await customersApi.list(p, 20, q || undefined)
      setItems(data.items)
      setTotal(data.total)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  const set = (k: keyof CustomerPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    setSaving(true)
    try {
      await customersApi.create(form)
      setOpen(false)
      setForm({ name: '', email: '', status: 'lead', company: '', phone: '' })
      toast.success('Customer created')
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
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
          <h1 style={gradientTitle}>Customers</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4, fontSize: 13 }}>{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">Add Customer</Button>
      </div>

      <form onSubmit={onSearch} className="flex gap-3 max-w-md">
        <Input
          id="customer-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Add your first customer to get started"
            action={<Button onClick={() => setOpen(true)}>Add Customer</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Name', 'Email', 'Company', 'Status', 'Created', ''].map((h) => (
                    <th key={h} className={h === 'Company' || h === 'Created' ? 'hidden md:table-cell' : ''} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 24px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    style={{ transition: 'all 0.2s ease', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => rowHover(e, true)}
                    onMouseLeave={(e) => rowHover(e, false)}
                  >
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{c.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{c.email}</td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{c.company || '-'}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: '14px 24px', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{c?.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <button
                        onClick={() => setViewCustomer(c)}
                        style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#c7d2fe' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a5b4fc' }}
                      >
                        View
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
        title="Add Customer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="c-name" label="Name" value={form.name} onChange={set('name')} required />
          <Input id="c-email" label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Input id="c-phone" label="Phone" value={form.phone || ''} onChange={set('phone')} />
          <Input id="c-company" label="Company" value={form.company || ''} onChange={set('company')} />
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Status</label>
            <select id="c-status" value={form.status || 'lead'} onChange={set('status')} style={glassSelect}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
        title="Customer Details"
        footer={<Button onClick={() => setViewCustomer(null)}>Close</Button>}
      >
        {viewCustomer && (
          <div className="space-y-4">
            {[
              { label: 'Name', value: viewCustomer.name },
              { label: 'Email', value: viewCustomer.email },
              { label: 'Company', value: viewCustomer.company || '-' },
            ].map((row) => (
              <div key={row.label}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{row.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{row.value}</p>
              </div>
            ))}
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Status</p>
              <Badge variant={statusVariant[viewCustomer.status]}>{viewCustomer.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
