import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold text-brand-700">CareNest</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-slate-600">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-slate-600 hover:text-brand-600 font-medium">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
