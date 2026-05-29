import React, { useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function CaregiverBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = () => api.get('/bookings').then(r => setBookings(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const update = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status })
    load()
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="card text-center py-16"><p className="text-slate-400">No bookings yet.</p></div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{b.customer_name}</p>
                  <p className="text-sm text-slate-500">{b.care_type} · {b.shift} · {b.city}</p>
                  <p className="text-xs text-slate-400">{b.start_date} → {b.end_date} · <strong>₹{b.total_amount?.toLocaleString()}</strong></p>
                  <div className="mt-1 flex gap-1"><StatusBadge status={b.status} /><StatusBadge status={b.payment_status} /></div>
                </div>
                <div className="flex gap-2">
                  {b.status === 'pending' && <>
                    <button onClick={() => update(b.id, 'confirmed')} className="btn-primary text-xs px-3 py-1.5">Accept</button>
                    <button onClick={() => update(b.id, 'cancelled')} className="btn-danger text-xs px-3 py-1.5">Decline</button>
                  </>}
                  {b.status === 'confirmed'   && <button onClick={() => update(b.id, 'in_progress')} className="btn-secondary text-xs">Mark Started</button>}
                  {b.status === 'in_progress' && <button onClick={() => update(b.id, 'completed')}  className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg">Mark Complete</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
