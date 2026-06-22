import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function SignupPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    tenant_name: '',
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await authApi.signup(form)
      nav('/login')
    } catch (e: unknown) {
      const detail = (e as any)?.response?.data?.detail
      let msg = 'Registration failed'
      if (typeof detail === 'string') {
        msg = detail
      } else if (Array.isArray(detail)) {
        msg = detail.map((d: any) => d.msg).join(', ')
      }
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Create account</h2>
        <p className="text-slate-400 mt-2">Start your free trial today</p>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Input
          id="signup-name"
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          value={form.full_name}
          onChange={set('full_name')}
          required
        />
        <Input
          id="signup-email"
          label="Email"
          type="email"
          placeholder="jane@company.com"
          value={form.email}
          onChange={set('email')}
          required
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={set('password')}
          required
          minLength={8}
        />
        <Input
          id="signup-tenant"
          label="Company Name"
          type="text"
          placeholder="Acme Corp"
          value={form.tenant_name}
          onChange={set('tenant_name')}
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
