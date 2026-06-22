import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'
import { authApi } from '../api/auth'
import { Card, CardHeader, CardBody, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { initials } from '../lib/utils'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [err, setErr] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    setErr('')
    setMsg('')
    try {
      const { data } = await usersApi.updateProfile({ full_name: fullName })
      setUser(data)
      setMsg('Profile updated successfully')
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(m || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!curPwd || !newPwd) { setPwdErr('Both fields required'); return }
    if (newPwd.length < 8) { setPwdErr('Min. 8 characters'); return }
    setPwdSaving(true)
    setPwdErr('')
    setPwdMsg('')
    try {
      await usersApi.updateProfile({ current_password: curPwd, new_password: newPwd })
      setCurPwd('')
      setNewPwd('')
      setPwdMsg('Password updated successfully')
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setPwdErr(m || 'Failed to update password')
    } finally {
      setPwdSaving(false)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch (_) {}
    logout()
  }

  if (!user) return null

  return (
    <div className="min-h-full w-full px-4 md:px-6 lg:px-8 py-6 space-y-6 max-w-2xl mx-auto md:mx-0">
      <h1 className="text-2xl font-bold text-slate-100">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {initials(user.full_name)}
            </div>
            <div>
              <CardTitle>{user.full_name}</CardTitle>
              <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
              <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveProfile} className="space-y-4">
            {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-emerald-400">{msg}</div>}
            {err && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{err}</div>}
            <Input
              id="profile-name"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input id="profile-email" label="Email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
            <Button type="submit" loading={saving}>Save Profile</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={savePassword} className="space-y-4">
            {pwdMsg && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-emerald-400">{pwdMsg}</div>}
            {pwdErr && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{pwdErr}</div>}
            <Input
              id="cur-pwd"
              label="Current Password"
              type="password"
              value={curPwd}
              onChange={(e) => setCurPwd(e.target.value)}
              required
            />
            <Input
              id="new-pwd"
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <Button type="submit" loading={pwdSaving}>Update Password</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-100">Sign Out</p>
              <p className="text-sm text-slate-400 mt-0.5">Sign out of your account on this device</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>Sign Out</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
