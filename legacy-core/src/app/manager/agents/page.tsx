'use client'

import React, { useState, useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

export default function ManagerAgents() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgents() {
      const { data: currentUser } = await supabase.auth.getUser()
      
      if (!currentUser?.user?.id) return
      
      // Get all agents assigned to this manager
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .eq('role', 'agent')
        .eq('manager_id', currentUser.user.id)
        .order('first_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching agents:', error)
        return
      }
      
      setAgents(data || [])
      setLoading(false)
    }
    
    if (!roleLoading) {
      fetchAgents()
    }
  }, [roleLoading, supabase])

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Agent Management
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Agents List</h2>
        {loading ? (
          <p>Loading agents...</p>
        ) : agents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agent.first_name} {agent.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agent.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agent.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            No agents are currently assigned to you.
          </p>
        )}
      </div>
    </div>
  )
} 