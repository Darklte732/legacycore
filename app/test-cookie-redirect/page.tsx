'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TestCookiePage() {
  const [cookiesInfo, setCookiesInfo] = useState('Loading cookie information...')
  const [redirectResult, setRedirectResult] = useState('')

  useEffect(() => {
    // Read and display current cookies
    const allCookies = document.cookie
    setCookiesInfo(allCookies || 'No cookies found')
  }, [])

  const setCookieAndRedirect = () => {
    try {
      document.cookie = "test_role=manager; path=/; max-age=86400"
      document.cookie = "force_manager_view=true; path=/; max-age=86400"
      setRedirectResult('Cookies set successfully. Redirecting in 3 seconds...')
      
      // Update the cookie display
      const allCookies = document.cookie
      setCookiesInfo(allCookies || 'No cookies found')
      
      // Redirect after a delay
      setTimeout(() => {
        window.location.href = '/manager/dashboard'
      }, 3000)
    } catch (error) {
      setRedirectResult(`Error setting cookies: ${error.message}`)
    }
  }

  const clearCookies = () => {
    document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Update the cookie display
    const allCookies = document.cookie
    setCookiesInfo(allCookies || 'No cookies found')
    
    setRedirectResult('Cookies cleared successfully.')
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">Cookie Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="font-semibold mb-2">Current Cookies:</h2>
        <pre className="whitespace-pre-wrap break-all bg-white p-2 rounded border">
          {cookiesInfo}
        </pre>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={setCookieAndRedirect}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Set Manager Cookies & Redirect
        </button>
        
        <button 
          onClick={clearCookies}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Clear Cookies
        </button>
        
        <div className="mt-4">
          <Link 
            href="/manager/dashboard"
            className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-center"
          >
            Direct Link to Manager Dashboard
          </Link>
        </div>
      </div>
      
      {redirectResult && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          {redirectResult}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Try using different methods to access the manager dashboard:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Set cookies and redirect automatically</li>
          <li>Just use the direct link (which depends on middleware)</li>
          <li>Clear cookies first to test from a clean state</li>
        </ul>
      </div>
    </div>
  )
} 