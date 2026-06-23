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

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Customers</h1>
          <p className="text-slate-400 mt-1">{total} total</p>
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Email</th>
                  <th className="hidden md:table-cell text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Company</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="hidden md:table-cell text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Created</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-100">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.email}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-400">{c.company || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-400">{c?.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setViewCustomer(c)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View</button>
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
            <label className="text-sm font-medium text-slate-300">Status</label>
            <select
              id="c-status"
              value={form.status || 'lead'}
              onChange={set('status')}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
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
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="text-slate-100 font-medium">{viewCustomer.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-slate-100">{viewCustomer.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Company</p>
              <p className="text-slate-100">{viewCustomer.company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <Badge variant={statusVariant[viewCustomer.status]}>{viewCustomer.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
