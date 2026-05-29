import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const STARS = 4.5 // static demo rating

function Stars({ n = STARS }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(n) ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.172a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">{n.toFixed(1)}</span>
    </span>
  )
}

export default function CaregiverCard({ cg }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleBook = () => {
    if (!user) { navigate('/login'); return }
    navigate(`/customer/caregiver/${cg.user_id}`)
  }

  const handleView = () => navigate(`/customer/caregiver/${cg.user_id}`)

  return (
    <div className="card flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={cg.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cg.name)}&background=0ea5e9&color=fff&size=128`}
          alt={cg.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-base">{cg.name}</h3>
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
            {cg.agency_name && (
              <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{cg.agency_name}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">📍 {cg.city} · {cg.experience_years} yrs experience</p>
          <Stars />
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-brand-700">₹{cg.daily_rate?.toLocaleString()}</p>
          <p className="text-xs text-slate-400">/day</p>
        </div>
      </div>

      {/* Bio */}
      {cg.bio && (
        <p className="text-sm text-slate-600 line-clamp-2">{cg.bio}</p>
      )}

      {/* Care types */}
      <div className="flex flex-wrap gap-1.5">
        {(cg.care_types || []).map(ct => (
          <span key={ct} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-md font-medium">{ct}</span>
        ))}
      </div>

      {/* Shifts */}
      <div className="flex flex-wrap gap-1.5">
        {(cg.shifts || []).map(s => (
          <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md">{s}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
        <button onClick={handleView} className="btn-secondary flex-1 text-sm">View Profile</button>
        {user?.role === 'customer' && (
          <button onClick={handleBook} className="btn-primary flex-1 text-sm">Book Now</button>
        )}
      </div>
    </div>
  )
}
