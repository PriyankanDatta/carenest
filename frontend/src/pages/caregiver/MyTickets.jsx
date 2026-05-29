import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function CaregiverTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/tickets').then(r => setTickets(r.data)).finally(() => setLoading(false)) }, [])

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <Link to="/caregiver/tickets/new" className="btn-primary text-sm">+ Raise Ticket</Link>
        </div>
        {loading ? <LoadingSpinner /> : tickets.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400 mb-4">No tickets yet.</p>
            <Link to="/caregiver/tickets/new" className="btn-primary">Raise a Ticket</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <Link key={t.id} to={`/caregiver/tickets/${t.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-slate-900">{t.subject}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
