'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminFixSidebar() {
  const router = useRouter()
  const [status, setStatus] = useState('Fixing admin sidebar issue...')

  useEffect(() => {
    try {
      // Clear all problematic cookies
      document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Store a flag in localStorage to remember we've fixed this session
      localStorage.setItem('fixed_admin_sidebar', Date.now().toString())
      
      // Force page reload to apply cookie changes
      setStatus('Cookies cleared. Reloading admin page in 1 second...')
      
      // Redirect after a delay to let the cookies clear
      setTimeout(() => {
        window.location.href = '/admin/applications?fixed=' + Date.now()
      }, 1000)
    } catch (error) {
      setStatus(`Error fixing admin UI: ${error.message}`)
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Fixing Admin Sidebar</h1>
        
        <div className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          {status}
        </div>
        
        <div className="text-gray-600 text-sm">
          <p className="mb-2">This tool:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Clears cookies that may cause UI display issues</li>
            <li>Reloads the page with clean state</li>
            <li>Prevents double sidebars from appearing</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 