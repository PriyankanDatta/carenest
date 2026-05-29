import React from 'react'

const CITIES     = ['', 'Bangalore', 'Delhi']
const CARE_TYPES = ['', 'Elderly Care', 'Post-Surgery Care', 'Physiotherapy Assistance', 'House Help', 'Night Duty']
const SHIFTS     = ['', 'Morning', 'Afternoon', 'Night', 'Full Day']

export default function FilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div className="flex gap-3 flex-wrap">
      <select className="input w-44 text-sm" value={filters.city} onChange={e => set('city', e.target.value)}>
        <option value="">All Cities</option>
        {CITIES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
      </select>
      <select className="input w-56 text-sm" value={filters.care_type} onChange={e => set('care_type', e.target.value)}>
        <option value="">All Care Types</option>
        {CARE_TYPES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
      </select>
      <select className="input w-44 text-sm" value={filters.shift} onChange={e => set('shift', e.target.value)}>
        <option value="">All Shifts</option>
        {SHIFTS.filter(Boolean).map(s => <option key={s}>{s}</option>)}
      </select>
    </div>
  )
}
