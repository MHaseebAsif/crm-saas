import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { customersApi, type CustomerPayload } from '../api/customers'
import type { Customer } from '../types'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { fmt } from '../lib/utils'

const statusVariant = { active: 'success', inactive: 'default', lead: 'warning' } as const

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<CustomerPayload>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id) return
    customersApi.get(id).then(({ data }) => {
      setCustomer(data)
      setForm({ name: data.name, email: data.email, phone: data.phone || '', company: data.company || '', status: data.status, notes: data.notes || '' })
    }).catch(() => nav('/customers')).finally(() => setLoading(false))
  }, [id, nav])

  const set = (k: keyof CustomerPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!id) return
    setSaving(true)
    setErr('')
    try {
      const { data } = await customersApi.update(id, form)
      setCustomer(data)
      setEditing(false)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!id || !confirm('Delete this customer?')) return
    setDeleting(true)
    try {
      await customersApi.delete(id)
      nav('/customers')
    } catch (_) {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!customer) return null

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav('/customers')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Customers
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={save} loading={saving}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={del} loading={deleting}>Delete</Button>
            </>
          )}
        </div>
      </div>

      {err && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{err}</div>}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-400">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <CardTitle>{customer.name}</CardTitle>
              <p className="text-slate-400 text-sm mt-0.5">{customer.email}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={statusVariant[customer.status]}>{customer.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input id="cd-name" label="Name" value={form.name || ''} onChange={set('name')} />
                <Input id="cd-email" label="Email" type="email" value={form.email || ''} onChange={set('email')} />
                <Input id="cd-phone" label="Phone" value={form.phone || ''} onChange={set('phone')} />
                <Input id="cd-company" label="Company" value={form.company || ''} onChange={set('company')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <select
                  id="cd-status"
                  value={form.status || 'lead'}
                  onChange={set('status')}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Notes</label>
                <textarea
                  id="cd-notes"
                  value={form.notes || ''}
                  onChange={set('notes')}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-6">
              {[
                ['Phone', customer.phone || '-'],
                ['Company', customer.company || '-'],
                ['Created', fmt(customer.created_at)],
                ['Updated', fmt(customer.updated_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500 uppercase tracking-wider mb-1">{k}</dt>
                  <dd className="text-sm text-slate-200">{v}</dd>
                </div>
              ))}
              {customer.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</dt>
                  <dd className="text-sm text-slate-200 whitespace-pre-wrap">{customer.notes}</dd>
                </div>
              )}
            </dl>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
