import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
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

export default function LoginPage() {
  const nav = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const { data: tokens } = await authApi.login({ email, pwd: password })
      setTokens(tokens.tok, tokens.ref)
      const { data: user } = await authApi.me()
      setUser(user)
      nav('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 style={gradientTitle}>Welcome back</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 15 }}>Sign in to your account</p>
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
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            style={{ fontSize: 13, color: '#a5b4fc', textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c7d2fe' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#a5b4fc' }}
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        No account?{' '}
        <Link
          to="/signup"
          style={{ color: '#a5b4fc', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c7d2fe' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#a5b4fc' }}
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
