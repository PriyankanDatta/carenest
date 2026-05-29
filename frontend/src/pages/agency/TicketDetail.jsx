import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import TicketThread from '../../components/ticket/TicketThread'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function AgencyTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => api.get(`/tickets/${id}`).then(r => setData(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  if (loading) return <AppShell><LoadingSpinner /></AppShell>
  return (
    <AppShell>
      <div className="max-w-3xl flex flex-col" style={{ minHeight: '75vh' }}>
        <button onClick={() => navigate('/agency/tickets')} className="text-sm text-slate-500 hover:text-brand-600 mb-4 flex items-center gap-1">← Back</button>
        {data ? <TicketThread ticket={data} replies={data.replies || []} onRefresh={load} showStatusControl={false} /> : <p className="text-red-500">Not found.</p>}
      </div>
    </AppShell>
  )
}
