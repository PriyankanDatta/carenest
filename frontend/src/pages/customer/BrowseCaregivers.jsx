import React, { useEffect, useState, useCallback } from 'react'
import AppShell from '../../components/common/AppShell'
import CaregiverCard from '../../components/caregiver/CaregiverCard'
import FilterBar from '../../components/caregiver/FilterBar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../api/axios'

export default function BrowseCaregivers() {
  const [caregivers, setCaregivers] = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ city: '', care_type: '', shift: '' })
  const [page, setPage]             = useState(1)
  const LIMIT = 9

  const load = useCallback(async () => {
    setLoading(true)
    const params = { ...filters, page, limit: LIMIT }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    const { data } = await api.get('/caregivers', { params })
    setCaregivers(data.caregivers)
    setTotal(data.total)
    setLoading(false)
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const handleFilter = f => { setFilters(f); setPage(1) }

  return (
    <AppShell>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Browse Caregivers</h1>
        <p className="text-slate-500 mb-6">Find verified caregivers in Bangalore and Delhi.</p>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <FilterBar filters={filters} onChange={handleFilter} />
          <p className="text-sm text-slate-500">{total} caregiver{total !== 1 ? 's' : ''} found</p>
        </div>

        {loading ? <LoadingSpinner /> : caregivers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No caregivers match your filters. Try adjusting the search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              {caregivers.map(cg => <CaregiverCard key={cg.id} cg={cg} />)}
            </div>
            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center gap-3 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary">← Prev</button>
                <span className="flex items-center text-sm text-slate-600 px-3">Page {page} of {Math.ceil(total / LIMIT)}</span>
                <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="btn-secondary">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
