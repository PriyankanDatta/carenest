import React from 'react'

const MAP = {
  // booking
  pending:     'bg-amber-100 text-amber-800',
  confirmed:   'bg-brand-100 text-brand-800',
  in_progress: 'bg-teal-100 text-teal-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-red-100 text-red-800',
  // ticket
  open:        'bg-amber-100 text-amber-800',
  resolved:    'bg-green-100 text-green-800',
  // payment
  paid:        'bg-green-100 text-green-800',
  // user
  active:      'bg-green-100 text-green-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  suspended:   'bg-red-100 text-red-800',
  // approval
  approved:    'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }) {
  const cls = MAP[status] || 'bg-slate-100 text-slate-700'
  const label = status?.replace(/_/g, ' ')
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  )
}
