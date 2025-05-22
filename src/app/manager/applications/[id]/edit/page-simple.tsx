'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function SimpleApplicationEdit() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  
  useEffect(() => {
    async function fetchApplication() {
      if (!id) return
      
      const applicationId = Array.isArray(id) ? id[0] : id
      console.log('Fetching application ID:', applicationId)
      
      try {
        // Direct query approach - simplest possible
        const { data, error } = await supabase
          .from('agent_applications')
          .select('*')
          .eq('id', applicationId)
          .single()
        
        if (error) {
          console.error('Error fetching application:', error)
          toast.error('Failed to load application')
          return
        }
        
        console.log('Application data:', data)
        setApplication(data)
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplication()
  }, [id, supabase])
  
  return (
    <div className="p-6">
      <Link href="/manager/applications" className="block mb-4">
        &larr; Back to Applications
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">
        Application Details
      </h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : application ? (
        <div>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="font-bold">Client: {application.proposed_insured}</p>
            <p>Carrier: {application.carrier}</p>
            <p>Policy Type: {application.product}</p>
            <p>Monthly Premium: ${application.monthly_premium}</p>
            <p>Status: {application.status}</p>
          </div>
          
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(application, null, 2)}
          </pre>
        </div>
      ) : (
        <div>No application found</div>
      )}
    </div>
  )
}