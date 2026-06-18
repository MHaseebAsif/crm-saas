import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import Button from '../components/ui/Button'

export default function VerifyOtpPage() {
  const loc = useLocation()
  const nav = useNavigate()
  const email = (loc.state as { email?: string })?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]
    next[i] = v.slice(-1)
    setOtp(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setErr('Enter the 6-digit code'); return }
    setErr('')
    setLoading(true)
    try {
      await authApi.verifyOtp(email, code)
      nav('/login')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Verify your email</h2>
        <p className="text-slate-400 mt-2">
          Enter the 6-digit code sent to <strong className="text-slate-200">{email}</strong>
        </p>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{err}</div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div className="flex gap-3 justify-center">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el }}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-slate-800 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          ))}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Verify Email
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Back to Sign In</Link>
      </p>
    </div>
  )
}
