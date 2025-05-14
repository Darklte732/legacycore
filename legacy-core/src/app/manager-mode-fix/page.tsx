'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ManagerModeFix() {
  const [status, setStatus] = useState('Setting up manager mode...')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function setupManagerMode() {
      try {
        // First clear any problematic cookies
        document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Clear localStorage to remove any cached UI state
        localStorage.clear();
        
        // Wait a moment for cookies to clear
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Explicitly set the test_role cookie to manager
        document.cookie = "test_role=manager; path=/; max-age=86400";
        document.cookie = "force_manager_view=true; path=/; max-age=86400";

        // Get user session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Update user metadata to ensure role is manager
          await supabase.auth.updateUser({
            data: { role: 'manager' }
          });
          
          // Also update the profiles table to ensure consistency
          await supabase
            .from('profiles')
            .update({ role: 'manager' })
            .eq('id', session.user.id);
          
          setStatus('Manager mode set successfully! Redirecting...')
          
          // Redirect to manager dashboard after a brief delay
          setTimeout(() => {
            // Add time parameter to prevent caching
            window.location.href = '/manager/dashboard?t=' + Date.now()
          }, 1500)
        } else {
          setError('No active session. Please login first.')
        }
      } catch (err) {
        console.error('Error setting manager mode:', err)
        setError('Failed to set manager mode: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
    
    setupManagerMode()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">LegacyCore Manager Mode</h1>
        
        <div className={`p-4 mb-6 rounded ${error ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
          {error || status}
        </div>
        
        {!error && (
          <p className="text-gray-600 mb-4">
            Switching to manager mode and fixing UI issues...
          </p>
        )}
        
        <div className="space-y-4">
          <Link 
            href="/manager/dashboard"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded"
          >
            Go to Manager Dashboard
          </Link>
          
          <Link 
            href="/login"
            className="block w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white text-center rounded"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
} 