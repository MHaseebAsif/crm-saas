import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

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
      const { data: tokens } = await authApi.login({ email, password })
      setTokens(tokens.access_token, tokens.refresh_token)
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
        <h2 className="text-3xl font-bold text-slate-100">Welcome back</h2>
        <p className="text-slate-400 mt-2">Sign in to your account</p>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
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
          <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        No account?{' '}
        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
