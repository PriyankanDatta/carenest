import React, { useEffect, useState, useCallback } from 'react'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function AllUsers() {
  const [users, setUsers]   = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [role, setRole]     = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)
  const [busy, setBusy]     = useState({})
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    const p = { page, limit: LIMIT }
    if (role)   p.role   = role
    if (status) p.status = status
    api.get('/admin/users', { params: p })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }, [role, status, page])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    setBusy(b => ({ ...b, [u.id]: true }))
    await api.put(`/admin/users/${u.id}`, { status: newStatus })
    setBusy(b => ({ ...b, [u.id]: false }))
    load()
  }

  return (
    <AppShell>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">All Users</h1>

        <div className="flex gap-3 mb-6">
          <select className="input w-40 text-sm" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
            <option value="">All Roles</option>
            {['customer','caregiver','agency','admin'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="input w-44 text-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            {['active','pending_approval','suspended'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <span className="text-sm text-slate-500 flex items-center">{total} users</span>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Name','Email','Role','City','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className="capitalize text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-500">{u.city || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          disabled={busy[u.id]}
                          onClick={() => toggleStatus(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > LIMIT && (
          <div className="flex justify-center gap-3 mt-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary">← Prev</button>
            <span className="flex items-center text-sm text-slate-600 px-3">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="btn-secondary">Next →</button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
