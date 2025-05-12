'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, TEST_USERS } = useAuth()
  const supabase = createClient()

  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production'

  // Clear any errors when the component mounts or inputs change
  useEffect(() => {
    setError(null)
  }, [email, password])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      
      // The signIn function in useAuth.js will handle the redirect based on role
      // No need to do it here anymore
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  // Direct login without authentication (development mode only)
  const handleDevModeLogin = (role: 'admin' | 'manager' | 'agent') => {
    // Set test role cookie
    document.cookie = `test_role=${role}; path=/; max-age=3600`
    router.push('/')
  }

  // Login as a test user (works in both dev and production)
  const handleTestUserLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(`Signing in as ${email}...`)
    
    try {
      await signIn(email, password)
      // The signIn function handles the redirect
    } catch (error: any) {
      setError(`Login error: ${error.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  // Direct login for Manager (Z12 Astrology)
  const handleDirectManagerLogin = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage("Manager login: Authenticating...")
    
    try {
      // In production, we'll log in using Z12 Astrology credentials
      if (isProduction) {
        await signIn('z12astrology@gmail.com', 'Saint159753!!');
        return; // signIn will handle the redirect
      }
      
      // In development, we can use cookies
      document.cookie = "test_role=manager; path=/; max-age=86400";
      document.cookie = "force_manager_view=true; path=/; max-age=86400";
      
      setSuccessMessage("Cookies set! Redirecting to manager dashboard...");
      
      // Redirect to manager dashboard
      setTimeout(() => {
        window.location.href = '/manager/dashboard';
      }, 1000);
    } catch (error: any) {
      console.error('Error during direct manager login:', error);
      setError(`Login error: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white relative">
      {/* Back to Home button */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-2">
            <Image
              src="/logo.png"
              alt="LegacyCore Logo"
              width={80}
              height={80}
              className="mb-3"
            />
            <h1 className="text-3xl font-bold text-gray-900">LegacyCore</h1>
          </div>
          <p className="text-gray-600">Insurance Sales Platform</p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
          
          {/* Development Mode Logins */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 mb-4 text-center uppercase tracking-wider">Development Mode Only</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleDevModeLogin('admin')}
                  className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                >
                  Login as Admin
                </button>
                <button 
                  onClick={() => handleDevModeLogin('manager')}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Login as Manager
                </button>
                <button 
                  onClick={() => handleDevModeLogin('agent')}
                  className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  Login as Agent
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} LegacyCore. All rights reserved.
        </div>
      </div>
    </div>
  )
} 