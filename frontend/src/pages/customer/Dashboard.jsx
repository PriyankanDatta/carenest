import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const upcoming = bookings.filter(b => ['pending','confirmed','in_progress'].includes(b.status))
  const past     = bookings.filter(b => ['completed','cancelled'].includes(b.status))

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mb-8">Here's a summary of your caregiving bookings.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings',    val: bookings.length,  color: 'brand' },
            { label: 'Active / Upcoming', val: upcoming.length,  color: 'teal' },
            { label: 'Completed',         val: past.filter(b => b.status === 'completed').length, color: 'green' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className={`text-3xl font-bold text-${s.color}-600`}>{s.val}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming Bookings</h2>
            <Link to="/customer/browse" className="btn-primary text-sm">+ New Booking</Link>
          </div>
          {loading ? <LoadingSpinner /> : upcoming.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-4">No active bookings yet.</p>
              <Link to="/customer/browse" className="btn-primary">Browse Caregivers</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map(b => (
                <Link key={b.id} to={`/customer/bookings/${b.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-slate-800">{b.caregiver_name}</p>
                    <p className="text-sm text-slate-500">{b.care_type} · {b.shift} · {b.city}</p>
                    <p className="text-xs text-slate-400">{b.start_date} → {b.end_date}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.payment_status} />
                    <p className="text-sm font-semibold text-slate-700">₹{b.total_amount?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/customer/tickets" className="card hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="font-medium text-slate-800">Support Tickets</p>
              <p className="text-xs text-slate-500">View or raise a support issue</p>
            </div>
          </Link>
          <Link to="/customer/bookings" className="card hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-slate-800">All Bookings</p>
              <p className="text-xs text-slate-500">Full history of your bookings</p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
