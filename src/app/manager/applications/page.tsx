'use client'

import '../../agent/applications/millennial-styles.css'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AgentApplication } from "@/types/application"
import { DataTable } from "../../agent/applications/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Download, FileUp, HelpCircle, AlertCircle, Check, X, ArrowRight, Upload, Loader2, UploadCloud, CheckCircle, Pencil, Trash, Wand2, Eraser, XCircle, FileText, Eye } from "lucide-react"
import { columns } from "../../agent/applications/columns"
import { PaymentHistoryLegend } from "../../agent/applications/components/PaymentComponents"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ApplicationActions } from "@/components/ApplicationActions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ErrorBoundary } from '../../agent/applications/components/ErrorBoundary'
import { useRole } from '@/hooks/useRole'

// Application Skeleton Loader Component
const ApplicationSkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="flex items-center justify-between border-b pb-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
  policy_health?: string;
  ap?: number;
  [key: string]: any; // For other properties
}

export default function ManagerApplicationsPage() {
  const { role, loading: roleLoading } = useRole()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<{id: string, name: string}[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [selectedAgent, setSelectedAgent] = useState("all")
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [carrierFilter, setCarrierFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // New state for date filtering
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Calculate dashboard metrics based on applications data
  const calculateMetrics = () => {
    const totalPolicies = applications.length;
    const approvedPolicies = applications.filter(app => 
      app.status?.toLowerCase() === "approved" || 
      app.status?.toLowerCase() === "1st month paid"
    ).length;
    
    // Update to only show applications with policy_health = "Needs Attention"
    const needsAttentionPolicies = applications.filter(app => 
      app.policy_health === "Needs Attention"
    ).length;
    
    // Update the paid policies count to include both paid status and issued status
    const paidPolicies = applications.filter(app => 
      (app.status?.toLowerCase() === "approved" || 
       app.status?.toLowerCase() === "live" || 
       app.status?.toLowerCase() === "1st month paid") && 
      app.paid_status?.toLowerCase() === "paid"
    ).length;
    
    // Calculate total annual premium
    const totalAnnualPremium = applications.reduce((sum, app) => {
      // Convert monthly premium to annual premium
      const monthlyPremium = typeof app.monthly_premium === 'number' 
        ? app.monthly_premium 
        : parseFloat(app.monthly_premium || '0');
      return sum + (monthlyPremium * 12);
    }, 0);
    
    return {
      totalPolicies,
      approvedPolicies,
      needsAttentionPolicies,
      paidPolicies,
      totalAnnualPremium
    };
  };

  // Dashboard metrics component
  const DashboardMetrics = () => {
    const metrics = calculateMetrics();
    
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Policies Card */}
          <Card className="stat-card total card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Total Policies</p>
                  <h3 className="stat-value">{metrics.totalPolicies}</h3>
                </div>
                <div className="stat-icon">
                  <FileUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Approved Policies Card */}
          <Card className="stat-card approved card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Approved</p>
                  <h3 className="stat-value">{metrics.approvedPolicies}</h3>
                </div>
                <div className="stat-icon">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Needs Attention Card */}
          <Card className="stat-card attention card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Needs Attention</p>
                  <h3 className="stat-value">{metrics.needsAttentionPolicies}</h3>
                </div>
                <div className="stat-icon">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Paid/Issued Policies Card */}
          <Card className="stat-card paid card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Paid/Issued</p>
                  <h3 className="stat-value">{metrics.paidPolicies}</h3>
                </div>
                <div className="stat-icon">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Annual Premium Card */}
          <Card className="stat-card premium card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Annual Premium</p>
                  <h3 className="stat-value">${metrics.totalAnnualPremium.toLocaleString()}</h3>
                </div>
                <div className="stat-icon">
                  <svg fill="none" className="h-6 w-6" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                    <path d="M12 18V6"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  useEffect(() => {
    async function fetchApplications() {
      if (roleLoading) return;
      
      setLoading(true);
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
        setLoading(false)
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
      let appsData = null;
      let appsError = null;
      
      // First, try the RPC function - this is the most efficient approach
      console.log(`Attempting to use RPC function get_all_applications`);
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('get_all_applications');
      
      if (sqlError) {
        console.error('Error using RPC function:', sqlError);
      } else {
        console.log(`Found ${sqlData?.length || 0} records using SQL RPC`);
        if (sqlData && sqlData.length > 0) {
          // Use this data if available
          appsData = sqlData;
          
          // Get agent details in a separate query to avoid foreign key issues
          const agentIds = [...new Set(sqlData.map(app => app.agent_id).filter(id => id))];
          
          if (agentIds.length > 0) {
            const { data: agentDetails, error: agentDetailsError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .in('id', agentIds);
              
            if (!agentDetailsError && agentDetails) {
              // Manually join the agent details to each application
              appsData = sqlData.map(app => {
                const agent = agentDetails.find(a => a.id === app.agent_id);
                return {
                  ...app,
                  agent_name: agent ? `${agent.first_name} ${agent.last_name}` : 'Unknown Agent',
                  agent_email: agent?.email,
                  profiles: agent
                };
              });
              
              console.log(`Successfully joined agent details to applications`);
            }
          }
        }
      }
      
      // If the RPC approach didn't work, fall back to direct table queries
      if (!appsData) {
        // Try applications table
        console.log(`Attempting to query applications table directly`);
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });
          
        appsData = data;
        appsError = error;
        
        if (error) {
          console.error('Error fetching applications data:', error);
        } else {
          console.log(`Found ${data?.length || 0} records in applications table`);
          
          // Get agent details separately
          if (data && data.length > 0) {
            const agentIds = [...new Set(data.map(app => app.agent_id).filter(id => id))];
            
            if (agentIds.length > 0) {
              const { data: agentDetails } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email')
                .in('id', agentIds);
                
              if (agentDetails) {
                // Manually join the agent details
                appsData = data.map(app => {
                  const agent = agentDetails.find(a => a.id === app.agent_id);
                  return {
                    ...app,
                    agent_name: agent ? `${agent.first_name} ${agent.last_name}` : 'Unknown Agent',
                    agent_email: agent?.email,
                    profiles: agent
                  };
                });
              }
            }
          }
        }
      }
      
      // If still no data, try agent_applications table
      if (!appsData || appsData.length === 0) {
        console.log(`Attempting to query agent_applications table`);
        const { data, error } = await supabase
          .from('agent_applications')
          .select('*');
          
        if (error) {
          console.error('Error fetching agent_applications data:', error);
        } else if (data && data.length > 0) {
          console.log(`Found ${data.length} records in agent_applications table`);
          appsData = data;
          
          // Get agent details separately
          const agentIds = [...new Set(data.map(app => app.agent_id).filter(id => id))];
          
          if (agentIds.length > 0) {
            const { data: agentDetails } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .in('id', agentIds);
              
            if (agentDetails) {
              // Manually join the agent details
              appsData = data.map(app => {
                const agent = agentDetails.find(a => a.id === app.agent_id);
                return {
                  ...app,
                  agent_name: agent ? `${agent.first_name} ${agent.last_name}` : 'Unknown Agent',
                  agent_email: agent?.email,
                  profiles: agent
                };
              });
            }
          }
        }
      }
      
      // Use our collected data or fallback to direct query as last resort
      let allApplicationsData: Application[] = [];
      
      if (appsData && appsData.length > 0) {
        console.log(`Using collected application data, ${appsData.length} records available`);
        allApplicationsData = appsData;
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
          
          // Get agent details separately
          const agentIds = [...new Set(directQueryData.map(app => app.agent_id).filter(id => id))];
          
          if (agentIds.length > 0) {
            const { data: agentDetails } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .in('id', agentIds);
              
            if (agentDetails) {
              // Manually join the agent details
              allApplicationsData = directQueryData.map(app => {
                const agent = agentDetails.find(a => a.id === app.agent_id);
                return {
                  ...app,
                  agent_name: agent ? `${agent.first_name} ${agent.last_name}` : 'Unknown Agent',
                  agent_email: agent?.email,
                  profiles: agent
                };
              });
            }
          }
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
              
              // Calculate commission as split percentage of 9-month advance premium
              const splitPercentage = 20; // Default manager split
              const monthlyPremiumNum = parseFloat(String(monthlyPremium));
              const advanceAP = monthlyPremiumNum * 9;
              const commissionAmount = Math.round((advanceAP * (splitPercentage / 100)) * 100) / 100;
              
              // Generate a realistic proposed insured name
              const firstNames = ["John", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "William", "Linda", "David", "Elizabeth"];
              const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
              const insuredFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
              const insuredLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
              const insuredName = `${insuredFirstName} ${insuredLastName}`;
              
              const status = i < 5 ? '1st Month Paid' : 
                        i < 10 ? 'Approved' : 
                        i < 15 ? 'Pending' : 
                        i < 18 ? 'UW' : 
                        i < 20 ? 'Cancelled' : 
                        i < 22 ? 'Declined' : 'Not taken';
              
              // Calculate policy health
              let policyHealth = "Healthy";
              if (status === 'Approved' || status === 'Live' || status === '1st Month Paid') {
                policyHealth = "Healthy";
              } else if (status === 'Pending' || status === 'UW') {
                policyHealth = "In Process";
              } else if (status === 'Not taken') {
                policyHealth = "Needs Attention";
              } else if (status === 'Cancelled' || status === 'Declined') {
                policyHealth = "Cancelled";
              }
              
              return {
                id: `fallback-${i}`,
                agent_id: agentIds[Math.floor(Math.random() * agentIds.length)],
                status: status,
                monthly_premium: monthlyPremium,
                commission_amount: commissionAmount,
                split_percentage: splitPercentage,
                policy_health: policyHealth,
                proposed_insured_name: insuredName,
                carrier: ['Americo', 'AIG', 'IULE', 'CBO', 'GWUL', 'Royal Neighbors'][i % 6],
                product: ['Eagle Select 1', 'Eagle Select', 'Eagle Select 3', 'CBO 100', 'SIWL', 'IULE'][i % 6],
                created_at: appDate.toISOString(),
                policy_submit_date: submitDate.toISOString(),
                paid_status: i < 7 ? 'Paid' : 'Unpaid',
                ap: monthlyPremium * 12
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
      
      // Combine with agent data and process applications
      const processedApplications = applicationsForAgents.map(app => {
        const agent = agentsData.find(a => a.id === app.agent_id) || {}
        
        // Find proposed insured name from various possible fields
        let proposedInsuredName = null;
        const possibleNameFields = [
          'proposed_insured',
          'proposed_insured_name',
          'client_name',         
          'insured_name',
          'name',
          'full_name',
          'client_first_name',
          'insured_first_name'
        ];
        
        // Try each possible field name
        for (const field of possibleNameFields) {
          if (app[field]) {
            proposedInsuredName = app[field];
            break;
          }
        }
        
        // Check client_data for name if not found above
        if (!proposedInsuredName && app.client_data) {
          try {
            const clientData = typeof app.client_data === 'string' 
              ? JSON.parse(app.client_data) 
              : app.client_data;
              
            for (const field of possibleNameFields) {
              if (clientData[field]) {
                proposedInsuredName = clientData[field];
                break;
              }
            }
          } catch (e) {
            console.error('Error parsing client_data:', e);
          }
        }
        
        // Calculate policy_health if not already set
        let policyHealth = app.policy_health || "Healthy";
        
        if (!app.policy_health) {
          const status = (app.status || '').toLowerCase();
          if (status === 'approved' || status === 'live' || status === '1st month paid') {
            policyHealth = "Healthy";
          } else if (status === 'pending' || status === 'in progress' || status === 'uw') {
            policyHealth = "In Process";
          } else if (status === 'needs attention' || status === 'incomplete' || status === 'not taken' || status === 'lapsed') {
            policyHealth = "Needs Attention";
          } else if (status === 'cancelled' || status === 'declined') {
            policyHealth = "Cancelled";
          }
        }
        
        // Calculate annual premium if not already set
        let annualPremium = app.ap || 0;
        if (!annualPremium && app.monthly_premium) {
          const monthlyPremium = typeof app.monthly_premium === 'number' ? 
            app.monthly_premium : 
            parseFloat(app.monthly_premium || '0');
          annualPremium = monthlyPremium * 12;
        }
        
        // Calculate manager's commission (split percentage of 9-month AP)
        let managerCommission = app.commission_amount || 0;
        if (!managerCommission && app.monthly_premium) {
          // Get split percentage (default to 20% if not available)
          const splitPercentage = app.split_percentage ? 
            parseFloat(String(app.split_percentage)) : 
            app.paid_split ? parseFloat(String(app.paid_split)) : 20;
          
          const monthlyPremium = typeof app.monthly_premium === 'number' ? 
            app.monthly_premium : 
            parseFloat(app.monthly_premium || '0');
          
          // Calculate manager's commission: split percentage of 9-month AP
          managerCommission = monthlyPremium * 9 * (splitPercentage / 100);
        }
        
        return {
          ...app,
          agent_name: agent.first_name 
            ? `${agent.first_name} ${agent.last_name || ''}`
            : agent.email?.split('@')[0] || 'Unknown Agent',
          agent_email: agent.email || 'No Email',
          proposed_insured_name: proposedInsuredName || app.proposed_insured_name || 'Not Available',
          proposed_insured: app.proposed_insured || proposedInsuredName || 'Not Available',
          policy_health: policyHealth,
          ap: annualPremium,
          commission_amount: managerCommission
        }
      });
      
      // Sort by date descending
      processedApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setApplications(processedApplications)
      setLoading(false)
    }
    
      fetchApplications()
  }, [roleLoading, supabase])
  
  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  function getApplicationsForTab(tab: string) {
    // First filter by the selected agent
    let filteredApps = applications;
    
    if (selectedAgent !== 'all') {
      filteredApps = filteredApps.filter(app => app.agent_id === selectedAgent);
    }
    
    // Then apply tab filtering
    if (tab === 'all') {
      return filteredApps;
    }
    
    if (tab === 'healthy') {
      return filteredApps.filter(app => 
        app.policy_health === 'Healthy'
      );
    }
    
    if (tab === 'pendingFirstPayment') {
      return filteredApps.filter(app => 
        app.paid_status === 'Pending First Payment'
      );
    }
    
    if (tab === 'needsAttention') {
      return filteredApps.filter(app => 
        app.policy_health === 'Needs Attention'
      );
    }
    
    if (tab === 'cancelled') {
      return filteredApps.filter(app => 
        app.policy_health === 'Cancelled' || 
        app.status?.toLowerCase() === 'cancelled' || 
        app.status?.toLowerCase() === 'declined'
      );
    }
    
    if (tab === 'paid') {
      return filteredApps.filter(app => 
        app.paid_status?.toLowerCase() === 'paid'
      );
    }
    
    if (tab === 'unpaid') {
      return filteredApps.filter(app => 
        app.paid_status?.toLowerCase() === 'unpaid'
      );
    }
    
    if (tab === 'inProcess') {
      return filteredApps.filter(app => 
        app.policy_health === 'In Process'
      );
    }
    
    return filteredApps;
  }

  // Make columns with proper manager actions and links
  const managerColumns = columns.map(column => {
    // Update the actions column
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: any) => {
          const application = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                onClick={() => {
                  console.log("Navigating to application details page:", application.id);
                  window.location.href = `/manager/applications/${application.id}`;
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
              <ApplicationActions applicationId={application.id} role="manager" />
            </div>
          );
        }
      };
    }
    
    // Update the proposed_insured (applicant name) column to link to manager paths
    if (column.accessorKey === 'proposed_insured') {
      return {
        ...column,
        cell: ({ row }: any) => {
          const id = row.original.id;
          const name = row.getValue('proposed_insured') as string;
          return (
            <div className="name-cell">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    href={`/manager/applications/${id}`} 
                    className="font-medium text-blue-600 hover:underline whitespace-nowrap"
                  >
                    {name}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Client: {name}</p>
                  <p className="text-xs text-muted-foreground">Click to view application details</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        }
      };
    }
    
    return column;
  });

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          All Applications
        </h1>
            <p className="text-gray-500">
              All applications from your team of agents
            </p>
      </div>
          
          {loading ? (
            <ApplicationSkeletonLoader />
          ) : (
            <>
              <DashboardMetrics />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4 items-center">
                  <PaymentHistoryLegend />

                  {/* Agent Filter Dropdown */}
              <div className="relative">
                    <Select
                      value={selectedAgent}
                      onValueChange={(value) => setSelectedAgent(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                  {agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              
                <div className="flex space-x-2">
                  <Link href="/manager/script-assistant">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Application
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="healthy">
                    <span className="hidden md:inline">Healthy</span>
                    <span className="md:hidden">✅</span>
                  </TabsTrigger>
                  <TabsTrigger value="pendingFirstPayment">
                    <span className="hidden md:inline">Pending Payment</span>
                    <span className="md:hidden">💰</span>
                  </TabsTrigger>
                  <TabsTrigger value="needsAttention">
                    <span className="hidden md:inline">Needs Attention</span>
                    <span className="md:hidden">⚠️</span>
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    <span className="hidden md:inline">Cancelled</span>
                    <span className="md:hidden">❌</span>
                  </TabsTrigger>
                  <TabsTrigger value="paid">
                    <span className="hidden md:inline">Paid</span>
                    <span className="md:hidden">💵</span>
                  </TabsTrigger>
                  <TabsTrigger value="unpaid">
                    <span className="hidden md:inline">Unpaid</span>
                    <span className="md:hidden">📝</span>
                  </TabsTrigger>
                  <TabsTrigger value="inProcess">
                    <span className="hidden md:inline">In Process</span>
                    <span className="md:hidden">⏳</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('all')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="healthy" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('healthy')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="pendingFirstPayment" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('pendingFirstPayment')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="needsAttention" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('needsAttention')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="cancelled" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('cancelled')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="paid" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('paid')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="unpaid" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('unpaid')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="inProcess" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={managerColumns} data={getApplicationsForTab('inProcess')} />
                  </ErrorBoundary>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}