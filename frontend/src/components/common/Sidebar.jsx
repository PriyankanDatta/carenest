import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const MENUS = {
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard',         icon: '🏠' },
    { to: '/customer/browse',    label: 'Browse Caregivers', icon: '🔍' },
    { to: '/customer/bookings',  label: 'My Bookings',       icon: '📋' },
    { to: '/customer/tickets',   label: 'Support Tickets',   icon: '🎫' },
  ],
  caregiver: [
    { to: '/caregiver/dashboard', label: 'Dashboard',   icon: '🏠' },
    { to: '/caregiver/profile',   label: 'My Profile',  icon: '👤' },
    { to: '/caregiver/bookings',  label: 'My Bookings', icon: '📋' },
    { to: '/caregiver/tickets',   label: 'Support Tickets', icon: '🎫' },
  ],
  agency: [
    { to: '/agency/dashboard',   label: 'Dashboard',         icon: '🏠' },
    { to: '/agency/caregivers',  label: 'Manage Caregivers', icon: '👥' },
    { to: '/agency/bookings',    label: 'Bookings',          icon: '📋' },
    { to: '/agency/tickets',     label: 'Support Tickets',   icon: '🎫' },
  ],
  admin: [
    { to: '/admin/dashboard',  label: 'Dashboard',   icon: '📊' },
    { to: '/admin/approvals',  label: 'Approvals',   icon: '✅' },
    { to: '/admin/users',      label: 'All Users',   icon: '👥' },
    { to: '/admin/bookings',   label: 'All Bookings',icon: '📋' },
    { to: '/admin/tickets',    label: 'Ticket Center',icon: '🎫' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = MENUS[user?.role] || []

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-2">
        <span className="text-2xl">🏠</span>
        <span className="text-lg font-bold text-brand-700">CareNest</span>
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
        <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
