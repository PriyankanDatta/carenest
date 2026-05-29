import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <AppShell>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <Link to="/customer/browse" className="btn-primary text-sm">+ Book a Caregiver</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-400'}`}>
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : visible.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(b => (
              <Link key={b.id} to={`/customer/bookings/${b.id}`}
                className="card flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-slate-900">{b.caregiver_name}</p>
                  <p className="text-sm text-slate-500">{b.care_type} · {b.shift} · {b.city}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.start_date} → {b.end_date}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.payment_status} />
                  <p className="text-sm font-bold text-slate-700">₹{b.total_amount?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
