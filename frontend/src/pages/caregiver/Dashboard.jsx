import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function CaregiverDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const pending   = bookings.filter(b => b.status === 'pending')
  const active    = bookings.filter(b => ['confirmed','in_progress'].includes(b.status))
  const completed = bookings.filter(b => b.status === 'completed')

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mb-8">Here's an overview of your bookings and requests.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'New Requests',   val: pending.length,   color: 'amber' },
            { label: 'Active Bookings',val: active.length,    color: 'brand' },
            { label: 'Completed',      val: completed.length, color: 'green' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className={`text-3xl font-bold text-${s.color}-600`}>{s.val}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* New requests */}
        {pending.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">⏳ New Booking Requests</h2>
            <div className="divide-y divide-slate-100">
              {pending.map(b => (
                <BookingRow key={b.id} b={b} onUpdate={() => api.get('/bookings').then(r => setBookings(r.data))} />
              ))}
            </div>
          </div>
        )}

        {/* Active */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Active Bookings</h2>
          {loading ? <LoadingSpinner /> : active.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No active bookings.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {active.map(b => <BookingRow key={b.id} b={b} onUpdate={() => api.get('/bookings').then(r => setBookings(r.data))} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function BookingRow({ b, onUpdate }) {
  const [busy, setBusy] = useState(false)

  const update = async status => {
    setBusy(true)
    await api.put(`/bookings/${b.id}/status`, { status })
    onUpdate()
    setBusy(false)
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-slate-800">{b.customer_name}</p>
        <p className="text-sm text-slate-500">{b.care_type} · {b.shift} · {b.start_date} → {b.end_date}</p>
        <StatusBadge status={b.status} />
      </div>
      {b.status === 'pending' && (
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => update('confirmed')} className="btn-primary text-xs px-3 py-1.5">Accept</button>
          <button disabled={busy} onClick={() => update('cancelled')} className="btn-danger text-xs px-3 py-1.5">Decline</button>
        </div>
      )}
      {b.status === 'confirmed' && (
        <button disabled={busy} onClick={() => update('in_progress')} className="btn-secondary text-xs px-3 py-1.5">Mark Started</button>
      )}
      {b.status === 'in_progress' && (
        <button disabled={busy} onClick={() => update('completed')} className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">Mark Complete</button>
      )}
    </div>
  )
}
