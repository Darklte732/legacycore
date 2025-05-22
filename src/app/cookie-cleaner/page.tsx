'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieCleaner() {
  const [status, setStatus] = useState('Clearing cookies...')

  useEffect(() => {
    try {
      // Clear all problematic cookies
      document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Verify
      const cookiesAfter = document.cookie;
      setStatus(`Cookies cleared successfully! Current cookies: ${cookiesAfter || 'None'}`);
    } catch (error) {
      setStatus(`Error clearing cookies: ${error.message}`);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Cookie Cleaner</h1>
        
        <div className="p-4 mb-6 bg-blue-50 text-blue-700 rounded">
          {status}
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/admin/dashboard"
            className="block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-center"
          >
            Go to Admin Dashboard
          </Link>
          
          <Link 
            href="/"
            className="block w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded text-center"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  )
} 