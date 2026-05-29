import React, { useState } from 'react'
import api from '../../api/axios'

export default function MockPaymentModal({ booking, onSuccess, onClose }) {
  const [step, setStep]       = useState('form')   // form | processing | done
  const [card, setCard]       = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [error, setError]     = useState('')

  const handlePay = async () => {
    if (!card.number || !card.expiry || !card.cvv || !card.name) {
      setError('Please fill in all card details'); return
    }
    setStep('processing')
    setError('')
    await new Promise(r => setTimeout(r, 1500))
    try {
      await api.post(`/bookings/${booking.id}/pay`)
      setStep('done')
      setTimeout(onSuccess, 1200)
    } catch (e) {
      setError(e.response?.data?.error || 'Payment failed')
      setStep('form')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-teal-600 px-6 py-4 text-white">
          <p className="text-xs uppercase tracking-wider opacity-80">Secure Payment</p>
          <p className="text-2xl font-bold mt-1">₹{booking.total_amount?.toLocaleString()}</p>
          <p className="text-sm opacity-80">{booking.care_type} · {booking.shift} shift</p>
        </div>

        <div className="p-6">
          {step === 'done' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-lg font-semibold text-green-700">Payment Successful!</p>
              <p className="text-sm text-slate-500 mt-1">Your booking has been confirmed.</p>
            </div>
          ) : step === 'processing' ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Processing payment…</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="label">Cardholder Name</label>
                  <input className="input" placeholder="Priya Sharma" value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Card Number</label>
                  <input className="input" placeholder="4242 4242 4242 4242" maxLength={19}
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label">Expiry</label>
                    <input className="input" placeholder="MM/YY" maxLength={5}
                      value={card.expiry}
                      onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} />
                  </div>
                  <div className="w-28">
                    <label className="label">CVV</label>
                    <input className="input" placeholder="123" maxLength={3} type="password"
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <p className="text-xs text-slate-400 text-center">🔒 Demo only — no real charge will be made</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePay} className="btn-primary flex-1">Pay ₹{booking.total_amount?.toLocaleString()}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
