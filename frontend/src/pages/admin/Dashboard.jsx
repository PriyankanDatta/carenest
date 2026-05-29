import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/common/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

function KPI({ label, value, sub, color = 'brand', icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <AppShell><LoadingSpinner /></AppShell>

  return (
    <AppShell>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <KPI label="Total Users"        value={stats.totalUsers}       icon="👥" color="brand" />
          <KPI label="Pending Approvals"  value={stats.pendingApprovals} icon="⏳" color="amber"
            sub={stats.pendingApprovals > 0 ? 'Need review' : 'All clear'} />
          <KPI label="Total Bookings"     value={stats.totalBookings}    icon="📋" color="teal" />
          <KPI label="Active Bookings"    value={stats.activeBookings}   icon="✅" color="green" />
          <KPI label="Open Tickets"       value={stats.openTickets}      icon="🎫" color="red" />
          <KPI label="Total Revenue"      value={`₹${stats.totalRevenue?.toLocaleString()}`} icon="💰" color="brand" sub="Paid bookings" />
        </div>

        {/* Quick actions */}
        {stats.pendingApprovals > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <p className="text-amber-800 font-medium">⏳ {stats.pendingApprovals} registration{stats.pendingApprovals > 1 ? 's' : ''} pending approval</p>
            <Link to="/admin/approvals" className="btn-primary text-sm">Review Now →</Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Recent bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-sm text-brand-600 hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{b.customer_name} → {b.caregiver_name}</p>
                    <p className="text-xs text-slate-400">{b.care_type} · ₹{b.total_amount?.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent tickets */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
              <Link to="/admin/tickets" className="text-sm text-brand-600 hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentTickets.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.subject}</p>
                    <p className="text-xs text-slate-400">{t.created_by_name}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
