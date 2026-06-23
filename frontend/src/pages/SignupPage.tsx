import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const gradientTitle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: 32,
  fontWeight: 800,
}

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
        <h2 style={gradientTitle}>Create account</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 15 }}>Start your free trial today</p>
      </div>

      {err && (
        <div
          style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 14,
            color: '#fca5a5',
          }}
        >
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

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#a5b4fc', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c7d2fe' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#a5b4fc' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
