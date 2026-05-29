import React from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function AppShell({ children }) {
  const { user } = useAuth()

  // Pending-approval banner
  const showBanner = user?.status === 'pending_approval'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {showBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2">
            <span className="text-amber-600 text-sm font-medium">
              ⏳ Your account is pending approval by the CareNest admin. Some features may be restricted until approved.
            </span>
          </div>
        )}
        <main className="flex-1 p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
