import React from 'react'

export default function WakingUp() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-5">
      <h1 className="text-4xl font-bold text-teal-600 tracking-tight">CareNest</h1>
      <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
      <p className="text-slate-600 text-base font-medium">
        Waking up the server, please wait a moment…
      </p>
      <p className="text-slate-400 text-sm">This only happens on the first visit</p>
    </div>
  )
}
