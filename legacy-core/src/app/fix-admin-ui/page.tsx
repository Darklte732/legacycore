'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function FixAdminUI() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    // Clear cookies that cause the double UI issue
    document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setStatus('Cookies cleared successfully');
    
    // Set a timeout to redirect to admin dashboard
    const timer = setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Fixing Admin UI</h1>
        
        <div className="p-4 mb-6 bg-blue-50 text-blue-700 rounded">
          {status}
        </div>
        
        <p className="text-gray-600 mb-4">
          Redirecting to Admin Dashboard...
        </p>
        
        <Link 
          href="/admin/dashboard"
          className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded"
        >
          Go to Admin Dashboard Now
        </Link>
      </div>
    </div>
  )
} 