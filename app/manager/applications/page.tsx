'use client'

import React, { useState, useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { FileText, Filter, Search, User, ChevronDown, Calendar } from 'lucide-react'

// Add interface for application data
interface Application {
  id: string;
  agent_id?: string;
  status?: string;
  paid_status?: string;
  monthly_premium?: string | number;
  commission_amount?: string | number;
  carrier?: string;
  product?: string;
  created_at: string;
  agent_name?: string;
  policy_submit_date?: string;
  proposed_insured_name?: string;
  [key: string]: any; // For other properties
}

export default function ManagerApplications() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<{id: string, name: string}[]>([])
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [carrierFilter, setCarrierFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // New state for date filtering
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    async function fetchApplications() {
      const { data: currentUser } = await supabase.auth.getUser()
      
      if (!currentUser?.user?.id) return
      
      // First get agents managed by this manager
      const { data: agentsData, error: agentsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'agent')
        .eq('manager_id', currentUser.user.id)
      
      if (agentsError) {
        console.error('Error fetching agents:', agentsError)
        return
      }
      
      // Format agent names and set to state
      const formattedAgents = (agentsData || []).map(agent => ({
        id: agent.id,
        name: agent.first_name 
          ? `${agent.first_name} ${agent.last_name || ''}`
          : agent.email?.split('@')[0] || 'Unknown Agent'
      }))
      
      setAgents(formattedAgents)
      
      if (!agentsData || agentsData.length === 0) {
        // No agents, so no applications
        setApplications([])
        setLoading(false)
        return
      }
      
      const agentIds = agentsData.map(agent => agent.id)
      
      // Try multiple approaches to get applications data
      console.log(`Attempting to query applications table`);
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*, profiles!applications_agent_id_fkey(first_name, last_name, email)')
        .order('created_at', { ascending: false });
      
      if (appsError) {
        console.error('Error fetching applications data:', appsError);
      } else {
        console.log(`Found ${appsData?.length || 0} records in applications table`, appsData);
      }
      
      // Try agent_applications table
      console.log(`Attempting to query agent_applications table`);
      const { data: agentAppsData, error: agentAppsError } = await supabase
        .from('agent_applications')
        .select('*, profiles(first_name, last_name, email)');
      
      if (agentAppsError) {
        console.error('Error fetching agent_applications data:', agentAppsError);
      } else {
        console.log(`Found ${agentAppsData?.length || 0} records in agent_applications table`, agentAppsData);
      }
      
      // Try RPC function to get all applications
      console.log(`Attempting to use RPC function get_all_applications`);
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('get_all_applications');
      
      if (sqlError) {
        console.error('Error using RPC function:', sqlError);
      } else {
        console.log(`Found ${sqlData?.length || 0} records using SQL RPC`, sqlData);
        // Log the structure of the first record to understand available fields
        if (sqlData && sqlData.length > 0) {
          console.log('First record structure:', JSON.stringify(sqlData[0], null, 2));
          console.log('Field names in first record:', Object.keys(sqlData[0]));
          
          // Check if client_name field exists
          if (sqlData[0].client_name) {
            console.log('Found client_name field in RPC results');
          }
          
          // Check if insured_name field exists
          if (sqlData[0].insured_name) {
            console.log('Found insured_name field in RPC results');
          }
          
          // Check all other possible name fields
          ['proposed_insured_name', 'full_name', 'name', 'insured_first_name', 'client_first_name'].forEach(field => {
            if (sqlData[0][field]) {
              console.log(`Found ${field} field in RPC results`);
            }
          });
        }
      }
      
      // Determine which data source to use
      let allApplicationsData: Application[] = [];
      
      // Use SQL query first
      if (sqlData && sqlData.length > 0) {
        console.log(`Using data from SQL RPC function`);
        allApplicationsData = sqlData;
      }
      // Then try applications table
      else if (appsData && appsData.length > 0) {
        console.log(`Using data from applications table`);
        allApplicationsData = appsData;
      } 
      // Then try agent_applications table
      else if (agentAppsData && agentAppsData.length > 0) {
        console.log(`Using data from agent_applications table`);
        allApplicationsData = agentAppsData;
      }
      // As a last attempt, try a direct query without filters
      else {
        console.log('Attempting direct query without filters as last resort');
        const { data: directQueryData, error: directQueryError } = await supabase
          .from('applications')
          .select('*');
          
        if (!directQueryError && directQueryData && directQueryData.length > 0) {
          console.log(`Found ${directQueryData.length} records with direct query`);
          allApplicationsData = directQueryData;
        } else {
          console.error('Direct query failed or returned no data:', directQueryError);
          console.log('IMPORTANT: No real data found in Supabase. Check your database tables.');
          
          // Create sample data only if explicitly enabled for development
          if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true') {
            console.log('Using fallback mock data (only because NEXT_PUBLIC_ENABLE_MOCK_DATA is true)');
            // Create 23 applications as fallback with proper dates in 2023
            const baseDate = new Date(2023, 3, 15); // April 15, 2023
            
            allApplicationsData = Array.from({ length: 23 }, (_, i) => {
              // Generate realistic dates within April-May 2023
              const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days from base date
              const appDate = new Date(baseDate);
              appDate.setDate(appDate.getDate() + daysOffset);
              
              // Generate submission date (usually 1-3 days before created date)
              const submitDate = new Date(appDate);
              submitDate.setDate(submitDate.getDate() - (Math.floor(Math.random() * 3) + 1));
              
              // Generate realistic premium values
              const monthlyPremium = Math.floor(Math.random() * 200) + 40; // $40 to $240
              
              // Calculate commission as 60% of 9-month advance premium
              const commissionAmount = Math.round((monthlyPremium * 9 * 0.6) * 100) / 100;
              
              // Generate a realistic proposed insured name
              const firstNames = ["John", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "William", "Linda", "David", "Elizabeth"];
              const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
              const insuredFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
              const insuredLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
              const insuredName = `${insuredFirstName} ${insuredLastName}`;
              
              return {
                id: `fallback-${i}`,
                agent_id: agentIds[Math.floor(Math.random() * agentIds.length)],
                status: i < 5 ? '1st Month Paid' : 
                        i < 10 ? 'Approved' : 
                        i < 15 ? 'Pending' : 
                        i < 18 ? 'UW' : 
                        i < 20 ? 'Cancelled' : 
                        i < 22 ? 'Declined' : 'Not taken',
                monthly_premium: monthlyPremium,
                commission_amount: commissionAmount,
                proposed_insured_name: insuredName,
                carrier: ['Americo', 'AIG', 'IULE', 'CBO', 'GWUL', 'Royal Neighbors'][i % 6],
                product: ['Eagle Select 1', 'Eagle Select', 'Eagle Select 3', 'CBO 100', 'SIWL', 'IULE'][i % 6],
                created_at: appDate.toISOString(),
                policy_submit_date: submitDate.toISOString(),
                policy_health: i < 5 ? 'Active' : 
                               i < 10 ? 'Pending' : 
                               i < 12 ? 'Needs Attention' : '',
                paid_status: i < 7 ? 'Paid' : ''
              };
            });
          }
        }
      }
      
      // Filter for this manager's agents using more flexible approach
      const applicationsForAgents = allApplicationsData.filter((app: Application) => 
        !app.agent_id || 
        agentIds.includes(app.agent_id) || 
        agentIds.some(id => app.agent_id?.toLowerCase() === id.toLowerCase())
      );
      
      console.log(`Found ${applicationsForAgents.length} applications for this manager's agents`);
      
      // Combine with agent data and preserve original data
      const appsWithAgents = applicationsForAgents.map(app => {
        const agent = agentsData.find(a => a.id === app.agent_id) || {}
        
        // Check for various name fields that might be in the data
        let proposedInsuredName = null;
        
        // Try all possible field names for the proposed insured
        const possibleNameFields = [
          'proposed_insured',       // Add this field which is in the RPC data
          'proposed_insured_name',
          'client_name',         
          'insured_name',
          'name',
          'full_name',
          'client_first_name',
          'insured_first_name'
        ];
        
        // Log the app object to debug
        console.log('Processing app record:', app);
        
        // Try each possible field name
        for (const field of possibleNameFields) {
          if (app[field]) {
            proposedInsuredName = app[field];
            console.log(`Found name in field '${field}': ${proposedInsuredName}`);
            break;
          }
        }
        
        // Check for client_data to see if it contains proposed_insured_name
        if (!proposedInsuredName && app.client_data) {
          try {
            // If client_data is a string, try to parse it as JSON
            const clientData = typeof app.client_data === 'string' 
              ? JSON.parse(app.client_data) 
              : app.client_data;
              
            // Check various possible fields where the name might be stored
            for (const field of possibleNameFields) {
              if (clientData[field]) {
                proposedInsuredName = clientData[field];
                console.log(`Found name in client_data.${field}: ${proposedInsuredName}`);
                break;
              }
            }
          } catch (e) {
            console.error('Error parsing client_data:', e);
          }
        }
        
        return {
          ...app,
          agent_name: agent.first_name 
            ? `${agent.first_name} ${agent.last_name || ''}`
            : agent.email?.split('@')[0] || 'Unknown Agent',
          agent_email: agent.email || 'No Email',
          // Use proposedInsuredName if we found it, otherwise use the existing field or fallback
          proposed_insured_name: proposedInsuredName || app.proposed_insured_name || 'Not Available',
          // Preserve the proposed_insured field as well
          proposed_insured: app.proposed_insured || proposedInsuredName || 'Not Available'
        }
      })
      
      // Sort by date descending
      appsWithAgents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setApplications(appsWithAgents)
      setFilteredApplications(appsWithAgents)
      setLoading(false)
      
      // Log if we found the proposed_insured field in the first app record
      if (applicationsForAgents.length > 0 && applicationsForAgents[0].proposed_insured) {
        console.log('First app has proposed_insured field:', applicationsForAgents[0].proposed_insured);
      }
    }
    
    if (!roleLoading) {
      fetchApplications()
    }
  }, [roleLoading, supabase])
  
  // Filter applications whenever filter or search term changes
  useEffect(() => {
    let result = [...applications];
    
    // Apply agent filter
    if (agentFilter !== 'all') {
      result = result.filter(app => app.agent_id === agentFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => {
        const appStatus = (app.status || '').toLowerCase();
        
        if (statusFilter === 'approved') {
          return appStatus === 'approved' || appStatus === '1st month paid';
        } else if (statusFilter === 'pending') {
          return appStatus === 'pending' || appStatus === 'uw' || appStatus === 'in review';
        } else if (statusFilter === 'declined') {
          return appStatus === 'declined' || appStatus === 'cancelled' || appStatus === 'cancellation requested';
        } else {
          return appStatus === statusFilter;
        }
      });
    }
    
    // Apply carrier filter
    if (carrierFilter !== 'all') {
      result = result.filter(app => (app.carrier || '').toLowerCase() === carrierFilter.toLowerCase());
    }
    
    // Apply date range filter
    if (startDate) {
      const startDateObj = new Date(startDate);
      result = result.filter(app => {
        const appDate = new Date(getDisplayDate(app));
        return appDate >= startDateObj;
      });
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      // Set end date to end of day
      endDateObj.setHours(23, 59, 59, 999);
      result = result.filter(app => {
        const appDate = new Date(getDisplayDate(app));
        return appDate <= endDateObj;
      });
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => {
        return (
          (app.agent_name || '').toLowerCase().includes(term) ||
          (app.carrier || '').toLowerCase().includes(term) ||
          (app.product || '').toLowerCase().includes(term) ||
          (app.status || '').toLowerCase().includes(term)
        );
      });
    }
    
    setFilteredApplications(result);
  }, [statusFilter, agentFilter, carrierFilter, searchTerm, startDate, endDate, applications]);
  
  // Get unique carriers for filtering
  const carriers = [...new Set(applications.map(app => app.carrier))].filter(Boolean).sort();

  // Format date consistently
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Always use 2023 as the year for this legacy application
    date.setFullYear(2023);
    
    // Format date as MM/DD/YYYY
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Format currency with proper dollar sign and decimal places
  const formatCurrency = (amount: string | number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    
    // If it's a string, try to parse it as a number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (isNaN(numAmount)) return '$0.00';
    
    // Format with dollar sign and two decimal places
    return `$${numAmount.toFixed(2)}`;
  };
  
  // Calculate the 9-month advance AP (annualized premium)
  const calculateAdvanceAP = (monthlyPremium: string | number | undefined) => {
    if (monthlyPremium === undefined || monthlyPremium === null) return 0;
    
    // If it's a string, try to parse it as a number
    const numAmount = typeof monthlyPremium === 'string' ? parseFloat(monthlyPremium) : monthlyPremium;
    
    // Check if it's a valid number
    if (isNaN(numAmount)) return 0;
    
    // Calculate 9-month advance AP
    return numAmount * 9;
  };

  // Calculate the agent's commission (60% of 9-month AP)
  const calculateAgentCommission = (app: Application) => {
    // Use the existing commission_amount if available
    if (app.commission_amount && !isNaN(parseFloat(String(app.commission_amount)))) {
      return parseFloat(String(app.commission_amount));
    }
    
    // Calculate from monthly premium if available
    if (app.monthly_premium && !isNaN(parseFloat(String(app.monthly_premium)))) {
      const monthlyPremium = parseFloat(String(app.monthly_premium));
      // Calculate 60% of 9-month AP (Monthly Premium * 9 * 0.6)
      return monthlyPremium * 9 * 0.6;
    }
    
    return 0;
  };

  // Get the correct date to display - use policy_submit_date if available, otherwise created_at
  const getDisplayDate = (app: Application) => {
    return app.policy_submit_date || app.created_at;
  };

  // Format date for input field
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DD for input type="date"
    return date.toISOString().split('T')[0];
  };

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          All Applications
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold">Applications List</h2>
          
          {/* Search and filter bar */}
          {applications.length > 0 && (
            <div className="w-full md:w-auto grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* Search box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Date range filters */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  placeholder="Start Date"
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  placeholder="End Date"
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              {/* Agent filter */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  className="pl-10 pr-4 py-2 border rounded-md w-full appearance-none"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <option value="all">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              {/* Status filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  className="pl-10 pr-4 py-2 border rounded-md w-full appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined/Cancelled</option>
                  <option value="1st month paid">1st Month Paid</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              {/* Carrier filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  className="pl-10 pr-4 py-2 border rounded-md w-full appearance-none"
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                >
                  <option value="all">All Carriers</option>
                  {carriers.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : applications.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposed Insured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Premium</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">9-Month AP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(getDisplayDate(app))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {(app.agent_name || 'UA').substring(0, 2)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{app.agent_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.proposed_insured || app.proposed_insured_name || 'Not Available'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.carrier || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.product || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(app.monthly_premium)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {formatCurrency(calculateAdvanceAP(app.monthly_premium))}
                          <span className="ml-1 text-xs text-blue-600 font-medium">(9mo)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(calculateAgentCommission(app))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          (app.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                          (app.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (app.status || '').toLowerCase() === 'uw' ? 'bg-yellow-100 text-yellow-800' :
                          (app.status || '').toLowerCase() === 'not taken' ? 'bg-yellow-100 text-yellow-800' :
                          (app.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                          (app.status || '').toLowerCase() === '1st month paid' ? 'bg-green-100 text-green-800' :
                          (app.status || '').toLowerCase() === 'declined' ? 'bg-red-100 text-red-800' :
                          (app.status || '').toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                          (app.status || '').toLowerCase() === 'cancellation requested' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Results summary */}
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredApplications.length} of {applications.length} applications
              {agentFilter !== 'all' && ` for ${agents.find(a => a.id === agentFilter)?.name}`}
              {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              {carrierFilter !== 'all' && ` from ${carrierFilter}`}
              {startDate && ` from ${new Date(startDate).toLocaleDateString()}`}
              {endDate && ` to ${new Date(endDate).toLocaleDateString()}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </>
        ) : agents.length > 0 ? (
          <p className="text-gray-600">
            No applications have been submitted by your agents yet.
          </p>
        ) : (
          <p className="text-gray-600">
            You don't have any agents assigned to you yet. Please ask an administrator to assign agents to your management.
          </p>
        )}
      </div>
    </div>
  )
}