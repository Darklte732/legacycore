import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from './useRole'

interface Application {
  id: string
  client_name: string
  status: 'pending' | 'underwriting' | 'approved' | 'declined'
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { role, isManager } = useRole()
  const supabase = createClient()

  useEffect(() => {
    const fetchApplications = async () => {
      if (!role) return

      setLoading(true)

      let query = supabase.from('applications').select('*')

      // If user is an agent, only show their applications
      if (!isManager) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          query = query.eq('agent_id', session.user.id)
        }
      }

      const { data } = await query

      setApplications(data || [])
      setLoading(false)
    }

    fetchApplications()
  }, [supabase, role, isManager])

  return {
    applications,
    loading
  }
} 