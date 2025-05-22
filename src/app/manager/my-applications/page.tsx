"use client"

import '../../agent/applications/millennial-styles.css'
import './dialog-styles.css'

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
import Papa from 'papaparse'

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
  const [allMappableFields, setAllMappableFields] = useState<string[]>([])
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
            
      console.log(`Fetching applications for manager ID: ${managerId}`);
            
      // Try to use the get_manager_applications RPC function first
      console.log(`Attempting to use RPC function get_manager_applications`);
      let managerApplications = null;
      
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_manager_applications', { manager_id: managerId });
            
        if (rpcError) {
          console.error("Error using get_manager_applications function:", rpcError);
        } else if (rpcData && rpcData.length > 0) {
          console.log(`Retrieved ${rpcData.length} applications using RPC function`);
          managerApplications = rpcData;
        }
      } catch (rpcError) {
        console.error("Error calling RPC function:", rpcError);
      }
      
      // If RPC function fails, fall back to direct query
      if (!managerApplications) {
        console.log(`RPC function failed or returned no data, falling back to direct query`);
        
        // Try applications table first
        const { data, error } = await supabase
          .from('applications')
          .select('*');
              
        if (error) {
          console.error("Error fetching all applications:", error);
          throw error;
        }
              
        console.log(`Loaded ${data?.length || 0} total applications`);
              
        // Filter applications for this manager client-side
        managerApplications = data?.filter(app => 
          app.manager_id === managerId || app.created_by === managerId
        );
        
        // If still no data, try agent_applications table
        if (!managerApplications || managerApplications.length === 0) {
          console.log(`No applications found in applications table, trying agent_applications`);
          
          const { data: agentAppsData, error: agentAppsError } = await supabase
            .from('agent_applications')
            .select('*');
            
          if (!agentAppsError && agentAppsData && agentAppsData.length > 0) {
            console.log(`Found ${agentAppsData.length} records in agent_applications table`);
            
            // Filter for this manager
            managerApplications = agentAppsData.filter(app => 
              app.manager_id === managerId || app.created_by === managerId
            );
          }
        }
      }
            
      console.log(`Found ${managerApplications?.length || 0} applications for this manager`);

      // Add calculated fields
      const processedApplications = managerApplications?.map((app: any) => {
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

  // Add these functions for bulk import
  const isExcelPaste = (data: string): boolean => {
    // Check if the data has tab separators and multiple lines
    return data.includes('\t') && data.includes('\n')
  }

  // Define all possible mappable fields from Supabase
  const getSupabaseFields = () => {
    return [
      // Client Information
      'client_name', 'proposed_insured', 'client_phone_number', 'client_state',
      'client_email', 'insured_name', 'customer_name', 'name', 'phone', 'email',
      'date_of_birth', 'gender', 'street_address', 'city', 'zip',
      // Policy Details
      'carrier', 'carrier_name', 'product', 'monthly_premium', 'policy_number', 
      'policy_submit_date', 'effective_policy_date', 'effective_date', 'ap',
      'policy_payment_cycle', 'primary_beneficiary', 'relationship_to_insured',
      'effective_policy_status', 'policy_type', 'coverage_amount', 'annual_premium',
      'premium', 'submit_date', 'policy_',
      // Status and Notes
      'status', 'paid_status', 'notes', 'notes_for_pay', 'policy_health',
      // Health Information
      'tobacco_nicotine_use', 'height_feet', 'height_inches', 'weight_lbs',
      'medical_lung_disease', 'medical_heart_attack', 'medical_heart_failure',
      'medical_blood_clots', 'medical_cancer', 'medical_diabetes',
      'medical_high_bp', 'medical_high_cholesterol',
      // Agent & Commission Fields
      'paid_split', 'point_of_sale', 'pms_form_filled_out', 'split_with',
      'commission_status', 'commission_paid_date', 'commission_amount',
      'commission', 'closed_by_agent', 'month', 'company', 
      'agent_id', 'manager_id', 'created_by',
      // Monthly Fields
      'month_1', 'month_2', 'month_3', 'month_4', 'month_5', 'month_6',
      'month_7', 'month_8', 'month_9', 'month_10', 'month_11', 'month_12'
    ];
  }

  function parseBulkData() {
    if (!bulkData && !uploadedFile) {
      setParseError('No data to parse. Please paste data or upload a file.')
      return
    }

    setParseError('')
    setImportProgress(10)

    // Helper function to make headers unique
    const makeHeaderUnique = (header: string, index: number) => {
      return header ? header.trim() : `Column_${index + 1}`
    }

    try {
      // For Excel paste data
      if (importMethod === 'paste' && isExcelPaste(bulkData)) {
        // Excel paste handling
        const lines = bulkData.trim().split('\n')
        const headers = lines[0].split('\t').map(makeHeaderUnique)
        
        const parsedData = lines.slice(1).map(line => {
          const values = line.split('\t')
          const row: Record<string, any> = {}
          
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          
          return row
        })
        
        // Set all available fields for mapping
        setAvailableFields(getSupabaseFields())
        
        // Store all mappable fields (CSV headers + Supabase fields)
        const allFields = [...new Set([
          ...Object.keys(parsedData[0] || {}),
          ...getSupabaseFields()
        ])];
        setAllMappableFields(allFields);
        
        setBulkDataPreview(parsedData.slice(0, 5))
        setMappingStep(true)
        setImportProgress(50)
      } 
      // For CSV file or paste
      else {
        // Default to comma separator
        const parseConfig = {
          header: true,
          skipEmptyLines: true,
          transformHeader: makeHeaderUnique,
          complete: (results: any) => {
            if (results.data.length === 0) {
              setParseError('No data found. Please check your input.')
              setImportProgress(0)
              return
            }
            
            // Set available fields for mapping
            setAvailableFields(getSupabaseFields())
            
            // Store all mappable fields (CSV headers + Supabase fields)
            const allFields = [...new Set([
              ...Object.keys(results.data[0] || {}),
              ...getSupabaseFields()
            ])];
            setAllMappableFields(allFields);
            
            setBulkDataPreview(results.data.slice(0, 5))
            setMappingStep(true)
            setImportProgress(50)
          },
          error: (error: any) => {
            console.error('Error parsing CSV:', error)
            setParseError(`Error parsing data: ${error.message}`)
            setImportProgress(0)
          }
        }
        
        if (importMethod === 'file' && uploadedFile) {
          Papa.parse(uploadedFile, parseConfig)
        } else {
          Papa.parse(bulkData, parseConfig)
        }
      }
    } catch (error) {
      console.error('Error parsing data:', error)
      setParseError('Error parsing data. Please check format and try again.')
      setImportProgress(0)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  // Dropzone for file upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0])
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  async function handleBulkImport() {
    if (!mappingStep) {
      parseBulkData()
      return
    }

    setImportLoading(true)
    setImportProgress(60)
    
    try {
      // Get data to import - either from preview or re-parse
      const dataToImport = bulkDataPreview
      
      // Set up default mappings for common fields if not already mapped
      const fieldNameMap: Record<string, string> = {
        'month': 'month',
        'policy submit date': 'policy_submit_date',
        'closed by agent': 'closed_by_agent',
        'proposed insured': 'proposed_insured',
        'client phone number': 'client_phone_number',
        'client state': 'client_state',
        'policy #': 'policy_number',
        'carrier': 'carrier',
        'product': 'product',
        'monthly premium': 'monthly_premium',
        'ap': 'ap',
        'status': 'status',
        'paid status': 'paid_status',
        'point of sale': 'point_of_sale',
        'pms form filled out': 'pms_form_filled_out',
        'split with': 'split_with',
        'effective policy date': 'effective_policy_date',
        'effective policy status': 'effective_policy_status',
        'notes': 'notes',
        'notes for pay.': 'notes_for_pay',
        'paid split?': 'paid_split',
        'month 1': 'month_1',
        'month 2': 'month_2',
        'month 3': 'month_3',
        'month 4': 'month_4',
        'month 5': 'month_5',
        'month 6': 'month_6',
        'month 7': 'month_7',
        'month 8': 'month_8',
        'month 9': 'month_9',
        'month 10': 'month_10',
        'month 11': 'month_11',
        'month 12': 'month_12'
      };
      
      // Apply default mappings for any unmapped fields
      Object.keys(dataToImport[0]).forEach(header => {
        const normalizedHeader = header.toLowerCase();
        if (!columnMappings[header] && fieldNameMap[normalizedHeader]) {
          setColumnMappings(prev => ({
            ...prev,
            [header]: fieldNameMap[normalizedHeader]
          }));
        }
      });
      
      // Track valid and invalid rows
      let validCount = 0
      let invalidCount = 0
      const feedback: string[] = []
      
      // Helper functions for data conversion
      const safeNumberConversion = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null
        const num = Number(value.toString().replace(/[^0-9.-]+/g, ''))
        return isNaN(num) ? null : num
      }
      
      const safeDateConversion = (value: any): string | null => {
        if (!value) return null
        
        try {
          // Try to parse as date string
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            // Format as YYYY-MM-DD for PostgreSQL date type
            return date.toISOString().split('T')[0]
          }
        } catch (e) {
          console.error('Error parsing date:', e)
        }
        
        // If not valid, return null
        return null
      }
      
      // Process each row
      const processedData = dataToImport.map((row: any, index: number) => {
        // Map fields using columnMappings
        const mappedRow: Record<string, any> = {}
        
        Object.entries(columnMappings).forEach(([csvHeader, dbField]) => {
          // Skip fields that are marked to be ignored or have empty values
          if (dbField && dbField !== '_ignore' && row[csvHeader] !== undefined) {
            mappedRow[dbField] = row[csvHeader]
          }
        })
        
        // Convert numeric fields
        if (mappedRow.monthly_premium !== undefined) {
          mappedRow.monthly_premium = safeNumberConversion(mappedRow.monthly_premium)
        }
        
        if (mappedRow.commission_amount !== undefined) {
          mappedRow.commission_amount = safeNumberConversion(mappedRow.commission_amount)
        }
        
        // Handle dates
        if (mappedRow.policy_submit_date) {
          mappedRow.policy_submit_date = safeDateConversion(mappedRow.policy_submit_date)
        }
        
        if (mappedRow.policy_issue_date) {
          mappedRow.policy_issue_date = safeDateConversion(mappedRow.policy_issue_date)
        }
        
        return {
          ...mappedRow,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
      
      // Get the current user ID
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      // Batch process to avoid overwhelming the database
      const batchSize = 10
      const batches = Math.ceil(processedData.length / batchSize)
      
      for (let i = 0; i < batches; i++) {
        setImportProgress(60 + Math.floor((i / batches) * 30))
        
        const batchStart = i * batchSize
        const batchEnd = Math.min((i + 1) * batchSize, processedData.length)
        const batch = processedData.slice(batchStart, batchEnd)
        
        // Add manager_id to each row
        const batchWithIds = batch.map(row => ({
          ...row,
          manager_id: userId
        }))
        
        // Insert batch into database
        const { data, error } = await supabase
          .from('applications')
          .insert(batchWithIds.map(row => ({
            ...row,
            // Ensure proper data types for Supabase
            monthly_premium: typeof row.monthly_premium === 'string' ? 
              parseFloat(row.monthly_premium) : row.monthly_premium,
            ap: row.ap ? (typeof row.ap === 'string' ? parseFloat(row.ap) : row.ap) : null,
            policy_submit_date: row.policy_submit_date || null,
            effective_policy_date: row.effective_policy_date || null,
            agent_id: userId,  // Use current user as agent too, since they're a manager
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })))
          .select()
        
        if (error) {
          console.error('Error inserting batch:', error)
          invalidCount += batch.length
          feedback.push(`Error in batch ${i+1}: ${error.message}`)
        } else {
          validCount += batch.length
          feedback.push(`Successfully imported batch ${i+1} (${batch.length} records)`)
        }
      }
      
      // Update UI with results
      setValidRows(validCount)
      setInvalidRows(invalidCount)
      setImportFeedback(feedback)
      setImportSuccess(true)
      setImportProgress(100)
      
      // Refresh applications list
      fetchManagerApplications()
      
    } catch (error) {
      console.error('Error during bulk import:', error)
      setImportFeedback([`Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
      setImportProgress(0)
    } finally {
      setImportLoading(false)
    }
  }

  function resetImportState() {
    setBulkData('')
    setBulkDataPreview([])
    setParseError('')
    setImportLoading(false)
    setUploadedFile(null)
    setImportProgress(0)
    setColumnMappings({})
    setMappingStep(false)
    setValidRows(0)
    setInvalidRows(0)
    setImportSuccess(false)
    setImportFeedback([])
    setBulkImportOpen(false)
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
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <div className="flex space-x-2">
                  <Button onClick={() => router.push('/manager/applications/new')} variant="default">
                    <Plus className="mr-2 h-4 w-4" /> New Application
                  </Button>
                  <Button onClick={() => setBulkImportOpen(true)} variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Add
                  </Button>
                </div>
              </div>
              
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
      
      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportOpen} onOpenChange={(open) => {
        if (!open) resetImportState();
        setBulkImportOpen(open);
      }}>
        <DialogContent className="max-w-5xl mapping-dialog overflow-y-auto bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-xl">Bulk Import Applications</DialogTitle>
            <DialogDescription>
              Import multiple applications at once from CSV or Excel
            </DialogDescription>
          </DialogHeader>
          
          {/* Import Form */}
          <div className="space-y-6 bg-white bulk-import-container">
            {!importSuccess && (
              <>
                {/* Method Selection */}
                <div className="grid grid-cols-2 gap-4 method-selection-grid">
                  <Button
                    variant={importMethod === 'paste' ? "default" : "outline"}
                    onClick={() => setImportMethod('paste')}
                    className="h-20 bg-opacity-100 flex flex-col items-center justify-center"
                  >
                    <svg 
                      className="h-6 w-6 mb-1" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-medium text-center">Paste Data</span>
                    <span className="text-xs text-center">Paste from Excel or CSV</span>
                  </Button>
                  
                  <Button
                    variant={importMethod === 'file' ? "default" : "outline"}
                    onClick={() => setImportMethod('file')}
                    className="h-20 bg-opacity-100 flex flex-col items-center justify-center"
                  >
                    <Upload className="h-6 w-6 mb-1" />
                    <span className="font-medium text-center">Upload File</span>
                    <span className="text-xs text-center">Upload CSV or Excel</span>
                  </Button>
                </div>
                
                {/* Import Interface based on method */}
                <div className="mt-8 import-interface-container">
                  {importMethod === 'paste' && (
                    <div className="paste-data-container no-dividers">
                      <div className="paste-data-header no-dividers">
                        <div className="paste-data-title">Paste Data</div>
                      </div>
                      <div className="textarea-wrapper no-dividers">
                        <Textarea 
                          id="bulk-data"
                          placeholder="Paste data from Excel or CSV here..."
                          className="paste-data-textarea h-60 font-mono no-dividers"
                          value={bulkData}
                          onChange={(e) => setBulkData(e.target.value)}
                          style={{ 
                            border: 'none', 
                            boxShadow: 'none', 
                            backgroundImage: 'none',
                            borderRadius: '0 0 4px 4px',
                            outline: 'none',
                            borderLeft: 'none',
                            borderRight: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {importMethod === 'file' && (
                    <div className="space-y-2">
                      <Label>Upload your file</Label>
                      <div 
                        {...getRootProps()} 
                        className="border-2 border-dashed rounded-md p-10 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center bg-white"
                      >
                        <input {...getInputProps()} />
                        <UploadCloud className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Drag & drop a CSV or Excel file here, or click to select
                        </p>
                        {uploadedFile && (
                          <div className="mt-2 bg-blue-50 rounded p-2 text-sm">
                            Selected: {uploadedFile.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-2">
                        <a 
                          href="#" 
                          className="text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            const sampleData = "client_name,proposed_insured_name,carrier,product,monthly_premium,status,paid_status\nJohn Doe,John Doe,Fidelity,Term Life,85.50,Approved,Paid\nJane Smith,Jane Smith,Mutual of Omaha,Final Expense,65.25,In Process,Pending";
                            const blob = new Blob([sampleData], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'applications_template.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          Download sample template
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Progress Indicator */}
            {importProgress > 0 && !importSuccess && (
              <div className="space-y-2 bg-white">
                <div className="flex justify-between text-sm">
                  <span>Import Progress</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="mapping-progress" />
              </div>
            )}
            
            {/* Data Preview and Mapping */}
            {mappingStep && !importSuccess && bulkDataPreview.length > 0 && (
              <div className="space-y-4 bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-800">Match Your Data Columns</h3>
                    <p className="text-sm text-gray-500">
                      Map your data columns to our system fields for proper import
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-indigo-50 border-indigo-200 text-indigo-700 py-1 px-3"
                  >
                    {Object.keys(columnMappings).length} of {Object.keys(bulkDataPreview[0]).length} columns mapped
                  </Badge>
                </div>
                
                <div className="mapping-layout">
                  <div className="mapping-compact">
                    <div className="column-mapping-container">
                      {/* First show actual CSV fields */}
                      {Object.keys(bulkDataPreview[0]).map((header) => (
                        <div key={header} className="mapping-card">
                          <div className="mapping-header">
                            <Pencil size={14} />
                            <span>{header}</span>
                            {columnMappings[header] ? (
                              <span className="mapping-status mapped">
                                <Check size={12} /> Mapped
                              </span>
                            ) : (
                              <span className="mapping-status unmapped">
                                <AlertCircle size={12} /> Unmapped
                              </span>
                            )}
                          </div>
                          
                          <div className="sample-text">
                            Sample: {bulkDataPreview[0][header]?.toString().substring(0, 30) || "Empty"}
                          </div>
                          
                          <Select 
                            value={columnMappings[header] || ''} 
                            onValueChange={(value) => {
                              setColumnMappings({
                                ...columnMappings,
                                [header]: value
                              });
                            }}
                          >
                            <SelectTrigger className="w-full select-trigger">
                              <SelectValue placeholder="Map to field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_ignore" className="text-amber-600">
                                <div className="flex items-center">
                                  <XCircle className="h-3 w-3 mr-2" />
                                  Ignore this column
                                </div>
                              </SelectItem>
                              
                              {/* Client Information Group */}
                              <SelectGroup>
                                <SelectLabel className="text-xs font-semibold text-indigo-600">Client Information</SelectLabel>
                                {[
                                  'client_name', 'proposed_insured', 'client_phone_number', 'client_state',
                                  'client_email', 'date_of_birth', 'gender', 'street_address', 'city', 'zip',
                                  'insured_name', 'customer_name', 'name', 'phone', 'email'
                                ].map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              
                              {/* Policy Details Group */}
                              <SelectGroup>
                                <SelectLabel className="text-xs font-semibold text-indigo-600">Policy Details</SelectLabel>
                                {[
                                  'carrier', 'carrier_name', 'product', 'monthly_premium', 'policy_number', 'policy_submit_date',
                                  'effective_policy_date', 'effective_date', 'ap', 'policy_payment_cycle', 'primary_beneficiary',
                                  'relationship_to_insured', 'effective_policy_status', 'policy_type', 'coverage_amount',
                                  'annual_premium', 'premium', 'submit_date', 'policy_'
                                ].map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              
                              {/* Status Fields Group */}
                              <SelectGroup>
                                <SelectLabel className="text-xs font-semibold text-indigo-600">Status Fields</SelectLabel>
                                {[
                                  'status', 'paid_status', 'notes', 'notes_for_pay', 'policy_health',
                                  'month_1', 'month_2', 'month_3', 'month_4', 'month_5', 'month_6',
                                  'month_7', 'month_8', 'month_9', 'month_10', 'month_11', 'month_12'
                                ].map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              
                              {/* Health Information Group */}
                              <SelectGroup>
                                <SelectLabel className="text-xs font-semibold text-indigo-600">Health Information</SelectLabel>
                                {[
                                  'tobacco_nicotine_use', 'height_feet', 'height_inches', 'weight_lbs',
                                  'medical_lung_disease', 'medical_heart_attack', 'medical_heart_failure',
                                  'medical_blood_clots', 'medical_cancer', 'medical_diabetes',
                                  'medical_high_bp', 'medical_high_cholesterol'
                                ].map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              
                              {/* Agent & Commission Fields Group */}
                              <SelectGroup>
                                <SelectLabel className="text-xs font-semibold text-indigo-600">Agent & Commission</SelectLabel>
                                {[
                                  'paid_split', 'point_of_sale', 'pms_form_filled_out', 'commission_status', 
                                  'commission_paid_date', 'commission_amount', 'commission', 'split_with', 'closed_by_agent',
                                  'month', 'company', 'agent_id', 'manager_id', 'created_by'
                                ].map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      
                      {/* Then show additional Supabase fields that aren't in the CSV */}
                      {getSupabaseFields()
                        .filter(field => {
                          // Normalize field names for comparison
                          const normalizedField = field.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
                          
                          // Check if this field exists in any form in the CSV data
                          return !Object.keys(bulkDataPreview[0]).some(header => {
                            const normalizedHeader = header.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
                            
                            // Also check some common variations
                            const headerVariations = [
                              normalizedHeader,
                              normalizedHeader.replace('policy', ''),
                              normalizedHeader.replace('client', ''),
                              // Special case for "policy #" vs "policy_number"
                              normalizedHeader === 'policy' ? 'policynumber' : normalizedHeader
                            ];
                            
                            return headerVariations.includes(normalizedField) || 
                                   normalizedField.includes(normalizedHeader) ||
                                   normalizedHeader.includes(normalizedField);
                          });
                        })
                        .map((field) => (
                          <div key={`extra-${field}`} className="mapping-card">
                            <div className="mapping-header">
                              <Pencil size={14} />
                              <span>{field.replace(/_/g, ' ')}</span>
                              <span className="mapping-status unmapped">
                                <AlertCircle size={12} /> Unmapped
                              </span>
                            </div>
                            
                            <div className="sample-text">
                              Sample: Empty
                            </div>
                            
                            <Select
                              value={columnMappings[field] || ''}
                              onValueChange={(value) => {
                                setColumnMappings({
                                  ...columnMappings,
                                  [field]: value
                                });
                              }}
                            >
                              <SelectTrigger className="w-full select-trigger">
                                <SelectValue placeholder="Map to field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_ignore" className="text-amber-600">
                                  <div className="flex items-center">
                                    <XCircle className="h-3 w-3 mr-2" />
                                    Ignore this field
                                  </div>
                                </SelectItem>
                                <SelectItem value={field}>
                                  {field.replace(/_/g, ' ')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="data-preview-container">
                    <div className="data-preview-header">
                      <FileUp size={16} />
                      Data Preview
                    </div>
                    <div className="mapping-table-container">
                      <Table className="mapping-table">
                        <TableHeader>
                          <TableRow>
                            {Object.keys(bulkDataPreview[0]).map((header) => (
                              <TableHead key={header} className={columnMappings[header] ? "text-indigo-600" : ""}>
                                {header}
                                {columnMappings[header] && (
                                  <div className="text-xs font-normal opacity-70 mt-1">
                                    ↓ {columnMappings[header].replace(/_/g, ' ')}
                                  </div>
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkDataPreview.map((row, i) => (
                            <TableRow key={i}>
                              {Object.keys(row).map((key) => (
                                <TableCell key={key}>
                                  {row[key]?.toString() || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="mapping-helper">
                  <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p>
                    Map each column in your data to the appropriate field in our system. 
                    Columns marked as "Ignore" will not be imported.
                  </p>
                </div>
              </div>
            )}
            
            {/* Success/Failure Result */}
            {importSuccess && (
              <div className="space-y-4 bg-white">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    <h4 className="font-semibold text-green-700">Import Complete</h4>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p>Successfully imported {validRows} applications</p>
                    {invalidRows > 0 && (
                      <p className="text-amber-700">Failed to import {invalidRows} applications</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold">Import Log</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
                    {importFeedback.map((message, i) => (
                      <div key={i} className="py-1 border-b border-gray-100">
                        {message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {parseError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {parseError}
              </div>
            )}
          </div>
          
          <DialogFooter className="bg-white">
            {!importSuccess ? (
              <>
                <Button variant="outline" onClick={resetImportState} className="bg-white">
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkImport} 
                  disabled={importLoading || (mappingStep && Object.keys(columnMappings).length === 0)}
                  className="bg-opacity-100"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : mappingStep ? 'Import Data' : 'Continue'}
                </Button>
              </>
            ) : (
              <Button onClick={resetImportState} className="bg-opacity-100">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
} 