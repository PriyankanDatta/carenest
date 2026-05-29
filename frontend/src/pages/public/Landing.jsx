import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'

const STEPS = [
  { icon: '🔍', title: 'Browse Caregivers', desc: 'Filter by city, care type, and shift to find the right match for your family.' },
  { icon: '📅', title: 'Book a Slot',       desc: 'Select dates and shifts, then complete a quick mock payment to confirm.' },
  { icon: '🏠', title: 'Care Delivered',    desc: 'Your verified caregiver arrives at home — tracked and managed end-to-end.' },
]

const SERVICES = [
  { icon: '👴', label: 'Elderly Care' },
  { icon: '🏥', label: 'Post-Surgery Care' },
  { icon: '🧘', label: 'Physiotherapy' },
  { icon: '🏡', label: 'House Help' },
  { icon: '🌙', label: 'Night Duty' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
          <span className="bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full">
            🇮🇳 Serving Bangalore &amp; Delhi
          </span>
          <h1 className="text-5xl font-bold leading-tight max-w-3xl">
            Professional Home Care,<br />Right at Your Doorstep
          </h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            CareNest connects families with verified nurses and caregivers for elderly
            care, post-surgery recovery, and more — on your schedule.
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => navigate('/customer/browse')}
              className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors text-base shadow-lg"
            >
              Browse Caregivers →
            </button>
            <Link
              to="/register"
              className="border border-white/50 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              Join as a Caregiver
            </Link>
          </div>
          <div className="flex gap-8 mt-8 text-center">
            {[['200+','Caregivers'], ['50+','Agencies'], ['1000+','Families Served'], ['4.8★','Average Rating']].map(([n, l]) => (
              <div key={l}>
                <p className="text-3xl font-bold">{n}</p>
                <p className="text-brand-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Services We Offer</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {SERVICES.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2 bg-teal-50 rounded-2xl px-8 py-6 w-40 hover:bg-teal-100 transition-colors cursor-default">
              <span className="text-4xl">{s.icon}</span>
              <span className="text-sm font-medium text-teal-800 text-center">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
                  {s.icon}
                </div>
                <div className="w-8 h-8 bg-brand-100 text-brand-700 font-bold text-sm rounded-full flex items-center justify-center mx-auto -mt-6 mb-4 relative z-10">{i+1}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary px-10 py-3 text-base"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* Browse CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-brand-600 to-teal-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Find a Caregiver in Your City</h2>
          <p className="text-brand-100 mb-8">Hundreds of verified professionals ready to help in Bangalore and Delhi.</p>
          <button
            onClick={() => navigate('/customer/browse')}
            className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Browse All Caregivers
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © 2026 CareNest · Demo Application · Bangalore &amp; Delhi
      </footer>
    </div>
  )
}
