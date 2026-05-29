import React, { useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../api/axios'

export default function ManageCaregivers() {
  const [roster, setRoster]   = useState([])
  const [loading, setLoading] = useState(true)
  const [cgId, setCgId]       = useState('')
  const [adding, setAdding]   = useState(false)
  const [err, setErr]         = useState('')
  const [msg, setMsg]         = useState('')

  const load = () => api.get('/agency/roster').then(r => setRoster(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!cgId.trim()) return
    setAdding(true); setErr(''); setMsg('')
    try {
      await api.post('/agency/roster', { caregiver_user_id: parseInt(cgId) })
      setMsg('Caregiver added successfully')
      setCgId('')
      load()
    } catch (e) { setErr(e.response?.data?.error || 'Failed to add') }
    finally { setAdding(false) }
  }

  const remove = async (userId) => {
    if (!window.confirm('Remove this caregiver from your roster?')) return
    await api.delete(`/agency/roster/${userId}`)
    load()
  }

  return (
    <AppShell>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Caregivers</h1>

        {/* Add */}
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">Add Caregiver to Roster</h2>
          <p className="text-sm text-slate-500 mb-3">Enter the user ID of an independent caregiver to add them to your agency roster.</p>
          <div className="flex gap-3">
            <input className="input w-48" type="number" placeholder="Caregiver User ID" value={cgId} onChange={e => setCgId(e.target.value)} />
            <button onClick={add} disabled={adding} className="btn-primary">{adding ? 'Adding…' : 'Add to Roster'}</button>
          </div>
          {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
          {msg && <p className="text-sm text-green-600 mt-2">✓ {msg}</p>}
        </div>

        {/* Roster list */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Current Roster ({roster.length})</h2>
          {loading ? <LoadingSpinner /> : roster.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No caregivers yet. Add one above.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {roster.map(cg => (
                <div key={cg.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <img src={cg.profile_photo_url} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-slate-900">{cg.name}</p>
                      <p className="text-sm text-slate-500">{cg.city} · {cg.experience_years} yrs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(cg.care_types || []).map(ct => (
                          <span key={ct} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{ct}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={cg.approval_status} />
                    <span className="text-sm text-slate-500">ID: {cg.user_id}</span>
                    <button onClick={() => remove(cg.user_id)} className="btn-danger text-xs px-3 py-1.5">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
