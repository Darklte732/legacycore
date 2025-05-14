'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronRight, ArrowUpRight, Briefcase, Users, FileText, CreditCard, AlertTriangle, BarChart2, Calendar, 
  Award, CheckCircle, XCircle, AlertCircle, Home, DollarSign, TrendingUp, Filter, ChevronDown, 
  RefreshCw, Info, CheckCircle2, AlertOctagon, BadgeCheck, Layers, ArrowRight, Clock, Shield, Heart, 
  Activity, LineChart, Scale, Target, PieChart, Timer, UserPlus, BookOpen, Phone, Settings, Link, Video,
  Bell, Calendar as CalendarIcon, LifeBuoy, ZapOff
} from 'lucide-react';
import { format } from 'date-fns';
import ClientOnly from '@/components/ClientOnly';

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [stats, setStats] = useState({
    total_applications: 0,
    total_commission: 0,
    approval_rate: 0,
    top_agent: '',
    top_agent_commission: 0,
    annual_premium: 0,
    monthly_premium: 0,
    weekly_premium: 0,
    needs_attention: 0,
    weekly_growth: 0,
    monthly_growth: 0,
    issued_paid_applications: 0,
    cancelled_declined_applications: 0,
    chargebacks: 0,
    upcoming_payments: 0,
    last_updated: formatCurrentDate(),
    retention_rate: 0,
    renewal_commission: 0,
    projected_renewals: 0,
    avg_policy_size: 0,
    term_life_count: 0,
    whole_life_count: 0,
    universal_life_count: 0,
    final_expense_count: 0,
    med_supp_count: 0,
    compliance_score: 0,
    avg_client_age: 0,
    client_satisfaction: 0,
    avg_turnaround_time: 0,
    lead_conversion_rate: 0,
    mortgage_protection_count: 0,
    term_life_avg: 0,
    whole_life_avg: 0,
    universal_life_avg: 0,
    mortgage_protection_avg: 0,
    average_policy_size: 0,
    cross_sell_opportunities: 0,
    policy_retention_rate: 0,
    pending_commission: 0,
    conservation_events_count: 0,
    conservation_events: [],
    policies_at_risk: 0,
    renewal_opportunities: 0,
    persistency_30_days: 0,
    persistency_60_days: 0,
    persistency_90_days: 0,
    conservation_success_rate: 0,
    expiring_policies_count: 0,
    expiring_policies: [],
    last_premium_payment_dates: {},
    premium_payment_statuses: {},
    pending_renewal_commission: 0
  });
  const [timePeriod, setTimePeriod] = useState('quarter');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAllTimeData, setShowAllTimeData] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const supabase = createClient();
  
  // Add state for activities loading status
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(false);
  
  // Add a helper function for formatting the date correctly
  function formatCurrentDate() {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  
  // Calculate date ranges based on selected time period
  const getDateRange = (period) => {
    const today = new Date();
    const startDate = new Date();
    const currentYear = today.getFullYear();
    
    switch(period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        // Set to beginning of current quarter
        const currentQuarter = Math.floor(today.getMonth() / 3);
        startDate.setFullYear(currentYear); // Ensure current year
        startDate.setMonth(currentQuarter * 3); // 0, 3, 6, 9
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setFullYear(currentYear, 0, 1); // January 1st of current year
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'ytd':
        startDate.setFullYear(currentYear, 0, 1); // January 1st of current year
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate.setFullYear(2000); // Set far in the past to get all data
        break;
      case 'custom':
        // Could implement a custom date picker here
        startDate.setMonth(today.getMonth() - 3); // Default to last 3 months for custom
        break;
    }
    
    return {
      start: startDate,
      end: today
    };
  }
  
  // Function to manually refresh data
  const refreshData = () => {
    console.log("Refreshing manager dashboard data");
    setRefreshTrigger(prev => prev + 1);
  }
  
  // Setup a real-time subscription to agent_applications changes
  useEffect(() => {
    // Create the subscription for real-time updates
    const setupRealtimeSubscription = async () => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.error("No user ID found for real-time subscription");
        return;
      }
      
      // Subscribe to all changes on agent_applications table
      const subscription = supabase
        .channel('manager-dashboard-changes')
        .on('postgres_changes', {
          event: '*', 
          schema: 'public',
          table: 'agent_applications'
        }, (payload) => {
          console.log('Real-time update received:', payload);
          // Trigger a data refresh when changes are detected
          refreshData();
        })
        .subscribe();
        
      // Cleanup subscription when component unmounts
      return () => {
        supabase.removeChannel(subscription);
      };
    };
    
    setupRealtimeSubscription();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Manager dashboard: Starting data fetch for time period: ${timePeriod}`)
        setLoading(true);
        setUsingFallbackData(false);
        setUsingDemoData(false);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user?.id) {
          console.error("No user ID found")
          setError("Session not found. Please log in again.")
          setLoading(false)
          return
        }
        
        console.log("Manager dashboard: Fetching agents assigned to this manager")
        
        // Get agents managed by this manager using the manager_id field
        const { data: agentsData, error: agentsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .eq('role', 'agent')
          .eq('manager_id', session.user.id)
          .order('first_name', { ascending: true })
        
        if (agentsError) {
          console.error("Error fetching agents:", agentsError)
          setError("Unable to fetch agent data. Please try again later.")
          setLoading(false)
          return
        }
        
        if (!agentsData || agentsData.length === 0) {
          console.log("No agents found assigned to this manager")
          setLoading(false)
          return
        }
        
        console.log(`Found ${agentsData.length} agents assigned to this manager`)
        
        // Extract agent IDs and fetch applications using the get_manager_applications RPC function
        let applications = [];
        try {
          // Use get_manager_applications function to fetch all applications for this manager's agents
          const { data: managerApplications, error: managerAppsError } = await supabase
            .rpc('get_manager_applications', { manager_id: session.user.id });
          
          if (managerAppsError) {
            console.error("Error using get_manager_applications function:", managerAppsError);
            throw new Error(managerAppsError.message);
          }
          
          if (managerApplications && managerApplications.length > 0) {
            console.log(`Successfully fetched ${managerApplications.length} applications via RPC`);
            applications = managerApplications;
          } else {
            console.log("No applications found for manager's agents");
          }
        } catch (err) {
          console.error("Error fetching manager applications:", err);
          
          // Fallback to manual agent application query if RPC fails
          console.log("Falling back to direct query for agent applications");
          
          const agentIds = agentsData.map(agent => agent.id);
          const { data: agentApps, error: agentAppsError } = await supabase
            .from('agent_applications')
            .select('*')
            .in('agent_id', agentIds);
            
          if (agentAppsError) {
            console.error("Error in fallback query:", agentAppsError);
          } else if (agentApps && agentApps.length > 0) {
            console.log(`Fetched ${agentApps.length} applications via fallback query`);
            applications = agentApps;
          }
        }
        
        // Also fetch recent activities and conservation events
        const fetchRecentActivities = async () => {
          try {
            setActivitiesLoading(true);
            
            // Get conservation events first
            const { data: conservationEvents, error: conservationError } = await supabase
              .rpc('get_conservation_events_summary', { 
                p_organization_id: null, // Uses the user's organization automatically
                p_status: null, 
                p_limit: 5 
              });
              
            if (conservationError) {
              console.error("Error fetching conservation events:", conservationError);
              throw new Error(conservationError.message);
            }
            
            // Get dashboard stats through RPC
            const { data: dashboardStats, error: dashboardError } = await supabase
              .rpc('get_manager_dashboard_stats', { 
                p_organization_id: null, // Uses the user's organization automatically
                p_timeframe: '30days'
              });
              
            if (dashboardError) {
              console.error("Error fetching dashboard stats:", dashboardError);
              throw new Error(dashboardError.message);
            }
            
            // Process and set the data if available
            if (dashboardStats) {
              setStats(prevStats => ({
                ...prevStats,
                conservation_events: conservationEvents || [],
                conservation_events_count: (conservationEvents || []).length,
                policy_retention_rate: dashboardStats.persistency?.[0]?.persistency_rate || 81,
                renewal_commission: dashboardStats.pending_commissions?.[0]?.pending_amount || 800,
                projected_renewals: dashboardStats.persistency?.[0]?.active_policies || 0
              }));
            }
            
            setActivitiesLoading(false);
          } catch (error) {
            console.error("Error fetching activities:", error);
            setActivitiesError(true);
            setActivitiesLoading(false);
          }
        };
        
        // Call the fetchRecentActivities function
        await fetchRecentActivities();
        
        // Process applications to calculate statistics
        if (applications.length > 0) {
          // Filter applications by date range
          const dateRange = getDateRange(timePeriod);
          const filteredApplications = applications.filter(app => {
            const appDate = new Date(app.created_at || app.updated_at || new Date());
            return appDate >= dateRange.start && appDate <= dateRange.end;
          });
          
          console.log(`Filtered to ${filteredApplications.length} applications within selected time period`);
          
          // Calculate product type counts
          const termLifeCount = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('term') || 
            app.product_type?.toLowerCase().includes('term')
          ).length;
          
          const wholeLifeCount = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('whole') || 
            app.product_type?.toLowerCase().includes('whole')
          ).length;
          
          const universalLifeCount = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('universal') || 
            app.product_type?.toLowerCase().includes('universal')
          ).length;
          
          const mortgageProtectionCount = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('mortgage') || 
            app.product_type?.toLowerCase().includes('mortgage')
          ).length;
          
          // Calculate premium averages
          const termLifeApps = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('term') || 
            app.product_type?.toLowerCase().includes('term')
          );
          
          const wholeLifeApps = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('whole') || 
            app.product_type?.toLowerCase().includes('whole')
          );
          
          const universalLifeApps = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('universal') || 
            app.product_type?.toLowerCase().includes('universal')
          );
          
          const mortgageProtectionApps = filteredApplications.filter(app => 
            app.product?.toLowerCase().includes('mortgage') || 
            app.product_type?.toLowerCase().includes('mortgage')
          );
          
          const termLifeAvg = termLifeApps.length ? 
            termLifeApps.reduce((sum, app) => sum + (parseFloat(app.monthly_premium) || 0), 0) / termLifeApps.length : 
            0;
            
          const wholeLifeAvg = wholeLifeApps.length ? 
            wholeLifeApps.reduce((sum, app) => sum + (parseFloat(app.monthly_premium) || 0), 0) / wholeLifeApps.length : 
            0;
            
          const universalLifeAvg = universalLifeApps.length ? 
            universalLifeApps.reduce((sum, app) => sum + (parseFloat(app.monthly_premium) || 0), 0) / universalLifeApps.length : 
            0;
            
          const mortgageProtectionAvg = mortgageProtectionApps.length ? 
            mortgageProtectionApps.reduce((sum, app) => sum + (parseFloat(app.monthly_premium) || 0), 0) / mortgageProtectionApps.length : 
            0;
          
          // Calculate group stats
          const totalApps = filteredApplications.length;
          const approvedApps = filteredApplications.filter(app => 
            app.status?.toLowerCase().includes('approved') || 
            app.status?.toLowerCase().includes('issued') ||
            app.status?.toLowerCase().includes('live'))
          .length;
          
          const pendingApps = filteredApplications.filter(app => 
            app.status?.toLowerCase().includes('pending'))
          .length;
          
          const totalCommission = filteredApplications.reduce((sum, app) => 
            sum + (parseFloat(app.commission_amount) || 0), 0);
            
          const approvalRate = totalApps ? (approvedApps / totalApps) * 100 : 0;
          
          // Calculate agent performance
          const agentStats = [];
          const agentMap = {};
          
          // Build initial map of all agents with zero values
          agentsData.forEach(agent => {
            agentMap[agent.id] = {
              id: agent.id,
              name: `${agent.first_name} ${agent.last_name}`,
              applications: 0,
              commission: 0,
              issued: 0,
              conversion: 0
            };
          });
          
          // Fill in actual performance data
          filteredApplications.forEach(app => {
            if (app.agent_id && agentMap[app.agent_id]) {
              agentMap[app.agent_id].applications++;
              agentMap[app.agent_id].commission += parseFloat(app.commission_amount) || 0;
              
              if (app.status?.toLowerCase().includes('approved') || 
                  app.status?.toLowerCase().includes('issued') ||
                  app.status?.toLowerCase().includes('live')) {
                agentMap[app.agent_id].issued++;
              }
            }
          });
          
          // Calculate conversion rates and format for display
          Object.values(agentMap).forEach(agent => {
            if (agent.applications > 0) {
              agent.conversion = (agent.issued / agent.applications) * 100;
              agentStats.push(agent);
            }
          });
          
          // Sort by commission amount descending
          agentStats.sort((a, b) => b.commission - a.commission);
          
          // Calculate average turnaround time for applications
          const getAverageTurnaroundTime = () => {
            const appsWithDates = filteredApplications.filter(app => 
              app.created_at && app.status_updated_at)
            ;
            
            if (appsWithDates.length === 0) return 14.4; // Default if no data
            
            const totalDays = appsWithDates.reduce((total, app) => {
              const created = new Date(app.created_at);
              const updated = new Date(app.status_updated_at);
              const diffTime = Math.abs(updated - created);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return total + diffDays;
            }, 0);
            
            return totalDays / appsWithDates.length;
          };
          
          // Calculate completion rate
          const getCompletionRate = () => {
            if (totalApps === 0) return 91; // Default if no data
            
            const completedApps = filteredApplications.filter(app => 
              app.status?.toLowerCase() !== 'pending' && 
              app.status?.toLowerCase() !== 'new')
            .length;
            
            return (completedApps / totalApps) * 100;
          };
          
          // Calculate first-call resolution rate
          const getFirstCallResolution = () => {
            // This is a placeholder - in a real system, this would be calculated based on
            // actual call data or other metrics
            return 82; // Default for now
          };
          
          // Update statistics state
          setStats({
            total_applications: totalApps,
            total_commission: totalCommission,
            approval_rate: approvalRate,
            top_agent: agentStats.length > 0 ? agentStats[0].name : '',
            top_agent_commission: agentStats.length > 0 ? agentStats[0].commission : 0,
            term_life_count: termLifeCount,
            whole_life_count: wholeLifeCount,
            universal_life_count: universalLifeCount,
            mortgage_protection_count: mortgageProtectionCount,
            term_life_avg: termLifeAvg,
            whole_life_avg: wholeLifeAvg,
            universal_life_avg: universalLifeAvg,
            mortgage_protection_avg: mortgageProtectionAvg,
            average_policy_size: totalApps ? totalCommission / totalApps : 1000,
            cross_sell_opportunities: filteredApplications.length,
            policy_retention_rate: 81, // This would be fetched from a real analytics system
            renewal_commission: 800, // Placeholder
            projected_renewals: totalApps,
            avg_turnaround_time: getAverageTurnaroundTime(),
            completion_rate: getCompletionRate(),
            first_call_resolution: getFirstCallResolution(),
            last_updated: formatCurrentDate()
          });
          
          // Set agent performance for leaderboard
          setAgentPerformance(agentStats);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up an interval to refresh data every 60 seconds
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [timePeriod, refreshTrigger]); // Re-run when time period changes or refresh is triggered
  
  // Format currency without cents
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };
  
  // Format currency with cents
  const formatCurrencyWithCents = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Handle Conservation Event
  const handleConservationEvent = async (eventId) => {
    try {
      // Update the event status to 'handled'
      const { error } = await supabase
        .from('conservation_events')
        .update({ status: 'handled', handled_at: new Date().toISOString() })
        .eq('id', eventId);
        
      if (error) {
        console.error("Error updating conservation event:", error);
        return;
      }
      
      // Refresh data to show updated event status
      refreshData();
    } catch (error) {
      console.error("Error handling conservation event:", error);
    }
  };

  // Format date for activities
  const formatActivityDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (error) {
      return 'Date unavailable';
    }
  };

  // Modify the fetchRecentActivities function with better error handling
  const fetchRecentActivities = async () => {
    try {
      console.log('Fetching recent activities');
      setActivitiesLoading(true);
      setActivitiesError(false);
      
      // Try to fetch from application_activities table
      const { data: activities, error } = await supabase
        .from('application_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        console.error('Error fetching activities:', error);
        setActivitiesError(true);
        setRecentActivities([]);
      } else if (activities && activities.length > 0) {
        setRecentActivities(activities);
      } else {
        console.log('No recent activities found');
        setRecentActivities([]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivitiesError(true);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };
  
  // Return the entire dashboard wrapped in the ClientOnly component
  return (
    <ClientOnly fallback={
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse flex space-x-4 mb-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Header and Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
          <button 
            onClick={refreshData} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
        
        {/* Time Period Filter */}
        <div className="flex items-center mb-6 gap-3">
          <div className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} />
            Time Period:
          </div>
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'quarter', 'year', 'ytd', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period === 'ytd' ? 'YTD' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <h3 className="text-2xl font-bold">{stats.total_applications}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                <FileText size={22} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              {stats.issued_paid_applications} issued & paid
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Commission</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.total_commission)}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-md text-green-600">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              {formatCurrency(stats.pending_commission)} pending
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Annual Premium</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.annual_premium)}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-md text-purple-600">
                <CreditCard size={22} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Avg. {formatCurrency(stats.average_policy_size)}/policy
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Needs Attention</p>
                <h3 className="text-2xl font-bold">{stats.needs_attention}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-md text-yellow-600">
                <AlertTriangle size={22} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              {stats.conservation_events_count} conservation events
            </div>
          </div>
        </div>
        
        {/* Policy Persistency Metrics */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} />
            Policy Persistency Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">30-Day Persistency</p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stats.persistency_30_days >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {stats.persistency_30_days}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.persistency_30_days}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">60-Day Persistency</p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stats.persistency_60_days >= 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {stats.persistency_60_days || 82}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.persistency_60_days || 82}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">90-Day Persistency</p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stats.persistency_90_days >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {stats.persistency_90_days || 78}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.persistency_90_days || 78}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <AlertOctagon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Policies At Risk</p>
                <p className="font-semibold">{stats.policies_at_risk || 3}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
              <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Renewal Opportunities</p>
                <p className="font-semibold">{stats.renewal_opportunities || 5}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Retention Rate</p>
                <p className="font-semibold">{stats.policy_retention_rate || 92}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Renewal Commission</p>
                <p className="font-semibold">{formatCurrency(stats.pending_renewal_commission || 4250)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conservation Events Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={20} />
              Policy Conservation Events
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.conservation_events_count || 0} Active
            </span>
          </div>
          
          {stats.conservation_events && stats.conservation_events.length > 0 ? (
            <div className="space-y-4">
              {stats.conservation_events.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {event.type === 'lapse_risk' && <AlertTriangle className="text-red-500" size={18} />}
                      {event.type === 'payment_missed' && <ZapOff className="text-orange-500" size={18} />}
                      {event.type === 'renewal_due' && <Bell className="text-blue-500" size={18} />}
                      {!event.type && <AlertCircle className="text-yellow-500" size={18} />}
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.description || 'Policy needs attention'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.client_name || 'Client'} - Policy #{event.policy_number || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.created_at ? formatActivityDate(event.created_at) : 'Recent'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConservationEvent(event.id)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-md flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      Mark Handled
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-500 rounded-full mb-4">
                <CheckCircle size={24} />
              </div>
              <p className="text-gray-600">No active conservation events</p>
              <p className="text-sm text-gray-500 mt-2">All policies appear to be in good standing</p>
            </div>
          )}
        </div>
        
        {/* Commission Analytics Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Commission Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Commission</p>
                  <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(stats.pending_commission || 0)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-700">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                From {stats.total_applications || 0} applications in process
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Commission</p>
                  <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(stats.total_commission || 0)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full text-green-700">
                  <BadgeCheck size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                From {stats.issued_paid_applications || 0} issued & paid applications
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Renewal Commission</p>
                  <p className="text-xl font-bold mt-1 text-gray-900">{formatCurrency(stats.renewal_commission || 0)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full text-purple-700">
                  <LineChart size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Projected: {formatCurrency(stats.projected_renewals || 0)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Agent Performance Table */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Agent Performance</h3>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
            </div>
          ) : agentPerformance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No agent data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apps
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued & Paid
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annual Premium
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Needs Attention
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agentPerformance.map((agent, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{agent.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.issued}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(agent.commission)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(agent.commission)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          parseInt(agent.conversion) >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : parseInt(agent.conversion) >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agent.conversion.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.needs_attention || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Recent Activities section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          </div>
          
          {activitiesLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : activitiesError ? (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-gray-500">Unable to load recent activities</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-gray-500">No recent activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded">
                  <div className={`p-2 rounded-full mr-3 ${getActivityIconColor(activity)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description || 'Activity recorded'}</p>
                    <p className="text-sm text-gray-500">{formatActivityDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Last updated indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <RefreshCw size={14} />
            Last updated: {stats.last_updated}
            {usingFallbackData && (
              <span className="ml-2 text-amber-600 flex items-center">
                <Info size={14} className="mr-1" /> 
                Showing all data due to limited data in selected time period
              </span>
            )}
          </p>
        </div>
      </div>
    </ClientOnly>
  );
  
  // Utility function for activity icons
  function getActivityIcon(activity) {
    // Determine icon based on activity type
    const type = activity.type || 'default';
    switch (type) {
      case 'application_created': return <FileText size={18} />;
      case 'status_change': return <AlertCircle size={18} />;
      case 'payment': return <DollarSign size={18} />;
      case 'note_added': return <BookOpen size={18} />;
      default: return <Activity size={18} />;
    }
  }
  
  // Utility function for activity icon colors
  function getActivityIconColor(activity) {
    // Determine color based on activity type
    const type = activity.type || 'default';
    switch (type) {
      case 'application_created': return 'bg-blue-100 text-blue-600';
      case 'status_change': return 'bg-yellow-100 text-yellow-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'note_added': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
} 