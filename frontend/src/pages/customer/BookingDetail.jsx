import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import MockPaymentModal from '../../components/booking/MockPaymentModal'
import api from '../../api/axios'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPay, setShowPay] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const load = () => api.get(`/bookings/${id}`).then(r => setBooking(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const cancel = async () => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(true)
    await api.put(`/bookings/${id}/status`, { status: 'cancelled' })
    load()
    setCancelling(false)
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>
  if (!booking) return <AppShell><p className="text-red-500">Booking not found.</p></AppShell>

  const canPay    = booking.payment_status === 'pending' && booking.status !== 'cancelled'
  const canCancel = ['pending','confirmed'].includes(booking.status)

  return (
    <AppShell>
      {showPay && (
        <MockPaymentModal
          booking={booking}
          onSuccess={() => { setShowPay(false); load() }}
          onClose={() => setShowPay(false)}
        />
      )}
      <div className="max-w-2xl">
        <button onClick={() => navigate('/customer/bookings')} className="text-sm text-slate-500 hover:text-brand-600 mb-4 flex items-center gap-1">← Back to bookings</button>

        <div className="card mb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Booking #{booking.id}</h1>
              <p className="text-slate-500 text-sm mt-1">Created {new Date(booking.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.payment_status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Caregiver',   booking.caregiver_name],
              ['Care Type',   booking.care_type],
              ['Shift',       booking.shift],
              ['City',        booking.city],
              ['Start Date',  booking.start_date],
              ['End Date',    booking.end_date],
              ['Total',       `₹${booking.total_amount?.toLocaleString()}`],
              ['Caregiver Phone', booking.caregiver_phone || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-400 text-xs">{k}</p>
                <p className="font-medium text-slate-800">{v}</p>
              </div>
            ))}
          </div>

          {booking.notes && (
            <div className="mt-4 bg-slate-50 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{booking.notes}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            {canPay && (
              <button onClick={() => setShowPay(true)} className="btn-primary flex-1">
                💳 Pay ₹{booking.total_amount?.toLocaleString()}
              </button>
            )}
            {canCancel && (
              <button onClick={cancel} disabled={cancelling} className="btn-danger">
                {cancelling ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Need help with this booking?{' '}
            <a href={`/customer/tickets/new`} className="text-brand-600 font-medium hover:underline">Raise a support ticket →</a>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
