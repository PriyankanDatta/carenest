import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../common/StatusBadge'
import api from '../../api/axios'

export default function TicketThread({ ticket, replies, onRefresh, showStatusControl }) {
  const { user } = useAuth()
  const [msg, setMsg]     = useState('')
  const [busy, setBusy]   = useState(false)
  const [status, setStatus] = useState(ticket?.status)

  const sendReply = async () => {
    if (!msg.trim()) return
    setBusy(true)
    try {
      await api.post(`/tickets/${ticket.id}/reply`, { message: msg.trim() })
      setMsg('')
      onRefresh()
    } finally { setBusy(false) }
  }

  const changeStatus = async (s) => {
    await api.put(`/tickets/${ticket.id}/status`, { status: s })
    setStatus(s)
    onRefresh()
  }

  if (!ticket) return null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{ticket.subject}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Raised by <span className="font-medium">{ticket.created_by_name}</span> · {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            {showStatusControl && status !== 'resolved' && (
              <select
                className="input w-40 text-sm"
                value={status}
                onChange={e => changeStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            )}
          </div>
        </div>
        {/* Original message */}
        <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
          <p className="text-sm text-slate-700">{ticket.description}</p>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 space-y-3 overflow-y-auto mb-4">
        {replies.map(r => {
          const isMe = r.user_id === user?.id
          return (
            <div key={r.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                isMe
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-brand-100' : 'text-brand-600'}`}>
                  {r.author_name}
                  {r.author_role === 'admin' && (
                    <span className="ml-2 bg-brand-800 text-brand-200 text-xs px-1.5 rounded">Admin</span>
                  )}
                </p>
                <p className="text-sm">{r.message}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                  {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {replies.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No replies yet.</p>
        )}
      </div>

      {/* Reply box */}
      {status !== 'resolved' && (
        <div className="card flex gap-3 items-end">
          <textarea
            className="input flex-1 resize-none"
            rows={2}
            placeholder="Type your reply…"
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
          />
          <button onClick={sendReply} disabled={busy || !msg.trim()} className="btn-primary px-6">
            {busy ? '…' : 'Send'}
          </button>
        </div>
      )}
      {status === 'resolved' && (
        <div className="card text-center text-sm text-slate-500">
          ✅ This ticket has been resolved and is now closed.
        </div>
      )}
    </div>
  )
}
