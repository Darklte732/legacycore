'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'

interface ApplicationDetail {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  client_state: string
  policy_type: string
  carrier_id: string
  carrier_name?: string
  face_amount: string
  premium: string
  status: string
  created_at: string
  updated_at: string
  agent_id: string
  agent_name?: string
}

export default function ApplicationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { role, loading: roleLoading } = useRole()
  
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch application data
  useEffect(() => {
    async function fetchApplicationData() {
      setIsLoading(true)
      try {
        // Fetch application with carrier data
        const applicationId = Array.isArray(id) ? id[0] : id;
        const { data, error } = await supabase
          .from('agent_applications')
          .select('*')
          .eq('id', applicationId)
          .single()
        
        if (error) throw error
        if (!data) throw new Error('Application not found')
        
        setApplication({
          id: data.id,
          client_name: data.proposed_insured || '',
          client_email: data.client_email || '',
          client_phone: data.client_phone_number || '',
          client_state: data.client_state || '',
          policy_type: data.product || '',
          carrier_id: data.carrier_id || '',
          carrier_name: data.carrier || 'Unknown',
          face_amount: data.face_amount || '',
          premium: (data.monthly_premium || 0).toString(),
          status: data.status || '',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          agent_id: data.agent_id || ''
        })
      } catch (error) {
        console.error('Error fetching application:', error)
        toast.error('Failed to load application details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchApplicationData()
    }
  }, [id, supabase])

  // Format currency
  const formatCurrency = (amount: string) => {
    const numeric = parseFloat(amount.replace(/[^0-9.]/g, ''))
    return new Intl.NumberFormat('en-US', { 
      style: 'currency',
      currency: 'USD'
    }).format(isNaN(numeric) ? 0 : numeric)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'underwriting': return 'bg-blue-100 text-blue-800'
      case 'declined': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <RoleBasedLayout
      requiredRole="agent"
      isLoading={roleLoading || isLoading}
      title="Application Details"
      description="View application information"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={() => {
              const applicationId = Array.isArray(id) ? id[0] : id;
              router.push(`/agent/applications/${applicationId}/edit`);
            }}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Application
          </Button>
        </div>

        {application && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="text-sm font-medium">{application.client_name}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm font-medium">{application.client_email}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-sm font-medium">{application.client_phone}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">State</div>
                  <div className="text-sm font-medium">{application.client_state}</div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Carrier</div>
                  <div className="text-sm font-medium">{application.carrier_name}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Policy Type</div>
                  <div className="text-sm font-medium">{application.policy_type}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Face Amount</div>
                  <div className="text-sm font-medium">{formatCurrency(application.face_amount)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Premium</div>
                  <div className="text-sm font-medium">{formatCurrency(application.premium)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Application ID</div>
                  <div className="text-sm font-medium break-all">{application.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Created Date</div>
                  <div className="text-sm font-medium">{formatDate(application.created_at)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium">{formatDate(application.updated_at)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  )
} 