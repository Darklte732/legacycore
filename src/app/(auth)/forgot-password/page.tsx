'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Forgot password form submitted for email:', email);
      setLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      const result = await resetPassword(email)
      console.log('Reset password result:', result);
      
      if (result?.success) {
        setSuccessMessage(result.message)
        // Clear the form
        setEmail('')
      }
    } catch (err: any) {
      console.error('Error in forgot password component:', err)
      setError(err.message || 'An error occurred while sending the reset instructions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">LegacyCore</h1>
          <p className="text-gray-600">Life Insurance Management</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address associated with your account to receive password reset instructions.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 