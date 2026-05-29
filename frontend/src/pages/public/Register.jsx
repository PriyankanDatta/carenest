import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CITIES     = ['Bangalore', 'Delhi']
const CARE_TYPES = ['Elderly Care', 'Post-Surgery Care', 'Physiotherapy Assistance', 'House Help', 'Night Duty']
const SHIFTS     = ['Morning', 'Afternoon', 'Night', 'Full Day']
const ROLE_HOME  = { customer: '/customer/dashboard', caregiver: '/caregiver/dashboard', agency: '/agency/dashboard' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', city: 'Bangalore',
    care_types: [], shifts: [], experience_years: '', hourly_rate: '', daily_rate: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggle = (key, val) => setForm(f => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
  }))

  const handleSubmit = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    const payload = { ...form, role }
    if (role === 'caregiver') {
      payload.experience_years = parseInt(form.experience_years) || 0
      payload.hourly_rate = parseInt(form.hourly_rate) || 0
      payload.daily_rate  = parseInt(form.daily_rate)  || 0
    }
    try {
      const user = await register(payload)
      navigate(ROLE_HOME[user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-teal-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🏠</span>
            <span className="text-2xl font-bold text-brand-700">CareNest</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        </div>

        <div className="card shadow-md">
          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[['customer','👨‍👩‍👧 Family'],['caregiver','👩‍⚕️ Caregiver'],['agency','🏢 Agency']].map(([r, label]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{role === 'agency' ? 'Agency Name' : 'Full Name'}</label>
              <input className="input" placeholder={role === 'agency' ? 'e.g. CareFirst Services' : 'e.g. Priya Sharma'}
                value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="98XXXXXXXX" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="label">City</label>
                <select className="input" value={form.city} onChange={set('city')}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Caregiver-specific */}
            {role === 'caregiver' && (
              <>
                <div>
                  <label className="label">Care Types</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CARE_TYPES.map(ct => (
                      <button key={ct} type="button"
                        onClick={() => toggle('care_types', ct)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.care_types.includes(ct)
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                        }`}>
                        {ct}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Available Shifts</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SHIFTS.map(s => (
                      <button key={s} type="button"
                        onClick={() => toggle('shifts', s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.shifts.includes(s)
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Experience (yrs)</label>
                    <input className="input" type="number" min="0" value={form.experience_years} onChange={set('experience_years')} />
                  </div>
                  <div>
                    <label className="label">Hourly Rate (₹)</label>
                    <input className="input" type="number" min="0" value={form.hourly_rate} onChange={set('hourly_rate')} />
                  </div>
                  <div>
                    <label className="label">Daily Rate (₹)</label>
                    <input className="input" type="number" min="0" value={form.daily_rate} onChange={set('daily_rate')} />
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            {(role === 'caregiver' || role === 'agency') && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                ⏳ Your account will be reviewed by an admin before you can access all features.
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              {busy ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
