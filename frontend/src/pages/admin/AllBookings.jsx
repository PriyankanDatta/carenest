import React, { useEffect, useState, useCallback } from 'react'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [page, setPage]         = useState(1)
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    const p = { page, limit: LIMIT }
    if (filter) p.status = filter
    api.get('/admin/bookings', { params: p })
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false))
  }, [filter, page])

  useEffect(() => { load() }, [load])

  return (
    <AppShell>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">All Bookings</h1>
        <div className="flex gap-3 mb-6 flex-wrap">
          {['','pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Customer','Caregiver','Care Type','Shift','Dates','Amount','Payment','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{b.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.caregiver_name}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.care_type}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.shift}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{b.start_date} → {b.end_date}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">₹{b.total_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.payment_status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="text-center text-slate-400 py-12">No bookings found.</p>}
          </div>
        )}
      </div>
    </AppShell>
  )
}
