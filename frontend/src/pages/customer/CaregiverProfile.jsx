import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import MockPaymentModal from '../../components/booking/MockPaymentModal'
import api from '../../api/axios'

const CARE_TYPES = ['Elderly Care', 'Post-Surgery Care', 'Physiotherapy Assistance', 'House Help', 'Night Duty']
const SHIFTS     = ['Morning', 'Afternoon', 'Night', 'Full Day']

export default function CaregiverProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cg, setCg]           = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ care_type: '', shift: '', start_date: '', end_date: '', notes: '' })
  const [booking, setBooking] = useState(null)
  const [showPay, setShowPay] = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => {
    api.get(`/caregivers/${id}`)
      .then(r => setCg(r.data))
      .finally(() => setLoading(false))
  }, [id])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleBook = async e => {
    e.preventDefault(); setErr('')
    if (!form.care_type || !form.shift || !form.start_date || !form.end_date) {
      setErr('Please fill all fields'); return
    }
    try {
      const { data } = await api.post('/bookings', {
        caregiver_id: cg.user_id,
        care_type: form.care_type,
        shift: form.shift,
        city: cg.city,
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes,
      })
      setBooking(data)
      setShowPay(true)
    } catch (e) { setErr(e.response?.data?.error || 'Failed to create booking') }
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>
  if (!cg)     return <AppShell><p className="text-red-500">Caregiver not found.</p></AppShell>

  const days = form.start_date && form.end_date
    ? Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000))
    : 0

  return (
    <AppShell>
      {showPay && booking && (
        <MockPaymentModal
          booking={booking}
          onSuccess={() => { setShowPay(false); navigate('/customer/bookings') }}
          onClose={() => setShowPay(false)}
        />
      )}
      <div className="max-w-5xl grid grid-cols-3 gap-8">
        {/* Profile */}
        <div className="col-span-2 space-y-6">
          <div className="card flex gap-6 items-start">
            <img
              src={cg.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cg.name)}&background=0ea5e9&color=fff&size=128`}
              alt={cg.name}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{cg.name}</h1>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                {cg.agency_name && <span className="bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded-full">{cg.agency_name}</span>}
              </div>
              <p className="text-slate-500 mt-1">📍 {cg.city} · {cg.experience_years} years experience</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-brand-700 font-semibold">₹{cg.hourly_rate}/hr</span>
                <span className="text-slate-400">|</span>
                <span className="text-brand-700 font-semibold">₹{cg.daily_rate}/day</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{cg.bio || 'No bio available.'}</p>
          </div>

          <div className="card grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-slate-900 mb-3">Care Types</h2>
              <div className="flex flex-wrap gap-2">
                {(cg.care_types || []).map(ct => (
                  <span key={ct} className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full font-medium">{ct}</span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-3">Available Shifts</h2>
              <div className="flex flex-wrap gap-2">
                {(cg.shifts || []).map(s => (
                  <span key={s} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4">Book {cg.name.split(' ')[0]}</h2>
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="label">Care Type</label>
                <select className="input text-sm" value={form.care_type} onChange={set('care_type')}>
                  <option value="">Select…</option>
                  {CARE_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Shift</label>
                <select className="input text-sm" value={form.shift} onChange={set('shift')}>
                  <option value="">Select…</option>
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input className="input text-sm" type="date" value={form.start_date} onChange={set('start_date')} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input className="input text-sm" type="date" value={form.end_date} onChange={set('end_date')} min={form.start_date} />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input text-sm resize-none" rows={2} value={form.notes} onChange={set('notes')} placeholder="Any specific requirements…" />
              </div>
              {days > 0 && (
                <div className="bg-brand-50 rounded-lg px-3 py-2 text-sm">
                  <p className="text-brand-700 font-medium">{days} day{days > 1 ? 's' : ''} × ₹{cg.daily_rate?.toLocaleString()}/day</p>
                  <p className="text-brand-600 font-bold text-lg">Total: ₹{(days * cg.daily_rate)?.toLocaleString()}</p>
                </div>
              )}
              {err && <p className="text-xs text-red-600">{err}</p>}
              <button type="submit" className="btn-primary w-full">Proceed to Payment</button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
