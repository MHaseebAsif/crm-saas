import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Check your email</h2>
          <p className="text-slate-400 mt-2">We sent a password reset link to <strong className="text-slate-200">{email}</strong></p>
        </div>
        <Link to="/login">
          <Button variant="secondary" className="w-full">Back to Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Forgot password?</h2>
        <p className="text-slate-400 mt-2">Enter your email and we will send a reset link</p>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{err}</div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Input
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Back to Sign In
        </Link>
      </p>
    </div>
  )
}
