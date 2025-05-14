import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from './useRole'
import { AgentApplication } from '@/types/application'

export const useAgentApplications = () => {
  const [applications, setApplications] = useState<AgentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { role } = useRole()
  const supabase = createClient()

  useEffect(() => {
    const fetchApplications = async () => {
      if (!role || role !== 'agent') return

      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('No active session found')
        }

        // Join with carriers table to get carrier name
        const { data, error } = await supabase
          .from('agent_applications')
          .select(`
            *,
            carrier:carriers(name)
          `)
          .eq('agent_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        // Transform data to include carrier_name
        const formattedData = data?.map(app => ({
          ...app,
          carrier_name: app.carrier ? app.carrier.name : null
        })) as AgentApplication[]

        setApplications(formattedData || [])
      } catch (err) {
        console.error('Error fetching agent applications:', err)
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [supabase, role])

  // Function to add a new application
  const addApplication = async (application: Omit<AgentApplication, 'id' | 'agent_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session found')
      }

      const { data, error } = await supabase
        .from('agent_applications')
        .insert({
          ...application,
          agent_id: session.user.id,
        })
        .select()

      if (error) {
        throw error
      }

      // Refresh applications list
      const { data: updatedData, error: fetchError } = await supabase
        .from('agent_applications')
        .select(`
          *,
          carrier:carriers(name)
        `)
        .eq('agent_id', session.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform data to include carrier_name
      const formattedData = updatedData?.map(app => ({
        ...app,
        carrier_name: app.carrier ? app.carrier.name : null
      })) as AgentApplication[]

      setApplications(formattedData || [])
      return data
    } catch (err) {
      console.error('Error adding application:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update an existing application
  const updateApplication = async (id: string, updates: Partial<AgentApplication>) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('agent_applications')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }

      // Refresh applications list
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session found')
      }

      const { data: updatedData, error: fetchError } = await supabase
        .from('agent_applications')
        .select(`
          *,
          carrier:carriers(name)
        `)
        .eq('agent_id', session.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform data to include carrier_name
      const formattedData = updatedData?.map(app => ({
        ...app,
        carrier_name: app.carrier ? app.carrier.name : null
      })) as AgentApplication[]

      setApplications(formattedData || [])
      return data
    } catch (err) {
      console.error('Error updating application:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete an application
  const deleteApplication = async (id: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('agent_applications')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Update the local state
      setApplications(applications.filter(app => app.id !== id))
      
    } catch (err) {
      console.error('Error deleting application:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication
  }
} 