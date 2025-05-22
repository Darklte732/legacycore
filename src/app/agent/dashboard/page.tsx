'use client'

import React, { useEffect, useState } from 'react'
import { FileText, CheckCircle2, Clock, Users, CalendarClock, MessageSquare, FileEdit, TrendingUp, DollarSign, AlertTriangle, AlertOctagon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'

// Define types for our data
interface Application {
  id: string
  agent_id: string
  proposed_insured: string
  carrier: string
  product_type: string
  face_amount: number
  premium: number
  status: string
  policy_health?: string
  commission_amount?: number
  created_at: string
  updated_at: string
  policy_submit_date?: string
  requirements_pending?: boolean
  payment_status?: string
  agent_split_percentage?: number
  first_month_paid?: boolean
  issued?: boolean
  issue_date?: string
  attention_reason?: string
}

interface Payment {
  id: string
  application_id: string
  month_number: number
  payment_status: string
  payment_date: string
}

interface CommissionPayment {
  id: string
  application_id: string
  amount: number
  status: string
  payment_date: string
}

interface DashboardStats {
  total: number
  approved: number
  pending: number
  clients: number
  commission: {
    total: number
    pending: number
    paid: number
  }
  healthyPolicies: number
  needsAttention: number
  critical: number
  attentionRequired: Application[]
}

export default function AgentDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>([])
  const [statistics, setStatistics] = useState<DashboardStats>({
    total: 0,
    approved: 0,
    pending: 0,
    clients: 0,
    commission: {
      total: 0,
      pending: 0,
      paid: 0
    },
    healthyPolicies: 0,
    needsAttention: 0,
    critical: 0,
    attentionRequired: []
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [commissionPeriod, setCommissionPeriod] = useState<'weekly' | 'monthly' | 'ytd'>('monthly')
  const supabase = createClient()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        
        if (!userId) {
          console.error("No user ID found")
          return
        }
        
        // Set user name from email or user profile
        const userEmail = session?.user?.email || ''
        
        // Try to get user profile for better name display
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', userId)
          .single()
          
        if (profileData?.first_name) {
          const fullName = profileData.last_name ? 
            `${profileData.first_name} ${profileData.last_name}` : 
            profileData.first_name;
          setUserName(fullName)
        } else {
          // Fallback to email username
          const emailName = userEmail?.split('@')[0] || 'Agent';
          // Capitalize first letter of each word and remove underscores
          const formattedName = emailName
            .split(/[_\.-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          setUserName(formattedName);
        }
        
        let applicationsData: Application[] = []
        let paymentsData: Payment[] = []
        let commissionData: CommissionPayment[] = []
        
        // Get all applications for this agent from all possible tables
        console.log("Fetching applications for agent ID:", userId)
        
        // First try agent_applications table
        const { data: agentAppsData, error: agentAppsError } = await supabase
          .from('agent_applications')
          .select('*')
          .eq('agent_id', userId)
          .order('created_at', { ascending: false })
        
        if (!agentAppsError && agentAppsData && agentAppsData.length > 0) {
          console.log(`Found ${agentAppsData.length} applications in agent_applications table`)
          // Check if any applications have commission data
          const appsWithCommission = agentAppsData.filter(app => app.commission_amount && app.commission_amount > 0)
          console.log(`Found ${appsWithCommission.length} applications with direct commission_amount data`)
          
          // Check paid status data
          const paidApps = agentAppsData.filter(app => app.paid_status === 'Paid')
          console.log(`Found ${paidApps.length} applications with paid_status = 'Paid'`)
          
          applicationsData = agentAppsData
        } else {
          // Try applications table
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .eq('agent_id', userId)
            .order('created_at', { ascending: false })
            
          if (!appsError && appsData && appsData.length > 0) {
            console.log(`Found ${appsData.length} applications in applications table`)
            applicationsData = appsData
          }
        }
        
        // Get all payment data for these applications
        if (applicationsData.length > 0) {
          try {
            const applicationIds = applicationsData.map(app => app.id)
            console.log(`Fetching payment data for ${applicationIds.length} applications`)
            
            const { data: paymentData } = await supabase
              .from('application_payments')
              .select('*')
              .in('application_id', applicationIds)
              
            if (paymentData && paymentData.length > 0) {
              console.log(`Found ${paymentData.length} payment records`)
              paymentsData = paymentData
            }
            
            // Get commission payment data
            const { data: commData } = await supabase
              .from('commission_payments')
              .select('*')
              .eq('agent_id', userId)
              
            if (commData && commData.length > 0) {
              console.log(`Found ${commData.length} commission payment records`)
              commissionData = commData
            }
          } catch (error) {
            console.error("Error fetching payment or commission data:", error)
          }
        }
        
        // Enhance applications with payment and attention data
        const enhancedApplications = enhanceApplicationsWithData(applicationsData, paymentsData, commissionData)
        setApplications(enhancedApplications)
        setCommissionPayments(commissionData)
        
        // Save this data to state to avoid refetching
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Add a new useEffect to update statistics when the commission period changes
  useEffect(() => {
    // Only recalculate if applications are already loaded
    if (applications.length > 0) {
      console.log(`Recalculating statistics for ${commissionPeriod} period...`)
      
      // Log some debug info about application data
      const appsWithCommission = applications.filter(app => 
        app.commission_amount && typeof app.commission_amount === 'number' && app.commission_amount > 0
      )
      console.log(`Applications with commission_amount (${appsWithCommission.length}):`, 
        appsWithCommission.map(a => ({name: a.proposed_insured, amount: a.commission_amount}))
      )
      
      // Calculate statistics based on the current commission period
      const stats = calculateStatistics(applications, commissionPayments)
      setStatistics(stats)
    }
  }, [commissionPeriod, applications, commissionPayments])
  
  // Enhance applications with payment and attention status
  const enhanceApplicationsWithData = (
    apps: Application[], 
    payments: Payment[], 
    commissions: CommissionPayment[]
  ): Application[] => {
    return apps.map(app => {
      // Check if first month is paid
      const appPayments = payments.filter(p => p.application_id === app.id)
      const firstMonthPayment = appPayments.find(p => p.month_number === 1)
      const hasFirstMonthPaid = firstMonthPayment?.payment_status === 'PAID'
      
      // Check if commission has been paid
      const hasCommissionPaid = commissions.some(c => 
        c.application_id === app.id && c.status === 'PAID'
      )
      
      // Determine if needs attention
      let attentionReason = ''
      
      if (app.requirements_pending) {
        attentionReason = 'Requirements pending for application approval'
      } else if (app.status === 'Approved' && !hasFirstMonthPaid) {
        attentionReason = 'First premium payment not received yet'
      } else if (app.issued && !hasCommissionPaid) {
        attentionReason = 'Commission payment pending for issued policy'
      } else if (app.policy_health === 'Needs Attention') {
        attentionReason = 'Policy health requires attention'
      } else if (app.policy_health === 'Critical') {
        attentionReason = 'Critical policy health issue requires immediate action'
      } else if (appPayments.some(p => p.payment_status === 'MISSED')) {
        attentionReason = 'Missed premium payment detected'
      } else if (appPayments.some(p => p.payment_status === 'NSF')) {
        attentionReason = 'Non-sufficient funds on premium payment'
      } else if (app.status === 'submitted' || app.status === 'Pending' || app.status === 'In Review') {
        attentionReason = 'Application pending carrier review'
      }
      
      // Do not override the original status with derived statuses for dashboard display
      // We want to keep the actual application status as stored in the database
      return {
        ...app,
        first_month_paid: hasFirstMonthPaid,
        attention_reason: attentionReason || undefined
      }
    })
  }
  
  // Calculate all statistics from applications data
  const calculateStatistics = (
    apps: Application[], 
    commissionPayments: CommissionPayment[]
  ): DashboardStats => {
    // Count unique clients
    const uniqueClients = new Set(apps.map(app => app.proposed_insured.toLowerCase()))
    
    // Count policy health statuses
    const healthyPolicies = apps.filter(app => app.policy_health === 'Healthy').length
    
    // Update to only show applications with policy_health = "Needs Attention"
    const needsAttention = apps.filter(app => app.policy_health === 'Needs Attention').length
    
    const critical = apps.filter(app => app.policy_health === 'Critical').length
    
    // Calculate total commissions with true commission tracking
    let totalCommission = 0
    let pendingCommission = 0
    let paidCommission = 0
    let usingRealCommissionData = false
    
    // Get date boundaries for the selected time period
    const now = new Date()
    let startDate: Date;
    
    switch (commissionPeriod) {
      case 'weekly':
        // Start from the beginning of the current week (Sunday)
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        // Start from the beginning of the current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'ytd':
        // Start from January 1st of the current year
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }
    
    // Use actual commission payments data
    if (commissionPayments && commissionPayments.length > 0) {
      // Filter commission payments by date if not using all-time
      const filteredCommissionPayments = commissionPayments.filter(payment => {
        if (payment.payment_date) {
          const paymentDate = new Date(payment.payment_date)
          return paymentDate >= startDate
        }
        return false
      })
      
      paidCommission = filteredCommissionPayments
        .filter(c => c.status === 'PAID')
        .reduce((sum, c) => sum + (c.amount || 0), 0)
        
      pendingCommission = filteredCommissionPayments
        .filter(c => c.status === 'PENDING')
        .reduce((sum, c) => sum + (c.amount || 0), 0)
        
      totalCommission = paidCommission + pendingCommission
      
      if (totalCommission > 0) {
        usingRealCommissionData = true
        console.log(`Using real commission data (${commissionPeriod}):`, {totalCommission, paidCommission, pendingCommission})
      }
    }
    
    // If no commission data from payments, calculate from applications
    if (totalCommission === 0) {
      // Calculate commissions directly from application data instead of using mock values
      console.log('Calculating actual commissions from application data');
      
      // Filter applications with valid commission_amount
      const appsWithCommission = apps.filter(app => 
        app.commission_amount && typeof app.commission_amount === 'number' && app.commission_amount > 0
      );
      
      if (appsWithCommission.length > 0) {
        console.log(`Found ${appsWithCommission.length} apps with direct commission_amount`);
        
        // Sum the actual commission_amount values
        totalCommission = appsWithCommission.reduce((sum, app) => sum + (app.commission_amount || 0), 0);
        
        // Calculate paid vs pending based on paid_status
        paidCommission = appsWithCommission
          .filter(app => app.paid_status === 'Paid')
          .reduce((sum, app) => sum + (app.commission_amount || 0), 0);
          
        pendingCommission = totalCommission - paidCommission;
      } else {
        // For apps without commission_amount, calculate based on premium
        const appsWithPremium = apps.filter(app => app.premium && app.premium > 0);
        
        if (appsWithPremium.length > 0) {
          console.log(`Calculating commissions for ${appsWithPremium.length} apps with premium data`);
          
          // Sum commissions: premium * 9 * 0.5 (monthly premium to annual times agent cut)
          totalCommission = appsWithPremium.reduce((sum, app) => {
            const monthlyPremium = app.premium || 0;
            const commission = monthlyPremium * 9 * 0.5;
            return sum + commission;
          }, 0);
          
          // Calculate paid vs pending based on status
          paidCommission = appsWithPremium
            .filter(app => app.paid_status === 'Paid' && 
              (app.status === 'Approved' || app.status === 'Live' || app.status === '1st Month Paid'))
            .reduce((sum, app) => {
              const monthlyPremium = app.premium || 0;
              return sum + (monthlyPremium * 9 * 0.5);
            }, 0);
            
          pendingCommission = totalCommission - paidCommission;
        }
      }
      
      console.log(`Calculated actual commissions: total=$${totalCommission.toFixed(2)}, paid=$${paidCommission.toFixed(2)}, pending=$${pendingCommission.toFixed(2)}`);
    }

    // Remove fallback mock calculation ratios
    if (!usingRealCommissionData && totalCommission > 0) {
      // We'll keep the original calculated values instead of using mock ratios
      console.log('Using actual calculated commission values without applying mock ratios');
    }
    
    // Find applications that need attention - Only with policy_health = "Needs Attention"
    const attentionRequired = apps
      .filter(app => app.policy_health === 'Needs Attention')
      .sort((a, b) => {
        // Sort by status priority
        const statusOrder = {
          'Critical': 1,
          'Approved': 2,
          'Pending': 3,
          'submitted': 4,
          'In Review': 5
        }
        
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 10
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 10
        
        // First sort by status priority
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        
        // Then sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    
    return {
      total: apps.length,
      approved: apps.filter(app => 
        (app.status === 'Approved' || app.status === 'Live' || app.status === '1st Month Paid') && 
        app.paid_status === 'Paid'
      ).length,
      pending: apps.filter(app => 
        app.status === 'Pending' || 
        app.status === 'In Review' || 
        app.status === 'submitted'
      ).length,
      clients: uniqueClients.size,
      commission: {
        total: totalCommission,
        pending: pendingCommission,
        paid: paidCommission
      },
      healthyPolicies,
      needsAttention,
      critical,
      attentionRequired
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Format currency 
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Get application status tag styles
  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved':
      case 'issued & paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'in review':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'declined':
      case 'canceled':
      case 'cancelled':
      case 'freelook':
        return 'bg-red-100 text-red-800'
      case '1st month paid':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="px-2 md:px-4 py-8">
        <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {userName === 'Admin User' ? 'Agent' : userName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your applications</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Applications</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Issued & Paid</p>
            <p className="text-2xl font-bold">{statistics.approved}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Needs Attention</p>
            <p className="text-2xl font-bold">{statistics.attentionRequired.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-3">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Est. Commissions</p>
              <p className="text-2xl font-bold text-purple-700">${statistics.commission.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-1 mb-3">
            <span className="text-green-600 font-semibold">${statistics.commission.paid.toFixed(2)} paid</span>
            {statistics.commission.pending > 0 && (
              <span className="text-yellow-600 font-semibold">${statistics.commission.pending.toFixed(2)} pending</span>
            )}
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${statistics.commission.total > 0 ? Math.round((statistics.commission.paid / statistics.commission.total) * 100) : 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-right text-gray-500">
              {statistics.commission.total > 0 ? Math.round((statistics.commission.paid / statistics.commission.total) * 100) : 0}% collected
            </div>
          </div>
          
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-gray-500 mb-2">Commission Period:</p>
            <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
              <button 
                onClick={() => setCommissionPeriod('weekly')}
                className={`text-xs py-1 px-3 rounded-full flex-1 transition-colors ${
                  commissionPeriod === 'weekly' 
                    ? 'bg-blue-500 text-white font-semibold shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setCommissionPeriod('monthly')}
                className={`text-xs py-1 px-3 rounded-full flex-1 transition-colors ${
                  commissionPeriod === 'monthly' 
                    ? 'bg-blue-500 text-white font-semibold shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setCommissionPeriod('ytd')}
                className={`text-xs py-1 px-3 rounded-full flex-1 transition-colors ${
                  commissionPeriod === 'ytd' 
                    ? 'bg-blue-500 text-white font-semibold shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                YTD
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications That Need Attention */}
        {statistics.attentionRequired.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow mb-6">
            <div className="border-b px-6 py-4 flex items-center justify-between bg-amber-50">
              <div className="flex items-center">
                <AlertOctagon className="h-5 w-5 text-amber-600 mr-2" />
                <h2 className="text-lg font-medium text-amber-800">Applications Needing Attention</h2>
              </div>
            </div>
            
            <div className="divide-y">
              {statistics.attentionRequired.map((app) => (
                <Link 
                  key={app.id} 
                  href={`/agent/applications/${app.id}`}
                  className="block hover:bg-amber-50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <AlertTriangle className="h-10 w-10 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">{app.proposed_insured}</p>
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500">
                            {app.carrier || 'Unknown carrier'} 
                            {app.product_type && ` - ${app.product_type}`}
                            {app.premium && ` - ${formatCurrency(app.premium)}/mo`}
                          </p>
                          {app.attention_reason && (
                            <p className="text-sm text-amber-600 font-medium mt-1">{app.attention_reason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(app.policy_submit_date || app.created_at)}</p>
                      <p className="text-xs mt-1">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-amber-100 text-amber-800">
                          Needs Attention
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              
              {statistics.attentionRequired.length > 0 && (
                <div className="px-6 py-2 bg-gray-50">
                  <Link 
                    href="/agent/applications?tab=needs-attention"
                    className="text-sm text-amber-600 hover:text-amber-800 flex items-center justify-center w-full"
                  >
                    View All Attention Items
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Recent Applications */}
        <div className={`${statistics.attentionRequired.length > 0 ? '' : 'lg:col-span-2'} bg-white rounded-lg shadow`}>
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Applications</h2>
            <Link href="/agent/applications" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          
          <div className="divide-y">
            {applications.length > 0 ? (
              // Sort applications by created_at date (newest first) and take only 5
              [...applications]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((app) => (
                <Link 
                  key={app.id} 
                  href={`/agent/applications/${app.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {app.policy_health === 'Needs Attention' ? (
                          <AlertTriangle className="h-10 w-10 text-amber-500" />
                        ) : (
                          <FileText className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{app.proposed_insured}</p>
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500">
                            {app.carrier || 'Unknown carrier'} 
                            {app.product_type && ` - ${app.product_type}`}
                            {app.premium && ` - ${formatCurrency(app.premium)}/mo`}
                          </p>
                          {app.policy_health === 'Needs Attention' && (
                            <p className="text-sm text-amber-600 font-medium mt-1">
                              Policy health requires attention
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(app.policy_submit_date || app.created_at)}</p>
                      {app.policy_health && app.policy_health !== 'Needs Attention' && (
                        <p className="text-xs mt-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            app.policy_health === 'Active' ? 'bg-green-100 text-green-800' :
                            app.policy_health === 'Payment Issues' ? 'bg-red-100 text-red-800' :
                            app.policy_health === 'Pending First Payment' ? 'bg-yellow-100 text-yellow-800' :
                            app.policy_health === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.policy_health}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No applications found. Create your first application now!</p>
                <Link 
                  href="/agent/applications/new"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Create Application
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Activity & Quick Links */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link 
                href="/agent/applications/new"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
              >
                <FileEdit className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-center">New Application</span>
              </Link>
              
              <Link 
                href="/agent/script-assistant"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
              >
                <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-center">Script Assistant</span>
              </Link>
              
              <Link 
                href="/agent/commissions"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
              >
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-center">Commissions</span>
              </Link>
              
              <Link 
                href="/agent/carriers"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
              >
                <CalendarClock className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-center">Carriers</span>
              </Link>
            </div>
          </div>
          
          {/* Performance Snapshot */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Performance Snapshot</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Application Approval Rate</span>
                <span className="text-sm font-medium">
                  {statistics.total ? Math.round((statistics.approved / statistics.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${statistics.total ? Math.round((statistics.approved / statistics.total) * 100) : 0}%` }}
                ></div>
              </div>
              
              {/* Commission Breakdown */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Commission Breakdown</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Paid</span>
                  </div>
                  <span className="text-xs font-medium">{formatCurrency(statistics.commission.paid)}</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <span className="text-xs font-medium">{formatCurrency(statistics.commission.pending)}</span>
                </div>
                
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-l-full" 
                    style={{ 
                      width: `${statistics.commission.total ? 
                        Math.round((statistics.commission.paid / statistics.commission.total) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Policy Health */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Policy Health</h3>
                
                {statistics.healthyPolicies > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600">Healthy</span>
                    </div>
                    <span className="text-xs font-medium">{statistics.healthyPolicies}</span>
                  </div>
                )}
                
                {statistics.needsAttention > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600">Needs Attention</span>
                    </div>
                    <span className="text-xs font-medium">{statistics.needsAttention}</span>
                  </div>
                )}
                
                {statistics.critical > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600">Critical</span>
                </div>
                    <span className="text-xs font-medium">{statistics.critical}</span>
                </div>
                )}
                
                {statistics.healthyPolicies === 0 && statistics.needsAttention === 0 && statistics.critical === 0 && (
                  <div className="text-xs text-gray-500 text-center">No policy health data available</div>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold">{statistics.clients}</p>
                  <p className="text-xs text-gray-500">Clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{statistics.total}</p>
                  <p className="text-xs text-gray-500">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{statistics.approved}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 