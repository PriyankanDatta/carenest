import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import TicketThread from '../../components/ticket/TicketThread'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function TicketCenter() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [tickets, setTickets]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')

  const loadList = () =>
    api.get('/admin/tickets', { params: filter ? { status: filter } : {} })
      .then(r => setTickets(r.data))
      .finally(() => setLoading(false))

  const loadTicket = (tid) =>
    api.get(`/tickets/${tid}`).then(r => setSelected(r.data))

  useEffect(() => { loadList() }, [filter])

  useEffect(() => {
    if (id) loadTicket(id)
  }, [id])

  const select = (t) => {
    navigate(`/admin/tickets/${t.id}`)
    loadTicket(t.id)
  }

  return (
    <AppShell>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Ticket Center</h1>

        <div className="grid grid-cols-5 gap-6" style={{ minHeight: '70vh' }}>
          {/* Ticket list */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              {['','open','in_progress','resolved'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-400'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                {tickets.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No tickets.</p>}
                {tickets.map(t => (
                  <button key={t.id} onClick={() => select(t)}
                    className={`w-full text-left card py-3 px-4 hover:shadow-md transition-all ${selected?.id === t.id ? 'ring-2 ring-brand-500' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{t.created_by_name} · {new Date(t.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thread */}
          <div className="col-span-3">
            {selected ? (
              <TicketThread
                ticket={selected}
                replies={selected.replies || []}
                onRefresh={() => { loadTicket(selected.id); loadList() }}
                showStatusControl={true}
              />
            ) : (
              <div className="card flex items-center justify-center h-full text-slate-400">
                <p>Select a ticket to view the thread</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
