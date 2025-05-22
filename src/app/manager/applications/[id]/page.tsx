'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Edit2, 
  Calendar, 
  Clipboard, 
  Shield, 
  Hash, 
  AlertTriangle
} from 'lucide-react'

export default function ApplicationViewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  
  useEffect(() => {
    async function fetchApplication() {
      const applicationId = Array.isArray(params.id) ? params.id[0] : params.id
      console.log('Fetching application with ID:', applicationId)
      
      try {
        const { data, error } = await supabase
          .from('agent_applications')
          .select('*')
          .eq('id', applicationId)
          .single()
        
        if (error) {
          console.error('Error fetching application data:', error)
          toast.error('Error loading application')
          setLoading(false)
          return
        }
        
        console.log('Application data loaded:', data)
        setApplication(data)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('Unexpected error occurred')
        setLoading(false)
      }
    }
    
    fetchApplication()
  }, [params.id, supabase])

  // Helper to get status styling
  const getStatusStyles = (status) => {
    switch(status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Live':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Not taken':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="mb-6">
        <Link
          href="/manager/applications"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-1 pl-2.5 hover:bg-slate-100 transition-all duration-200"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent shadow-lg"></div>
        </div>
      ) : application ? (
        <div className="animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-800 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-500" />
                {application.proposed_insured || 'Unnamed Client'}
              </h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                {application.policy_submit_date && (
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                    Submitted: {new Date(application.policy_submit_date).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="sm:ml-auto">
              <Link 
                href={`/manager/applications/${application.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 transition-all duration-200 flex items-center gap-2"
                )}
              >
                <Edit2 className="h-4 w-4" />
                Edit Application
              </Link>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
                <User className="h-5 w-5 text-blue-500" />
                Client Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="font-medium text-slate-800">{application.proposed_insured || 'Not Available'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <a href={`tel:${application.client_phone_number}`} className="text-blue-600 hover:underline">
                    {application.client_phone_number || 'Not provided'}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Email:</span>
                  {application.client_email ? (
                    <a href={`mailto:${application.client_email}`} className="text-blue-600 hover:underline">
                      {application.client_email}
                    </a>
                  ) : (
                    <span className="text-slate-600">Not provided</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">State:</span>
                  <span className="text-slate-800">{application.client_state || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Policy Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Carrier:</span>
                  <span className="font-medium text-slate-800">{application.carrier || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clipboard className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Product:</span>
                  <span className="text-slate-800">{application.product || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Policy #:</span>
                  <span className="text-slate-800 font-mono">{application.policy_number || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(application.status)}`}>
                    {application.status || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Financial Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Monthly Premium:</span>
                  <span className="font-medium text-slate-800">
                    ${parseFloat(application.monthly_premium || '0').toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Annual Premium:</span>
                  <span className="text-slate-800">${parseFloat(application.ap || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Manager Split:</span>
                  <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                    {application.split_percentage || '20'}%
                  </div>
                </div>

                {application.commission_amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-slate-500 font-medium">Commission:</span>
                    <span className="text-green-600 font-medium">${parseFloat(application.commission_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Notes
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg min-h-[100px]">
                {application.notes ? (
                  <p className="text-slate-700 whitespace-pre-line">
                    {application.notes}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">No notes available for this application.</p>
                )}
              </div>
            </div>
          </div>

          {/* Extra summary section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 border-b pb-2">
              <Clipboard className="h-5 w-5 text-blue-500" />
              Application Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Application ID</p>
                <p className="font-mono text-xs mt-1 text-slate-700 break-all">{application.id}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Created</p>
                <p className="font-medium mt-1 text-slate-700">
                  {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Last Updated</p>
                <p className="font-medium mt-1 text-slate-700">
                  {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Policy Health</p>
                <p className={`font-medium mt-1 ${
                  application.policy_health === 'Healthy' ? 'text-green-600' : 
                  application.policy_health === 'Cancelled' ? 'text-red-600' :
                  application.policy_health === 'Needs Attention' ? 'text-amber-600' :
                  'text-slate-700'
                }`}>
                  {application.policy_health || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl shadow-sm flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <p className="font-medium">No application found</p>
            <p className="text-sm mt-1">ID: {Array.isArray(params.id) ? params.id[0] : params.id}</p>
          </div>
        </div>
      )}
    </div>
  )
} 