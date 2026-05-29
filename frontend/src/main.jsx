import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import WakingUp from './components/common/WakingUp'
import './index.css'

const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`

function Root() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function ping() {
      while (!cancelled) {
        try {
          const res = await fetch(HEALTH_URL)
          if (res.ok) {
            if (!cancelled) setReady(true)
            return
          }
        } catch {}
        await new Promise(r => setTimeout(r, 3000))
      }
    }

    ping()
    return () => { cancelled = true }
  }, [])

  if (!ready) return <WakingUp />

  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
