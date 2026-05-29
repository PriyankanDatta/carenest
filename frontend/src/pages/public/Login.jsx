import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_HOME = {
  customer:  '/customer/dashboard',
  caregiver: '/caregiver/dashboard',
  agency:    '/agency/dashboard',
  admin:     '/admin/dashboard',
}

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(ROLE_HOME[user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setBusy(false) }
  }

  const fill = (email) => setForm({ email, password: 'demo1234' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🏠</span>
            <span className="text-2xl font-bold text-brand-700">CareNest</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} required />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        {/* Demo quick-fill */}
        <div className="mt-6 card shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['customer@demo.com',  'Customer'],
              ['caregiver@demo.com', 'Caregiver'],
              ['agency@demo.com',    'Agency'],
              ['admin@demo.com',     'Admin'],
            ].map(([email, label]) => (
              <button key={email} onClick={() => fill(email)}
                className="text-left text-xs bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-lg px-3 py-2 transition-colors">
                <span className="font-semibold text-slate-700 block">{label}</span>
                <span className="text-slate-400">{email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded">demo1234</code></p>
        </div>
      </div>
    </div>
  )
}
