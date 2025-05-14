'use client'

import React, { useState, useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Building2 } from 'lucide-react'

export default function ManagerCarriersPage() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCarriers() {
      // Fetch carriers from the database
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching carriers:', error)
        return
      }
      
      setCarriers(data || [])
      setLoading(false)
    }
    
    if (!roleLoading) {
      fetchCarriers()
    }
  }, [roleLoading, supabase])

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Carrier Management
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Carriers List</h2>
        {loading ? (
          <p>Loading carriers...</p>
        ) : carriers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {carriers.map((carrier) => (
                  <tr key={carrier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carrier.name || 'Unnamed Carrier'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carrier.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {carrier.rating || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        carrier.status === 'active' ? 'bg-green-100 text-green-800' :
                        carrier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        carrier.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {carrier.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            No carriers are currently available. Carriers will be displayed here once added.
          </p>
        )}
      </div>
    </div>
  )
} 