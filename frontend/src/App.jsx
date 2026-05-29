import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public
import Landing        from './pages/public/Landing'
import Login          from './pages/public/Login'
import Register       from './pages/public/Register'

// Customer
import CustomerDashboard    from './pages/customer/Dashboard'
import BrowseCaregivers     from './pages/customer/BrowseCaregivers'
import CaregiverProfile     from './pages/customer/CaregiverProfile'
import CustomerBookings     from './pages/customer/MyBookings'
import BookingDetail        from './pages/customer/BookingDetail'
import CustomerTickets      from './pages/customer/MyTickets'
import CustomerRaiseTicket  from './pages/customer/RaiseTicket'
import CustomerTicketDetail from './pages/customer/TicketDetail'

// Caregiver
import CaregiverDashboard   from './pages/caregiver/Dashboard'
import CaregiverProfile2    from './pages/caregiver/MyProfile'
import CaregiverBookings    from './pages/caregiver/MyBookings'
import CaregiverTickets     from './pages/caregiver/MyTickets'
import CaregiverRaiseTicket from './pages/caregiver/RaiseTicket'
import CaregiverTicketDetail from './pages/caregiver/TicketDetail'

// Agency
import AgencyDashboard      from './pages/agency/Dashboard'
import ManageCaregivers     from './pages/agency/ManageCaregivers'
import AgencyBookings       from './pages/agency/AgencyBookings'
import AgencyTickets        from './pages/agency/MyTickets'
import AgencyRaiseTicket    from './pages/agency/RaiseTicket'
import AgencyTicketDetail   from './pages/agency/TicketDetail'

// Admin
import AdminDashboard  from './pages/admin/Dashboard'
import Approvals       from './pages/admin/Approvals'
import AllUsers        from './pages/admin/AllUsers'
import AllBookings     from './pages/admin/AllBookings'
import TicketCenter    from './pages/admin/TicketCenter'

import ProtectedRoute from './components/common/ProtectedRoute'

const ROLE_HOME = {
  customer:  '/customer/dashboard',
  caregiver: '/caregiver/dashboard',
  agency:    '/agency/dashboard',
  admin:     '/admin/dashboard',
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Customer */}
      <Route element={<ProtectedRoute role="customer" />}>
        <Route path="/customer/dashboard"        element={<CustomerDashboard />} />
        <Route path="/customer/browse"           element={<BrowseCaregivers />} />
        <Route path="/customer/caregiver/:id"    element={<CaregiverProfile />} />
        <Route path="/customer/bookings"         element={<CustomerBookings />} />
        <Route path="/customer/bookings/:id"     element={<BookingDetail />} />
        <Route path="/customer/tickets"          element={<CustomerTickets />} />
        <Route path="/customer/tickets/new"      element={<CustomerRaiseTicket />} />
        <Route path="/customer/tickets/:id"      element={<CustomerTicketDetail />} />
      </Route>

      {/* Caregiver */}
      <Route element={<ProtectedRoute role="caregiver" />}>
        <Route path="/caregiver/dashboard"       element={<CaregiverDashboard />} />
        <Route path="/caregiver/profile"         element={<CaregiverProfile2 />} />
        <Route path="/caregiver/bookings"        element={<CaregiverBookings />} />
        <Route path="/caregiver/tickets"         element={<CaregiverTickets />} />
        <Route path="/caregiver/tickets/new"     element={<CaregiverRaiseTicket />} />
        <Route path="/caregiver/tickets/:id"     element={<CaregiverTicketDetail />} />
      </Route>

      {/* Agency */}
      <Route element={<ProtectedRoute role="agency" />}>
        <Route path="/agency/dashboard"          element={<AgencyDashboard />} />
        <Route path="/agency/caregivers"         element={<ManageCaregivers />} />
        <Route path="/agency/bookings"           element={<AgencyBookings />} />
        <Route path="/agency/tickets"            element={<AgencyTickets />} />
        <Route path="/agency/tickets/new"        element={<AgencyRaiseTicket />} />
        <Route path="/agency/tickets/:id"        element={<AgencyTicketDetail />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard"           element={<AdminDashboard />} />
        <Route path="/admin/approvals"           element={<Approvals />} />
        <Route path="/admin/users"               element={<AllUsers />} />
        <Route path="/admin/bookings"            element={<AllBookings />} />
        <Route path="/admin/tickets"             element={<TicketCenter />} />
        <Route path="/admin/tickets/:id"         element={<TicketCenter />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
