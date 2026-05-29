import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import api from '../../api/axios'

export default function CaregiverRaiseTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ subject: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const { data } = await api.post('/tickets', form)
      navigate(`/caregiver/tickets/${data.id}`)
    } catch (e) { setErr(e.response?.data?.error || 'Failed') }
    finally { setBusy(false) }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <button onClick={() => navigate('/caregiver/tickets')} className="text-sm text-slate-500 hover:text-brand-600 mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Raise a Support Ticket</h1>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={set('subject')} required /></div>
            <div><label className="label">Description</label><textarea className="input resize-none" rows={5} value={form.description} onChange={set('description')} required /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/caregiver/tickets')} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Submitting…' : 'Submit Ticket'}</button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
