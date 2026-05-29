import React, { useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

const CARE_TYPES = ['Elderly Care', 'Post-Surgery Care', 'Physiotherapy Assistance', 'House Help', 'Night Duty']
const SHIFTS     = ['Morning', 'Afternoon', 'Night', 'Full Day']
const CITIES     = ['Bangalore', 'Delhi']

export default function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => {
    api.get('/caregivers/my-profile').then(r => {
      setProfile(r.data)
      setForm({
        bio: r.data.bio || '',
        city: r.data.city || 'Bangalore',
        care_types: r.data.care_types || [],
        shifts: r.data.shifts || [],
        experience_years: r.data.experience_years || 0,
        hourly_rate: r.data.hourly_rate || 0,
        daily_rate: r.data.daily_rate || 0,
        is_available: r.data.is_available === 1,
      })
    }).finally(() => setLoading(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggle = (key, val) => setForm(f => ({
    ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
  }))

  const save = async e => {
    e.preventDefault(); setSaving(true); setErr(''); setSaved(false)
    try {
      await api.put('/caregivers/my-profile', {
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
        hourly_rate: parseInt(form.hourly_rate) || 0,
        daily_rate: parseInt(form.daily_rate) || 0,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setErr(e.response?.data?.error || 'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

        {/* Approval badge */}
        {profile?.approval_status !== 'approved' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
            ⏳ Your profile is <strong>{profile?.approval_status}</strong>. It will be visible to customers once approved by admin.
          </div>
        )}

        {/* Avatar + preview */}
        <div className="card mb-6 flex items-center gap-4">
          <img src={profile?.profile_photo_url} alt="" className="w-16 h-16 rounded-full" />
          <div>
            <p className="font-semibold text-slate-900">{profile?.name}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            {profile?.agency_name && <p className="text-xs text-brand-600 mt-0.5">🏢 {profile.agency_name}</p>}
          </div>
          <label className="ml-auto flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-600">Available</span>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors ${form.is_available ? 'bg-teal-500' : 'bg-slate-300'}`}
              onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_available ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>

        <form onSubmit={save} className="card space-y-5">
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={3} value={form.bio} onChange={set('bio')} placeholder="Describe your experience and specialisation…" />
          </div>
          <div>
            <label className="label">City</label>
            <select className="input" value={form.city} onChange={set('city')}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Care Types</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CARE_TYPES.map(ct => (
                <button key={ct} type="button" onClick={() => toggle('care_types', ct)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.care_types.includes(ct) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {ct}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Available Shifts</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SHIFTS.map(s => (
                <button key={s} type="button" onClick={() => toggle('shifts', s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.shifts.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Experience (yrs)</label><input className="input" type="number" min="0" value={form.experience_years} onChange={set('experience_years')} /></div>
            <div><label className="label">Hourly Rate (₹)</label><input className="input" type="number" min="0" value={form.hourly_rate} onChange={set('hourly_rate')} /></div>
            <div><label className="label">Daily Rate (₹)</label><input className="input" type="number" min="0" value={form.daily_rate} onChange={set('daily_rate')} /></div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {saved && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">✓ Profile saved successfully</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save Profile'}</button>
        </form>
      </div>
    </AppShell>
  )
}
