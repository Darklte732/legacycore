'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function DebugPasswordResetPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const handleTest = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)
      console.log('Debug: Testing password reset for email:', email)
      
      const res = await resetPassword(email)
      console.log('Debug: Reset password result:', res)
      setResult(res)
    } catch (err: any) {
      console.error('Debug: Error testing password reset:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Debug Password Reset</h1>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Testing...' : 'Test Reset Password'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 