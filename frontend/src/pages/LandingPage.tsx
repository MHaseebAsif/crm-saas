import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const features = [
  { title: 'Multi-Tenant', desc: 'Isolated data per organization with role-based access control.' },
  { title: 'Customer CRM', desc: 'Track leads, active clients and manage all relationships.' },
  { title: 'Task Management', desc: 'Assign, track and complete tasks with priority levels.' },
  { title: 'Team Collaboration', desc: 'Manage employees and delegate work efficiently.' },
  { title: 'Real-time Notifications', desc: 'Stay updated with alerts for tasks and activities.' },
  { title: 'Secure Auth', desc: 'JWT-based auth with OTP verification and refresh tokens.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg">CRM SaaS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-400 mb-4">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Multi-tenant SaaS CRM Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Manage Customers, Teams and Tasks in One Place
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A powerful CRM platform built for modern businesses. Track relationships, collaborate with your team, and never miss a follow-up.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="px-8">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Everything You Need</h2>
            <p className="text-slate-400">Built for teams of every size with role-based access control</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600/30 transition-colors">
                  <div className="w-4 h-4 bg-indigo-400 rounded-sm" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-100">Ready to Get Started?</h2>
          <p className="text-slate-400">Join businesses managing their customer relationships smarter.</p>
          <Link to="/signup">
            <Button size="lg" className="px-10">Create Your Account</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} CRM SaaS. All rights reserved.
      </footer>
    </div>
  )
}
