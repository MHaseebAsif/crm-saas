import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tenantsApi } from '../api/tenants'
import type { Tenant } from '../types'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { fmt } from '../lib/utils'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id) return
    tenantsApi.get(id)
      .then(({ data }) => { setTenant(data); setName(data.name) })
      .catch(() => nav('/tenants'))
      .finally(() => setLoading(false))
  }, [id, nav])

  const save = async () => {
    if (!id || !name.trim()) return
    setSaving(true)
    setErr('')
    try {
      const { data } = await tenantsApi.update(id, { name })
      setTenant(data)
      setEditing(false)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!id || !confirm('Delete this tenant? This is irreversible.')) return
    setDeleting(true)
    try {
      await tenantsApi.delete(id)
      nav('/tenants')
    } catch (_) {
      setDeleting(false)
    }
  }

  const toggle = async () => {
    if (!id || !tenant) return
    try {
      await tenantsApi.toggleActive(id, tenant.is_active)
      setTenant((t) => t ? { ...t, is_active: !t.is_active } : t)
    } catch (_) {}
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!tenant) return null

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav('/tenants')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tenants
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggle}
          >
            {tenant.is_active ? 'Disable' : 'Enable'}
          </Button>
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={save} loading={saving}>Save</Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          )}
          <Button variant="danger" size="sm" onClick={del} loading={deleting}>Delete</Button>
        </div>
      </div>

      {err && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{err}</div>}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-400">
              {tenant.name[0].toUpperCase()}
            </div>
            <div>
              <CardTitle>{tenant.name}</CardTitle>
              <p className="text-slate-400 text-sm mt-0.5 font-mono">{tenant.slug}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={tenant.is_active ? 'success' : 'danger'}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <div className="space-y-4">
              <Input id="td-name" label="Tenant Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-6">
              {[
                ['Owner Email', tenant.owner_email],
                ['Slug', tenant.slug],
                ['Created', fmt(tenant.created_at)],
                ['Updated', fmt(tenant.updated_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500 uppercase tracking-wider mb-1">{k}</dt>
                  <dd className="text-sm text-slate-200 font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
