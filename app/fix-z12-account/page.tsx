'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function FixZ12AccountPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fixAccount = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const response = await fetch('/api/agents/assign-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentEmail: 'booklovers159@gmail.com',
          managerEmail: 'z12astrology@gmail.com'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update agent manager')
      }
      
      setResult(data.message || 'Successfully updated agent manager')
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Fix Z12 Account</h1>
        
        <p className="mb-6 text-gray-600">
          This utility will assign the agent <strong>booklovers159@gmail.com</strong> to 
          be managed by the manager <strong>z12astrology@gmail.com</strong>.
        </p>
        
        <div className="flex justify-center mb-6">
          <Button 
            onClick={fixAccount} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Fix Account Assignment'}
          </Button>
        </div>
        
        {result && (
          <div className="p-4 bg-green-100 text-green-800 rounded-md mb-4">
            {result}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-6">
          After fixing the account, please refresh the manager dashboard to see the assigned agent.
        </p>
      </div>
    </div>
  )
} 