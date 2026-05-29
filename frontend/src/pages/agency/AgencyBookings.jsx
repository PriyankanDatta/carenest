import React, { useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function AgencyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/agency/bookings').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Agency Bookings</h1>
        {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
          <div className="card text-center py-16"><p className="text-slate-400">No bookings for your roster yet.</p></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Caregiver','Customer','Care Type','Shift','Dates','Amount','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{b.caregiver_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.care_type}</td>
                    <td className="px-4 py-3 text-slate-600">{b.shift}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.start_date} → {b.end_date}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">₹{b.total_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
