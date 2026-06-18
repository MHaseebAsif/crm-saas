import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tenantsApi, type TenantPayload } from '../api/tenants'
import type { Tenant } from '../types'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { fmt } from '../lib/utils'

export default function TenantsPage() {
  const [items, setItems] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<TenantPayload & { owner_full_name: string }>({
    name: '',
    owner_email: '',
    owner_password: '',
    owner_full_name: '',
  })
  const [err, setErr] = useState('')

  const load = async (p = page, q = search) => {
    setLoading(true)
    try {
      const { data } = await tenantsApi.list(p, 20, q || undefined)
      setItems(data.items)
      setTotal(data.total)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.owner_email) { setErr('Tenant name and owner email required'); return }
    setSaving(true)
    setErr('')
    try {
      await tenantsApi.create(form)
      setOpen(false)
      setForm({ name: '', owner_email: '', owner_password: '', owner_full_name: '' })
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to create tenant')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (id: string, active: boolean) => {
    try {
      await tenantsApi.toggleActive(id, !active)
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: !active } : t)))
    } catch (_) {}
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tenants</h1>
          <p className="text-slate-400 mt-1">{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)}>New Tenant</Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(1, search) }} className="flex gap-3 max-w-md">
        <Input
          id="tenant-search"
          placeholder="Search tenants..."
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
            title="No tenants yet"
            description="Create a new tenant organization"
            action={<Button onClick={() => setOpen(true)}>New Tenant</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Name', 'Slug', 'Owner', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100 text-sm">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{t.slug}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{t.owner_email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.is_active ? 'success' : 'danger'}>{t.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{fmt(t.created_at)}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Link to={`/tenants/${t.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View</Link>
                      <button
                        onClick={() => toggle(t.id, t.is_active)}
                        className={`text-sm font-medium transition-colors ${t.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      >
                        {t.is_active ? 'Disable' : 'Enable'}
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
          <span className="text-slate-400 text-sm py-1.5">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => { setOpen(false); setErr('') }}
        title="New Tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          {err && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{err}</div>}
          <Input id="tn-name" label="Tenant Name" value={form.name} onChange={set('name')} required />
          <Input id="tn-owner-name" label="Owner Full Name" value={form.owner_full_name} onChange={set('owner_full_name')} />
          <Input id="tn-owner-email" label="Owner Email" type="email" value={form.owner_email} onChange={set('owner_email')} required />
          <Input id="tn-owner-pass" label="Owner Password" type="password" value={form.owner_password || ''} onChange={set('owner_password')} />
        </div>
      </Modal>
    </div>
  )
}
