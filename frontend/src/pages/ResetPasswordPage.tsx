import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setErr('Passwords do not match'); return }
    setErr('')
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      nav('/login')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Set new password</h2>
        <p className="text-slate-400 mt-2">Choose a strong new password</p>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{err}</div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Input
          id="reset-password"
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          id="reset-confirm"
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Reset Password
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Back to Sign In</Link>
      </p>
    </div>
  )
}
