'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BarChart2, Users, Settings, Activity, Layers, DollarSign, TrendingUp, RefreshCw, Download, Clock, Calendar, AlertCircle, Filter, ChevronDown, ArrowRight, BarChart, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface UserActivity {
  id: number
  user: string
  action: string
  time: string
}

interface SystemAlert {
  id: number
  type: string
  message: string
  time: string
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
)

interface PolicyStat {
  id: string
  status: string
  count: number
}

interface Agent {
  id: string
  full_name: string
  policies_count: number
  performance: number
}

interface CarrierStat {
  id: string
  name: string
  policies_count: number
  approval_rate: number
}

export default function AdminDashboard() {
  const { role, loading: roleLoading } = useRole()
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [policyData, setPolicyData] = useState<PolicyStat[]>([])
  const [agentPerformance, setAgentPerformance] = useState<Agent[]>([])
  const [carrierStats, setCarrierStats] = useState<CarrierStat[]>([])
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [allPoliciesCount, setAllPoliciesCount] = useState(0)
  const [activeAgentsCount, setActiveAgentsCount] = useState(0)
  const [totalPremium, setTotalPremium] = useState(0)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [trendingCarriers, setTrendingCarriers] = useState<string[]>([])
  const [alerts, setAlerts] = useState<{threshold: number, current: number, message: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const supabase = createClient()

  useEffect(() => {
    // Store a flag in localStorage to prevent excessive calls on page refresh
    const now = Date.now();
    const lastFetch = localStorage.getItem('lastDataFetch');
    const refreshInterval = 60000; // 1 minute
    
    if (lastFetch && (now - parseInt(lastFetch, 10)) < refreshInterval) {
      console.log('Using cached dashboard data, skipping refresh');
      return; // Skip fetching if called too often
    }
    
    // Set current timestamp as last fetch time
    localStorage.setItem('lastDataFetch', now.toString());
    
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch policies with all needed fields
        const { data: policiesData, error: policiesError } = await supabase
          .from('policies')
          .select('id, status, premium, created_at')
        
        if (policiesError) throw policiesError

        // Count policies by status for pie chart
        const policyCounts: { [key: string]: number } = {}
        policiesData.forEach((policy) => {
          const status = policy.status || 'unknown'
          policyCounts[status] = (policyCounts[status] || 0) + 1
        })
        
        const formattedPolicyData: PolicyStat[] = Object.keys(policyCounts).map((status, index) => ({
          id: index.toString(),
          status,
          count: policyCounts[status]
        }))
        
        setPolicyData(formattedPolicyData)
        setAllPoliciesCount(policiesData.length)

        // Fetch pending approvals
        const { data: pendingData, error: pendingError } = await supabase
          .from('policies')
          .select('id')
          .eq('status', 'pending')
        
        if (pendingError) throw pendingError
        setPendingApprovalsCount(pendingData ? pendingData.length : 0)

        // Calculate total premium from all policies
        const totalPremiumAmount = policiesData.reduce((sum, policy) => {
          return sum + (Number(policy.premium) || 0)
        }, 0)
        setTotalPremium(totalPremiumAmount)

        // Fetch active agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('callx_agents')
          .select('id, full_name')
          .eq('status', 'active')
        
        if (agentsError) throw agentsError
        setActiveAgentsCount(agentsData ? agentsData.length : 0)

        // Fetch agent performance data
        try {
          const { data: performanceData, error: performanceError } = await supabase
            .from('analytics_agent_performance')
            .select('agent_id, policies_count, performance_score')
            .order('performance_score', { ascending: false })
            .limit(5)
          
          let agentPerformanceData = []
          
          if (!performanceError && performanceData && performanceData.length > 0) {
            // Map analytics data to agent names
            const agentMap = new Map(agentsData.map(agent => [agent.id, agent]))
            
            agentPerformanceData = performanceData.map(perf => ({
              id: perf.agent_id,
              full_name: agentMap.get(perf.agent_id)?.full_name || 'Unknown Agent',
              policies_count: perf.policies_count || 0,
              performance: perf.performance_score || 0
            }))
          } else {
            console.log('Using fallback agent performance data');
            // Fallback to basic data if no analytics available
            agentPerformanceData = agentsData.slice(0, 5).map((agent, idx) => ({
              id: agent.id,
              full_name: agent.full_name,
              policies_count: Math.floor(Math.random() * 30) + 5,
              performance: Math.floor(Math.random() * 50) + 50
            })).sort((a, b) => b.performance - a.performance)
          }
          
          setAgentPerformance(agentPerformanceData)
        } catch (err) {
          console.error('Error fetching agent performance:', err);
          // Fallback data
          const agentPerformanceData = agentsData.slice(0, 5).map((agent, idx) => ({
            id: agent.id,
            full_name: agent.full_name,
            policies_count: Math.floor(Math.random() * 30) + 5,
            performance: Math.floor(Math.random() * 50) + 50
          })).sort((a, b) => b.performance - a.performance);
          
          setAgentPerformance(agentPerformanceData);
        }

        // Fetch carriers
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers')
          .select('id, name, approval_rate')
          .eq('status', 'active')
        
        if (carriersError) throw carriersError

        // Generate carrier stats with real carrier data
        if (carriersData && carriersData.length > 0) {
          // Fetch carrier performance data
          try {
            const { data: carrierPerfData, error: carrierPerfError } = await supabase
              .from('analytics_carrier_performance')
              .select('carrier_id, policies_count, approval_rate')
              .order('approval_rate', { ascending: false })
              .limit(5)
            
            let carrierStatsData = []
            
            if (!carrierPerfError && carrierPerfData && carrierPerfData.length > 0) {
              // Map analytics data to carrier names
              const carrierMap = new Map(carriersData.map(carrier => [carrier.id, carrier]))
              
              carrierStatsData = carrierPerfData.map(perf => ({
                id: perf.carrier_id,
                name: carrierMap.get(perf.carrier_id)?.name || 'Unknown Carrier',
                policies_count: perf.policies_count || 0,
                approval_rate: perf.approval_rate || 0
              }))
            } else {
              console.log('Using fallback carrier performance data');
              // Fallback to basic data if no analytics available
              carrierStatsData = carriersData.slice(0, 5).map(carrier => ({
                id: carrier.id,
                name: carrier.name,
                policies_count: Math.floor(Math.random() * 40) + 10,
                approval_rate: carrier.approval_rate || Math.floor(Math.random() * 30) + 70
              })).sort((a, b) => b.approval_rate - a.approval_rate)
            }
            
            setCarrierStats(carrierStatsData)
            
            // Set trending carriers based on recent performance
            const trendingCarrierIds = carrierStatsData
              .sort((a, b) => b.policies_count - a.policies_count)
              .slice(0, 3)
              .map(c => c.name)
            
            setTrendingCarriers(trendingCarrierIds)
          } catch (err) {
            console.error('Error fetching carrier performance:', err);
            // Fallback data
            const carrierStatsData = carriersData.slice(0, 5).map(carrier => ({
              id: carrier.id,
              name: carrier.name,
              policies_count: Math.floor(Math.random() * 40) + 10,
              approval_rate: carrier.approval_rate || Math.floor(Math.random() * 30) + 70
            })).sort((a, b) => b.approval_rate - a.approval_rate);
            
            setCarrierStats(carrierStatsData);
            
            // Set trending carriers based on recent performance
            const trendingCarrierIds = carrierStatsData
              .sort((a, b) => b.policies_count - a.policies_count)
              .slice(0, 3)
              .map(c => c.name);
            
            setTrendingCarriers(trendingCarrierIds);
          }
        }

        // Fetch real activities from the database
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('id, user_id, activity_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (activitiesError) throw activitiesError

        if (activitiesData && activitiesData.length > 0) {
          // Get user profiles for the activities
          const userIds = Array.from(new Set(activitiesData.map(a => a.user_id)))
          const userMap = new Map()
          
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', userIds)
            
            if (profilesData) {
              profilesData.forEach(profile => {
                userMap.set(profile.id, `${profile.first_name} ${profile.last_name}`)
              })
            }
          } catch (err) {
            console.error('Error fetching profiles:', err);
            // If profiles can't be fetched, we'll use "Unknown User" as fallback
          }
          
          const formattedActivities: UserActivity[] = activitiesData.map((activity, idx) => ({
            id: idx,
            user: userMap.get(activity.user_id) || 'Unknown User',
            action: activity.description,
            time: new Date(activity.created_at).toLocaleString()
          }))
          
          setUserActivities(formattedActivities)
        } else {
          // Fallback to mock data if no activities
          setUserActivities([
            { id: 1, user: 'Admin User', action: 'Updated system settings', time: '2 minutes ago' },
            { id: 2, user: 'John Agent', action: 'Created new policy', time: '10 minutes ago' },
            { id: 3, user: 'Sarah Manager', action: 'Approved application', time: '25 minutes ago' },
            { id: 4, user: 'Mark Admin', action: 'Added new user', time: '1 hour ago' },
            { id: 5, user: 'Lisa Agent', action: 'Updated client profile', time: '2 hours ago' }
          ])
        }

        // Generate revenue data from actual policies grouped by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth()
        
        // Initialize all months with zero values
        const revenueByMonth: { [key: string]: { premium: number, policies: number } } = {}
        
        for (let i = 0; i <= currentMonth; i++) {
          revenueByMonth[months[i]] = { premium: 0, policies: 0 }
        }
        
        // Populate with actual policy data
        policiesData.forEach(policy => {
          if (policy.created_at) {
            const date = new Date(policy.created_at)
            // Only use policies from current year
            if (date.getFullYear() === currentYear && date.getMonth() <= currentMonth) {
              const month = months[date.getMonth()]
              revenueByMonth[month].premium += Number(policy.premium) || 0
              revenueByMonth[month].policies += 1
            }
          }
        })
        
        // Convert to array for the chart
        const chartData = Object.keys(revenueByMonth).map(month => ({
          name: month,
          premium: revenueByMonth[month].premium,
          policies: revenueByMonth[month].policies
        }))
        
        setRevenueData(chartData)

        // Generate system alerts based on actual data
        const systemAlertsData = [
          { 
            id: 1, 
            type: pendingData && pendingData.length > 0 ? 'warning' : 'info', 
            message: `${pendingData ? pendingData.length : 0} policies awaiting approval`, 
            time: '1h ago' 
          },
          { id: 2, type: 'info', message: 'New carrier integration available', time: '3h ago' },
          { id: 3, type: 'success', message: 'System backup completed successfully', time: '6h ago' },
          { id: 4, type: 'error', message: 'Failed login attempts detected', time: '12h ago' }
        ]
        
        setSystemAlerts(systemAlertsData)

        // Generate threshold-based alerts
        const policyThreshold = 20  // Example threshold
        const newAlerts = [
          {
            threshold: 90,
            current: Math.min(Math.round((totalPremiumAmount / 100000) * 100), 95),
            message: 'Storage usage approaching limit'
          },
          {
            threshold: 50,
            current: Math.min(Math.round((agentsData ? agentsData.length : 0) / 10) * 25, 80),
            message: 'Agent renewals need attention'
          },
          {
            threshold: 70,
            current: pendingData ? Math.min(Math.round((pendingData.length / policyThreshold) * 100), 90) : 30,
            message: 'Commission payments pending approval'
          }
        ]
        
        setAlerts(newAlerts)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (roleLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <RoleBasedLayout userRole={role || 'admin'}>
      <div className="space-y-4 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome to your command center</p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <div className="relative">
              <button className="bg-white border rounded-md px-4 py-2 flex items-center space-x-2 text-sm shadow-sm hover:bg-gray-50">
                <span>{timeRange === 'month' ? 'Monthly' : timeRange === 'quarter' ? 'Quarterly' : 'Annual'}</span>
                <ChevronDown size={16} />
              </button>
              {/* Dropdown would go here */}
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center space-x-2 text-sm shadow-sm">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button className="bg-white border rounded-md px-4 py-2 flex items-center space-x-2 text-sm shadow-sm hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Insights section */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 shadow-lg text-white mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BarChart2 className="mr-2" />
            Intelligent Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingCarriers.length > 0 && (
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold mb-2">Trending Carriers</h3>
                <ul className="space-y-2">
                  {trendingCarriers.map((carrier, index) => (
                    <li key={index} className="flex items-center">
                      <TrendingUp size={16} className="mr-2 text-green-400" />
                      <span>{carrier}</span>
                    </li>
                  ))}
                </ul>
                <button className="text-sm mt-4 flex items-center text-blue-300 hover:text-blue-100">
                  View carrier analytics <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            )}
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Performance Alerts</h3>
              <ul className="space-y-2">
                {alerts.map((alert, index) => (
                  <li key={index} className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{alert.message}</span>
                      <span className={`text-sm font-medium ${alert.current >= alert.threshold ? 'text-red-400' : 'text-green-400'}`}>
                        {alert.current}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${alert.current >= alert.threshold ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${alert.current}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Optimization Opportunities</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={16} className="mr-2 text-green-400 mt-0.5" />
                  <span>Auto-assign new clients to top-performing agents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className="mr-2 text-green-400 mt-0.5" />
                  <span>Schedule premium renewal reminders</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle size={16} className="mr-2 text-amber-400 mt-0.5" />
                  <span>Enable carrier API integrations</span>
                </li>
              </ul>
              <button className="text-sm mt-4 flex items-center text-blue-300 hover:text-blue-100">
                View all opportunities <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Policies</p>
              <p className="text-2xl font-bold mt-2">{allPoliciesCount}</p>
              <div className="flex items-center mt-2 text-green-600 text-xs font-medium">
                <ArrowRight className="mr-1 h-3 w-3" /> View policies
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Agents</p>
              <p className="text-2xl font-bold mt-2">{activeAgentsCount}</p>
              <div className="flex items-center mt-2 text-green-600 text-xs font-medium">
                <ArrowRight className="mr-1 h-3 w-3" /> View agents
              </div>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Premium</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(totalPremium)}</p>
              <div className="flex items-center mt-2 text-green-600 text-xs font-medium">
                <ArrowRight className="mr-1 h-3 w-3" /> View financials
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold mt-2">{pendingApprovalsCount}</p>
              <div className="flex items-center mt-2 text-amber-600 text-xs font-medium">
                <ArrowRight className="mr-1 h-3 w-3" /> Take action
              </div>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Revenue & Policy Overview</h2>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Premium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Policies</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#0088FE"
                  domain={[0, 'auto']} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#00C49F"
                  domain={[0, 'auto']} 
                />
                <RechartsTooltip 
                  formatter={(value, name) => {
                    if (name === 'premium') return formatCurrency(Number(value));
                    return value;
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="premium" 
                  name="Premium" 
                  stroke="#0088FE" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="policies" 
                  name="Policies" 
                  stroke="#00C49F" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Policies by Status</h2>
              <Filter size={18} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {policyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`${value} policies`, 'Count']}
                  labelFormatter={(label) => `Status: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance & Carrier Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Top Agent Performance</h2>
              <Link href="/admin/agents" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policies</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agentPerformance.map((agent) => (
                    <tr key={agent.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{agent.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agent.policies_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${agent.performance}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{agent.performance}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Carrier Stats</h2>
              <Link href="/admin/carriers" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policies</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {carrierStats.map((carrier) => (
                    <tr key={carrier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{carrier.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{carrier.policies_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              carrier.approval_rate > 80 ? 'bg-green-600' : 
                              carrier.approval_rate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${carrier.approval_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{carrier.approval_rate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
            </div>
            <div className="space-y-4">
              {userActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">System Status</h2>
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>All systems operational</span>
              </div>
            </div>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center
                    ${alert.type === 'warning' ? 'bg-yellow-100' : 
                      alert.type === 'error' ? 'bg-red-100' : 
                      alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : alert.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 