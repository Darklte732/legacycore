"use client"

import '../../agent/applications/millennial-styles.css'

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AgentApplication } from "@/types/application"
import { DataTable } from "../../agent/applications/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Download, FileUp, HelpCircle, AlertCircle, Check, X, ArrowRight, Upload, Loader2, UploadCloud, CheckCircle, Pencil, Trash, Wand2, Eraser, XCircle } from "lucide-react"
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
import { useDropzone } from 'react-dropzone'
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
import { Checkbox } from "@/components/ui/checkbox"

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

export default function ManagerMyApplicationsPage() {
  const [applications, setApplications] = useState<AgentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [bulkData, setBulkData] = useState('')
  const [bulkDataPreview, setBulkDataPreview] = useState<any[]>([])
  const [parseError, setParseError] = useState('')
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importMethod, setImportMethod] = useState<'paste' | 'file'>('paste')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({})
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [mappingStep, setMappingStep] = useState(false)
  const [validRows, setValidRows] = useState(0)
  const [invalidRows, setInvalidRows] = useState(0)
  const [importSuccess, setImportSuccess] = useState(false)
  const [importFeedback, setImportFeedback] = useState<string[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentApplication, setCurrentApplication] = useState<AgentApplication | null>(null)
  const [editFormValues, setEditFormValues] = useState<Partial<AgentApplication>>({})
  const [rowSelection, setRowSelection] = useState({})
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkEditValues, setBulkEditValues] = useState<Partial<AgentApplication>>({})
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState("")
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const wasLoggedIn = useRef(false)

  // Calculate dashboard metrics based on applications data
  const calculateMetrics = () => {
    const totalPolicies = applications.length;
    const approvedPolicies = applications.filter(app => app.status === "Approved").length;
    
    // Update to only show applications with policy_health = "Needs Attention"
    const needsAttentionPolicies = applications.filter(app => 
      app.policy_health === "Needs Attention"
    ).length;
    
    // Update the paid policies count to include both paid status and issued status
    const paidPolicies = applications.filter(app => 
      (app.status === "Approved" || app.status === "Live" || app.status === "1st Month Paid") && 
      app.paid_status === "Paid"
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

  // Check authentication and redirect if not logged in
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      
      try {
        // Use Supabase API instead of checking tokens directly
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw new Error("Authentication error: " + error.message);
        }
        
        if (!session) {
          console.log('No active session found, redirecting to login');
          toast({
            title: "Authentication Required",
            description: "Please log in to view applications",
            variant: "destructive",
          });
          
          router.push('/login?redirect=/manager/my-applications');
          return;
        }
        
        // Check if user has manager role
        const { data: userData, error: userError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') { // Not found error
          console.error('Error fetching user role:', userError);
          // Continue anyway, role might be assigned differently
        }
        
        if (userData && !['manager', 'admin'].includes(userData.role)) {
          console.log('User does not have manager or admin role, redirecting');
          toast({
            title: "Access Denied",
            description: "You need manager permissions to access this page",
            variant: "destructive",
          });
          
          router.push('/agent/dashboard');
          return;
        }
        
        // Set cookie for manager role
        document.cookie = "test_role=manager; path=/; max-age=86400";
        
        wasLoggedIn.current = true;
        fetchManagerApplications();
      } catch (err) {
        console.error('Authentication error:', err);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again",
          variant: "destructive",
        });
        
        router.push('/login?redirect=/manager/my-applications');
      }
    }
    
    checkAuth();
  }, []);

  // Fetch applications created by or assigned to this manager
  async function fetchManagerApplications() {
    setLoading(true);
    
    try {
      // Get the user's role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get current manager ID
      const managerId = user.id;
      
      // Query applications where:
      // 1. Applications created by this manager (created_by = manager ID) OR
      // 2. Applications where the manager_id field matches the current manager ID
      const { data, error } = await supabase
        .from('agent_applications')
        .select(`
          *,
          client_state,
          created_by,
          manager_id,
          agent_id,
          product
        `)
        .or(`created_by.eq.${managerId},manager_id.eq.${managerId}`);
      
      if (error) {
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} manager applications`);
      
      // Add calculated fields
      const processedApplications = data?.map(app => {
        // Calculate policy_health based on status
        let policyHealth = "Healthy";
        
        // Status mappings from policy values to user-friendly status
        if (app.status === 'Approved' || app.status === 'Live' || app.status === '1st Month Paid') {
          policyHealth = "Healthy";
        } else if (app.status === 'Pending' || app.status === 'In Progress' || app.status === 'Submitted') {
          policyHealth = "In Process";
        } else if (app.status === 'Needs Attention' || app.status === 'Incomplete' || app.status === 'Not Taken' || app.status === 'Lapsed') {
          policyHealth = "Needs Attention";
        } else if (app.status === 'Cancelled' || app.status === 'Declined') {
          policyHealth = "Cancelled";
        }
        
        // Special handling for pending status
        if (app.paid_status === 'Pending First Payment') {
          policyHealth = "Pending First Payment";
        }
        
        // Calculate annual premium if not already set
        let annualPremium = app.ap || null;
        
        if (!annualPremium && app.monthly_premium) {
          // Otherwise calculate it based on monthly premium
          let monthlyPremium = 0;
          
          if (app.monthly_premium) {
            monthlyPremium = typeof app.monthly_premium === 'number' ? 
              app.monthly_premium : 
              parseFloat(app.monthly_premium);
            annualPremium = monthlyPremium * 12;
          }
        }
        
        // Calculate commission if not set
        const calculatedCommission = app.commission_amount || 0;
        
        // Format created_at and other date fields consistently
        const createdAt = app.created_at ? new Date(app.created_at).toISOString() : null;
        
        return {
          ...app,
          policy_health: policyHealth, 
          ap: annualPremium,
          commission_amount: calculatedCommission,
          created_at: createdAt
        };
      }) || [];
      
      setApplications(processedApplications);
      console.log('All loaded applications:', processedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  function getApplicationsForTab(tab: string) {
    console.log(`Filtering applications for tab: ${tab}`);
    console.log('Available applications:', applications.length);
    
    if (tab === 'all') {
      return applications;
    }
    
    if (tab === 'healthy') {
      return applications.filter(app => 
        app.policy_health === 'Healthy'
      );
    }
    
    if (tab === 'pendingFirstPayment') {
      return applications.filter(app => 
        app.paid_status === 'Pending First Payment'
      );
    }
    
    if (tab === 'needsAttention') {
      return applications.filter(app => 
        app.policy_health === 'Needs Attention'
      );
    }
    
    if (tab === 'cancelled') {
      return applications.filter(app => 
        app.policy_health === 'Cancelled' || app.status === 'Cancelled' || app.status === 'Declined'
      );
    }
    
    if (tab === 'paid') {
      return applications.filter(app => 
        app.paid_status === 'Paid'
      );
    }
    
    if (tab === 'unpaid') {
      return applications.filter(app => 
        app.paid_status === 'Unpaid' 
      );
    }
    
    if (tab === 'inProcess') {
      return applications.filter(app => 
        app.policy_health === 'In Process'
      );
    }
    
    return applications;
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Manager Applications</h1>
            <p className="text-gray-500">
              Applications created by you or assigned to your management
            </p>
          </div>
          
          {loading ? (
            <ApplicationSkeletonLoader />
          ) : (
            <>
              <DashboardMetrics />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 items-center">
                  <PaymentHistoryLegend />
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
                    <DataTable columns={columns} data={getApplicationsForTab('all')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="healthy" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('healthy')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="pendingFirstPayment" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('pendingFirstPayment')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="needsAttention" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('needsAttention')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="cancelled" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('cancelled')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="paid" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('paid')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="unpaid" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('unpaid')} />
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="inProcess" className="space-y-4">
                  <ErrorBoundary>
                    <DataTable columns={columns} data={getApplicationsForTab('inProcess')} />
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