import React, { useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function Approvals() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState({})
  const [msgs, setMsgs]       = useState({})

  const load = () => api.get('/admin/approvals').then(r => setPending(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    setBusy(b => ({ ...b, [id]: true }))
    await api.put(`/admin/approvals/${id}`, { action })
    setMsgs(m => ({ ...m, [id]: action === 'approve' ? 'Approved ✓' : 'Rejected' }))
    setBusy(b => ({ ...b, [id]: false }))
    load()
  }

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Pending Approvals</h1>

        {loading ? <LoadingSpinner /> : pending.length === 0 ? (
          <div className="card text-center py-16">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="text-slate-500 font-medium">All caught up — no pending registrations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(u => (
              <div key={u.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'caregiver' ? 'bg-teal-100 text-teal-700' : 'bg-brand-100 text-brand-700'}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{u.email} · {u.phone}</p>
                    <p className="text-xs text-slate-400 mt-0.5">📍 {u.city} · Applied {new Date(u.created_at).toLocaleDateString()}</p>

                    {u.role === 'caregiver' && u.profile && (
                      <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                        <p><span className="text-slate-400">Experience:</span> <span className="font-medium">{u.profile.experience_years} years</span></p>
                        <p><span className="text-slate-400">Daily rate:</span> <span className="font-medium">₹{u.profile.daily_rate?.toLocaleString()}/day</span></p>
                        <p><span className="text-slate-400">Care types:</span> <span className="font-medium">{(u.profile.care_types || []).join(', ') || '—'}</span></p>
                        <p><span className="text-slate-400">Bio:</span> <span className="text-slate-600">{u.profile.bio || '—'}</span></p>
                      </div>
                    )}

                    {u.role === 'agency' && u.profile && (
                      <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm">
                        <p><span className="text-slate-400">Agency:</span> <span className="font-medium">{u.profile.agency_name}</span></p>
                        <p><span className="text-slate-400">Bio:</span> <span className="text-slate-600">{u.profile.bio || '—'}</span></p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end min-w-[140px]">
                    {msgs[u.id] ? (
                      <p className={`text-sm font-medium ${msgs[u.id].includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{msgs[u.id]}</p>
                    ) : (
                      <>
                        <button disabled={busy[u.id]} onClick={() => act(u.id, 'approve')} className="btn-primary w-full text-sm">✓ Approve</button>
                        <button disabled={busy[u.id]} onClick={() => act(u.id, 'reject')}  className="btn-danger w-full text-sm">✗ Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
