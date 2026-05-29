import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function AgencyDashboard() {
  const { user } = useAuth()
  const [roster, setRoster]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.get('/agency/roster'), api.get('/agency/bookings')])
      .then(([r, b]) => { setRoster(r.data); setBookings(b.data) })
      .finally(() => setLoading(false))
  }, [])

  const active = bookings.filter(b => ['confirmed','in_progress'].includes(b.status))

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Agency Dashboard</h1>
        <p className="text-slate-500 mb-8">{user?.name} — managing your caregiver roster</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Caregivers on Roster', val: roster.length,    color: 'teal' },
            { label: 'Total Bookings',        val: bookings.length,  color: 'brand' },
            { label: 'Active Bookings',       val: active.length,    color: 'green' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className={`text-3xl font-bold text-${s.color}-600`}>{s.val}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent roster */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Your Roster</h2>
            <Link to="/agency/caregivers" className="text-sm text-brand-600 hover:underline">Manage →</Link>
          </div>
          {loading ? <LoadingSpinner /> : roster.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No caregivers on roster yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {roster.slice(0, 6).map(cg => (
                <div key={cg.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <img src={cg.profile_photo_url} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cg.name}</p>
                    <p className="text-xs text-slate-400">{cg.city}</p>
                  </div>
                </div>
              ))}
              {roster.length > 6 && <div className="flex items-center px-3 py-2 text-sm text-slate-400">+{roster.length - 6} more</div>}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
            <Link to="/agency/bookings" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          {bookings.slice(0, 5).map(b => (
            <div key={b.id} className="flex items-center justify-between py-3 border-t border-slate-100 first:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{b.caregiver_name} → {b.customer_name}</p>
                <p className="text-xs text-slate-400">{b.care_type} · {b.start_date}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
