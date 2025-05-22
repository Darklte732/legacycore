"use client"

import './millennial-styles.css'

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AgentApplication } from "@/types/application"
import { DataTable } from "./data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Download, FileUp, HelpCircle, AlertCircle, Check, X, ArrowRight, Upload, Loader2, UploadCloud, CheckCircle, Pencil, Trash, Wand2, Eraser, XCircle, ClipboardList, User, Ban, Star, Calendar, Users, DollarSign, MessageSquare, ArrowLeft, FileText, Eye } from "lucide-react"
import { columns } from "./columns"
import { PaymentHistoryLegend } from "./components/PaymentComponents"
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
import { ErrorBoundary } from './components/ErrorBoundary'
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

export default function AgentApplicationsPage() {
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
          
          {/* Paid Policies Card */}
          <Card className="stat-card paid card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Paid Policies</p>
                  <h3 className="stat-value">{metrics.paidPolicies}</h3>
                </div>
                <div className="stat-icon">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Annual Premium Card */}
          <Card className="stat-card premium card-hover-effect">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="stat-info">
                  <p className="stat-label">Annual Premium</p>
                  <h3 className="stat-value">
                    ${metrics.totalAnnualPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="stat-icon">
                  <Download className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        // In development mode, continue without strict auth checks
        if (process.env.NODE_ENV === 'development') {
          fetchApplications()
          return
        }
        
        if (!session) {
          router.push("/login")
          return
        }

        // Optional: Check user role more gracefully
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profile && profile.role !== 'agent') {
            toast({
              title: "Access Notice",
              description: "This page is intended for agents. Some features may be limited.",
              variant: "default"
            })
          }
        } catch (profileError) {
          console.warn("Could not verify role, proceeding anyway:", profileError)
        }
        
        fetchApplications()
      } catch (error) {
        console.error("Authentication check failed:", error)
        // Don't redirect on error, just show a toast
        toast({
          title: "Authentication Notice",
          description: "We couldn't verify your session. Some features may be limited.",
          variant: "default"
        })
        fetchApplications()
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // This effect will run after the component mounts and applications are loaded
    if (applications.length > 0) {
      console.log("All loaded applications:", applications);
      
      // Examine each application to see which ones should be in the Paid & Issued category
      applications.forEach(app => {
        // Check if this app should be in the Paid & Issued category
        if (app.status === "Live" && app.paid_status === "Paid") {
          console.log("Should be in Paid & Issued:", app);
        }
        
        // Specifically check for Olivia Rawlings and Michael Curtis (seen in screenshots)
        if (app.proposed_insured?.includes("Rawlings") || app.proposed_insured?.includes("Curtis")) {
          console.log("Found specific application:", app);
        }
      });
      
      // Force a direct match check for the Paid & Issued tab
      const liveAndPaidApps = applications.filter(app => 
        app.status === "Live" && app.paid_status === "Paid"
      );
      console.log("Direct filtered Live and Paid applications:", liveAndPaidApps);
      
      // Check for exact status values we saw in the screenshots
      console.log("Status values present:", [...new Set(applications.map(app => app.status))]);
      console.log("Paid status values present:", [...new Set(applications.map(app => app.paid_status))]);
    }
  }, [applications]);

  async function fetchApplications() {
    try {
      setLoading(true);
      console.log('Starting to fetch applications...');
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session information:', session ? {
        id: session.user?.id,
        email: session.user?.email,
        isAuthenticated: !!session
      } : "No session found");

      // Handle case where we've lost the session but had one before
      if (!session && wasLoggedIn.current) {
        toast({
          title: 'Session expired',
          description: 'Your session has expired. Please refresh the page to log in again.',
          variant: 'destructive',
        })
        setLoading(false);
        return;
      }
      
      // Update wasLoggedIn flag if we have a session
      if (session) {
        wasLoggedIn.current = true;
      } else {
        toast({
          title: 'Authentication required',
          description: 'Please log in to view your applications.',
          variant: 'destructive',
        })
        setLoading(false);
        return;
      }

      // Get applications for the current agent
      console.log("Fetching applications from Supabase...");
      console.log("Using agent_id:", session.user.id);
      
      // First check if the agent_applications table exists
      console.log("Checking available tables in database...");
      
      // Query the agent_applications table directly
      const { data, error } = await supabase
        .from('agent_applications')
        .select('*')
        .eq('agent_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching from agent_applications:', error);
        toast({
          title: 'Error fetching applications',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Successfully retrieved data
      if (data && data.length > 0) {
        console.log(`✅ Table agent_applications exists and contains data for this agent.`);
        console.log(`✅ Successfully loaded ${data.length} applications from agent_applications table.`);
        
        // Calculate commission amounts for applications that don't have it set
        const enhancedData = data.map(app => {
          // If commission_amount already exists and is valid, keep it
          if (app.commission_amount && typeof app.commission_amount === 'number' && app.commission_amount > 0) {
            return app;
          }
          
          // Otherwise calculate it based on monthly premium
          let monthlyPremium = 0;
          let annualPremium = 0;
          
          if (app.ap && app.ap > 0) {
            // If annual premium exists, use it directly
            annualPremium = typeof app.ap === 'number' ? 
              app.ap : 
              parseFloat(app.ap);
          } else if (app.monthly_premium) {
            // Otherwise calculate from monthly premium
            monthlyPremium = typeof app.monthly_premium === 'number' ? 
              app.monthly_premium : 
              parseFloat(app.monthly_premium);
            annualPremium = monthlyPremium * 12;
          } else if (app.premium) {
            // If only "premium" field exists
            monthlyPremium = typeof app.premium === 'number' ? 
              app.premium : 
              parseFloat(app.premium || '0');
            annualPremium = monthlyPremium * 12;
          }
          
          // Get the split percentage or default to 20%
          const splitPercentage = app.split_percentage || 20;
          
          // Calculate commission: annual premium * agent's portion (opposite of split percentage)
          const agentSplitRatio = (100 - splitPercentage) / 100;
          const calculatedCommission = annualPremium * agentSplitRatio;
          
          // Only update if we have a valid calculation
          if (!isNaN(calculatedCommission) && calculatedCommission > 0) {
            return {
              ...app,
              commission_amount: calculatedCommission
            };
          }
          
          return app;
        });
        
        setApplications(enhancedData);
        console.log("Loaded applications from database with commission calculations:", enhancedData);
      } else {
        console.log("No applications found for this agent.");
        setApplications([]);
      }
      
      console.log("All loaded applications:", data);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error loading applications',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    
    // Normalize status values to avoid case issues
    const normalizedStatus = (app.status || "").toLowerCase();
    const normalizedPaidStatus = (app.paid_status || "").toLowerCase();
    const normalizedCommissionStatus = (app.commission_status || "").toLowerCase();
    const normalizedNotes = (app.notes || "").toLowerCase();
    const normalizedPolicyHealth = (app.policy_health || "").toLowerCase();
    
    switch (activeTab) {
      case "approved":
        return normalizedStatus.includes("approved");
        
      case "pending-first-payment":
        // Show applications with policy_health "Pending First Payment"
        return normalizedPolicyHealth === "pending first payment" || 
               normalizedPolicyHealth.includes("pending first") || 
               normalizedPolicyHealth.includes("first payment") ||
               (normalizedStatus.includes("approved") && normalizedPaidStatus.includes("unpaid") && 
                !normalizedPolicyHealth.includes("active"));
        
      case "pending-payment":
        // For applications that are approved but not paid yet
        return normalizedStatus.includes("approved") && 
               (normalizedPaidStatus.includes("unpaid") || !normalizedPaidStatus) &&
               normalizedPolicyHealth !== "pending first payment"; // Exclude ones that belong in the Pending First Payment tab
      
      case "paid-issued":
        // Adjust filter to catch more paid applications while excluding inappropriate ones
        return normalizedPaidStatus.includes("paid") && 
               (normalizedStatus.includes("live") || normalizedStatus.includes("approved") || normalizedStatus.includes("issued") || normalizedStatus.includes("1st month")) &&
               !normalizedStatus.includes("not") &&
               !normalizedStatus.includes("cancel") &&
               normalizedPolicyHealth !== "pending first payment";
        
      case "needs-attention":
        // Show ONLY applications with policy_health = "Needs Attention"
        return normalizedPolicyHealth.includes("needs attention");
        
      case "not-taken":
        return normalizedStatus.includes("not taken") || normalizedStatus.includes("not-taken");
        
      case "cancelled":
        // Expanded detection for cancelled applications
        return normalizedStatus.includes("cancel") || 
               normalizedStatus.includes("cancella") || 
               normalizedNotes.includes("cancel") || 
               app.commission_status?.toLowerCase().includes("cancel") ||
               // Check for notes indicating cancellation
               normalizedNotes.includes("return") || 
               normalizedNotes.includes("nsf") || 
               normalizedNotes.includes("insuffic") || 
               normalizedNotes.includes("funds") ||
               normalizedNotes.includes("draft return");
        
      default:
        return true;
    }
  });

  function handleTabChange(value: string) {
    setActiveTab(value)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setParseError('')
    setUploadedFile(file)
    
    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string
      if (fileContent) {
        setBulkData(fileContent)
      }
    }
    reader.onerror = () => {
      setParseError('Failed to read file. Please try again.')
    }
    reader.readAsText(file)
  }

  // Generate sample data
  const generateSampleCSV = () => {
    const headers = [
      'First Name', 'Last Name', 'Phone Number', 'Email', 'State', 
      'Policy Type', 'Coverage Amount', 'Monthly Premium', 'Annual Premium',
      'Carrier', 'Product', 'Status', 'Paid Status'
    ]
    
    const data = [
      ['John', 'Smith', '(555) 123-4567', 'john@example.com', 'CA', 
       'Whole Life', '$10,000', '$45.99', '$550.00', 
       'Americo', 'Ultra Protector', 'Pending', 'Unpaid'],
      ['Jane', 'Doe', '(555) 987-6543', 'jane@example.com', 'NY', 
       'Term Life', '$25,000', '$35.50', '$425.00', 
       'Mutual of Omaha', 'Term Plus', 'Approved', 'Paid']
    ]
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')
    
    return csvContent
  }
  
  const downloadSampleTemplate = () => {
    const csvContent = generateSampleCSV()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'applications_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper function to detect if data is pasted from Excel (tab-delimited)
  const isExcelPaste = (data: string): boolean => {
    // Excel paste often has tabs as delimiters
    const lines = data.trim().split(/[\r\n]+/);
    if (lines.length < 2) return false;
    
    // Check if the first and second lines have the same number of tabs
    const firstLineTabs = (lines[0].match(/\t/g) || []).length;
    const secondLineTabs = lines.length > 1 ? (lines[1].match(/\t/g) || []).length : 0;
    
    // Excel paste typically has consistent number of tabs per line and at least one tab
    return firstLineTabs > 0 && firstLineTabs === secondLineTabs;
  };

  function parseBulkData() {
    setParseError('')
    setMappingStep(false)
    
    try {
      if (!bulkData || bulkData.trim() === '') {
        setParseError('Please enter or upload data first')
        setBulkDataPreview([])
        return
      }
      
      // Check if this looks like it was pasted from Excel
      const excelPaste = isExcelPaste(bulkData);
      
      // Split by lines first and normalize line endings
      const lines = bulkData.trim()
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        setParseError('Please include at least one header row and one data row')
        setBulkDataPreview([])
        return
      }
      
      // Log all lines for debugging
      console.log(`Processing ${lines.length} lines of data`);
      
      // Try to determine the delimiter (tab, comma, pipe, or semicolon)
      const firstLine = lines[0];
      let delimiter;
      
      // If it appears to be from Excel, prefer tab as delimiter
      if (excelPaste) {
        delimiter = '\t';
        console.log('Excel paste detected, using tab delimiter');
      } else {
        // Count occurrences of potential delimiters
        const commas = (firstLine.match(/,/g) || []).length;
        const tabs = (firstLine.match(/\t/g) || []).length;
        const pipes = (firstLine.match(/\|/g) || []).length;
        const semicolons = (firstLine.match(/;/g) || []).length;
        
        // Choose the delimiter with the most occurrences
        if (commas >= tabs && commas >= pipes && commas >= semicolons) {
          delimiter = ',';
        } else if (tabs >= commas && tabs >= pipes && tabs >= semicolons) {
          delimiter = '\t';
        } else if (semicolons >= commas && semicolons >= tabs && semicolons >= pipes) {
          delimiter = ';';
        } else if (pipes >= commas && pipes >= tabs && pipes >= semicolons) {
          delimiter = '|';
        } else {
          // Default to comma if no clear delimiter is found
          delimiter = ',';
        }
      }
      
      console.log('Detected delimiter:', delimiter, 'in line:', firstLine);
      
      // Better header parsing with quote handling
      let headers = [];
      
      // Special case for empty headers (which can happen with bad CSV formatting)
      const makeHeaderUnique = (header: string, index: number) => {
        return header.trim() || `Column_${index + 1}`;
      };
      
      if (delimiter === ',') {
        // Handle CSV quoted fields for headers
        const headerMatches = [];
        let match;
        const regexp = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        
        while ((match = regexp.exec(firstLine + ',')) !== null) {
          let value = match[1];
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          headerMatches.push(value);
        }
        
        if (headerMatches.length > 1) {
          headers = headerMatches.map(makeHeaderUnique);
        } else {
          // Fallback to simple split if regex doesn't work
          headers = firstLine.split(delimiter).map((h, i) => makeHeaderUnique(h.trim().replace(/^"|"$/g, ''), i));
        }
      } else {
        // For other delimiters, simple split is usually enough
        headers = firstLine.split(delimiter).map((h, i) => makeHeaderUnique(h.trim(), i));
      }
      
      // Log headers for debugging
      console.log('Detected headers:', headers);
      
      if (headers.length <= 1) {
        setParseError(`Could not parse headers properly. Detected only ${headers.length} columns with delimiter "${delimiter}". Try a different file format or delimiter.`)
        setBulkDataPreview([])
        return
      }
      
      // Define comprehensive database fields mapping
      const dbFields = [
        'proposed_insured', 'client_phone_number', 'client_state', 'client_email',
        'policy_type', 'coverage_amount', 'monthly_premium', 'annual_premium',
        'carrier', 'product', 'status', 'paid_status', 'policy_number', 'month',
        'policy_submit_date', 'effective_policy_date', 'point_of_sale', 'notes', 
        'notes_for_pay', 'paid_split', 'client_state', 'policy_', 'closed_by_agent', 'ap',
        'client_name', 'insured_name', 'customer_name', 'name', 'phone', 'email',
        'premium', 'commission', 'company', 'carrier_name', 'effective_date', 'submit_date',
        'commission_status', 'commission_paid_date', 'policy_payment_cycle', 'commission_amount',
        'split_with', 'effective_policy_status', 'pms_form_filled_out', 'city', 'zip', 'gender',
        'date_of_birth', 'primary_beneficiary', 'relationship_to_insured', 'tobacco_nicotine_use',
        'height_feet', 'height_inches', 'weight_lbs', 'medical_lung_disease',
        'medical_heart_attack', 'medical_heart_failure', 'medical_blood_clots',
        'medical_cancer', 'medical_diabetes', 'medical_high_bp', 'medical_high_cholesterol',
        'street_address'
      ];
      
      setAvailableFields(dbFields);
      
      // Parse data rows with improved validation and handling
      let valid = 0;
      let invalid = 0;
      const parsedData = lines.slice(1).filter(Boolean).map((line, index) => {
        if (!line.trim()) {
          invalid++;
          return null;
        }
        
        // Improved handling for quoted values with delimiters inside
        let values = [];
        
        if (delimiter === ',') {
          // Use a more robust CSV parsing for comma-delimited files
          const valueMatches = [];
          let match;
          const regexp = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          
          while ((match = regexp.exec(line + ',')) !== null) {
            let value = match[1];
            if (value && value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1).replace(/""/g, '"');
            }
            valueMatches.push(value !== undefined ? value : '');
          }
          
          if (valueMatches.length > 1) {
            values = valueMatches;
          } else {
            // Fallback to simple split
            values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
          }
        } else if (delimiter === '\t') {
          // Special handling for tab-delimited data which can be more reliable
          values = line.split(delimiter);
        } else {
          // For other delimiters, handle quoted values
          const processedLine = line.replace(/"([^"]*)"/g, (match, p1) => {
            return p1.replace(new RegExp(delimiter, 'g'), '___DELIMITER___');
          });
          
          values = processedLine.split(delimiter).map(v => {
            // Restore any delimiters inside quotes
            return v.replace(/___DELIMITER___/g, delimiter).trim();
          });
        }
        
        // If we don't have enough values, pad with empty strings
        while (values.length < headers.length) {
          values.push('');
        }
        
        // Truncate excess values
        if (values.length > headers.length) {
          values = values.slice(0, headers.length);
        }
        
        const row = {};
        
        // Use the header names as keys
        headers.forEach((header, i) => {
          if (header) {
            const value = values[i] || '';
            
            // Convert values appropriate for their likely types
            if (value.match(/^[$]?[0-9,.]+$/)) {
              // Looks like a number or currency
              const numericValue = parseFloat(value.replace(/[$,]/g, ''));
              row[header] = isNaN(numericValue) ? value : numericValue;
            } else if (value.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/)) {
              // Looks like a date
              try {
                const dateValue = new Date(value);
                if (!isNaN(dateValue.getTime())) {
                  row[header] = dateValue.toISOString().split('T')[0]; // Store as YYYY-MM-DD
                } else {
                  row[header] = value;
                }
              } catch (e) {
                row[header] = value;
              }
            } else {
              row[header] = value;
            }
          }
        });
        
        valid++;
        return row;
      }).filter(Boolean);
      
      setValidRows(valid);
      setInvalidRows(invalid);
      
      if (parsedData.length > 0) {
        console.log(`Parsed ${parsedData.length} valid rows, first row:`, parsedData[0]);
        setBulkDataPreview(parsedData);
        setMappingStep(true);
        
        // Set up initial mappings
        autoMapColumns(parsedData[0], headers);
      } else {
        setParseError('No valid data rows found. Please check your data format.');
        setBulkDataPreview([]);
      }
    } catch (error) {
      console.error('Error parsing bulk data:', error);
      setParseError(`Failed to parse data: ${(error as Error).message}. Please check format and try again.`);
      setBulkDataPreview([]);
    }
  }
  
  // Create a dedicated function for auto-mapping that can be called both by the parsing and the button click
  const autoMapColumns = (sampleRow, headers) => {
    // Define an exact mapping dictionary for common column names
    const exactMappings = {
      // Basic client info
      'proposed insured': 'proposed_insured',
      'proposed_insured': 'proposed_insured',
      'client name': 'proposed_insured',
      'client_name': 'proposed_insured',
      'customer name': 'proposed_insured',
      'customer_name': 'proposed_insured',
      'insured name': 'proposed_insured',
      'insured_name': 'proposed_insured',
      'name': 'proposed_insured',
      'full name': 'proposed_insured',
      'full_name': 'proposed_insured',
      'client': 'proposed_insured',
      'insured': 'proposed_insured',
      
      // Contact info
      'client phone number': 'client_phone_number',
      'client_phone_number': 'client_phone_number',
      'phone number': 'client_phone_number',
      'phone_number': 'client_phone_number',
      'phone': 'client_phone_number',
      'telephone': 'client_phone_number',
      'cell': 'client_phone_number',
      'mobile': 'client_phone_number',
      'contact': 'client_phone_number',
      
      'client email': 'client_email',
      'client_email': 'client_email',
      'email': 'client_email',
      'e-mail': 'client_email',
      'e_mail': 'client_email',
      'mail': 'client_email',
      
      'client state': 'client_state',
      'client_state': 'client_state',
      'state': 'client_state',
      'province': 'client_state',
      'st': 'client_state',
      
      // New required fields
      'city': 'city',
      'client city': 'city',
      'client_city': 'city',
      'town': 'city',
      
      'zip': 'zip',
      'zip code': 'zip',
      'zipcode': 'zip',
      'postal code': 'zip',
      'postal': 'zip',
      'client zip': 'zip',
      'client_zip': 'zip',
      
      'gender': 'gender',
      'client gender': 'gender',
      'client_gender': 'gender',
      'sex': 'gender',
      
      'date of birth': 'date_of_birth',
      'date_of_birth': 'date_of_birth',
      'birth date': 'date_of_birth',
      'birth_date': 'date_of_birth',
      'dob': 'date_of_birth',
      'birthdate': 'date_of_birth',
      
      'primary beneficiary': 'primary_beneficiary',
      'primary_beneficiary': 'primary_beneficiary',
      'beneficiary': 'primary_beneficiary',
      'beneficiary name': 'primary_beneficiary',
      'beneficiary_name': 'primary_beneficiary',
      
      'relationship to insured': 'relationship_to_insured',
      'relationship_to_insured': 'relationship_to_insured',
      'beneficiary relationship': 'relationship_to_insured',
      'beneficiary_relationship': 'relationship_to_insured',
      'relationship': 'relationship_to_insured',
      
      'tobacco use': 'tobacco_nicotine_use',
      'tobacco_use': 'tobacco_nicotine_use',
      'tobacco': 'tobacco_nicotine_use',
      'nicotine use': 'tobacco_nicotine_use',
      'nicotine_use': 'tobacco_nicotine_use',
      'nicotine': 'tobacco_nicotine_use',
      'tobacco/nicotine use': 'tobacco_nicotine_use',
      'tobacco_nicotine_use': 'tobacco_nicotine_use',
      'smoker': 'tobacco_nicotine_use',
      
      'height feet': 'height_feet',
      'height_feet': 'height_feet',
      'feet': 'height_feet',
      'height ft': 'height_feet',
      'height_ft': 'height_feet',
      'ft': 'height_feet',
      
      'height inches': 'height_inches',
      'height_inches': 'height_inches',
      'inches': 'height_inches',
      'height in': 'height_inches',
      'height_in': 'height_inches',
      'in': 'height_inches',
      
      'weight': 'weight_lbs',
      'weight lbs': 'weight_lbs',
      'weight_lbs': 'weight_lbs',
      'weight pounds': 'weight_lbs',
      'weight_pounds': 'weight_lbs',
      'lbs': 'weight_lbs',
      'pounds': 'weight_lbs',
      
      'lung disease': 'medical_lung_disease',
      'lung_disease': 'medical_lung_disease',
      'asthma': 'medical_lung_disease',
      'copd': 'medical_lung_disease',
      'lung disease/asthma/copd': 'medical_lung_disease',
      'medical_lung_disease': 'medical_lung_disease',
      
      'heart attack': 'medical_heart_attack',
      'heart_attack': 'medical_heart_attack',
      'stroke': 'medical_heart_attack',
      'tia': 'medical_heart_attack',
      'stents': 'medical_heart_attack',
      'heart attack/stroke/tia/stents': 'medical_heart_attack',
      'medical_heart_attack': 'medical_heart_attack',
      
      'heart failure': 'medical_heart_failure',
      'heart_failure': 'medical_heart_failure',
      'congestive heart failure': 'medical_heart_failure',
      'congestive_heart_failure': 'medical_heart_failure',
      'chf': 'medical_heart_failure',
      'medical_heart_failure': 'medical_heart_failure',
      
      'blood clots': 'medical_blood_clots',
      'blood_clots': 'medical_blood_clots',
      'clots': 'medical_blood_clots',
      'thrombosis': 'medical_blood_clots',
      'medical_blood_clots': 'medical_blood_clots',
      
      'cancer': 'medical_cancer',
      'any cancer': 'medical_cancer',
      'any_cancer': 'medical_cancer',
      'medical_cancer': 'medical_cancer',
      
      'diabetes': 'medical_diabetes',
      'neuropathy': 'medical_diabetes',
      'amputation': 'medical_diabetes',
      'diabetes/neuropathy/amputation': 'medical_diabetes',
      'medical_diabetes': 'medical_diabetes',
      
      'high blood pressure': 'medical_high_bp',
      'high_blood_pressure': 'medical_high_bp',
      'hbp': 'medical_high_bp',
      'hypertension': 'medical_high_bp',
      'high bp': 'medical_high_bp',
      'high_bp': 'medical_high_bp',
      'medical_high_bp': 'medical_high_bp',
      
      'high cholesterol': 'medical_high_cholesterol',
      'high_cholesterol': 'medical_high_cholesterol',
      'cholesterol': 'medical_high_cholesterol',
      'hypercholesterolemia': 'medical_high_cholesterol',
      'medical_high_cholesterol': 'medical_high_cholesterol',
      
      // Policy info
      'month': 'month',
      'mo': 'month',
      'mth': 'month',
      
      'policy submit date': 'policy_submit_date',
      'policy_submit_date': 'policy_submit_date',
      'submit date': 'policy_submit_date',
      'submission date': 'policy_submit_date',
      'application date': 'policy_submit_date',
      'date submitted': 'policy_submit_date',
      'date_submitted': 'policy_submit_date',
      'submitted': 'policy_submit_date',
      
      'policy #': 'policy_number',
      'policy#': 'policy_number',
      'policy no': 'policy_number',
      'policy number': 'policy_number',
      'policy_number': 'policy_number',
      'policy id': 'policy_number',
      'policy_id': 'policy_number',
      'policy num': 'policy_number',
      'policy_num': 'policy_number',
      
      'carrier': 'carrier',
      'company': 'carrier',
      'provider': 'carrier',
      'insurer': 'carrier',
      'insurance company': 'carrier',
      'carrier name': 'carrier',
      'carrier_name': 'carrier',
      
      'product': 'product',
      'policy type': 'product',
      'policy_type': 'product',
      'insurance type': 'product',
      'insurance_type': 'product',
      'plan': 'product',
      'coverage type': 'product',
      'coverage_type': 'product',
      
      'monthly premium': 'monthly_premium',
      'monthly_premium': 'monthly_premium',
      'premium monthly': 'monthly_premium',
      'premium_monthly': 'monthly_premium',
      'monthly': 'monthly_premium',
      'mo premium': 'monthly_premium',
      'mo_premium': 'monthly_premium',
      
      'ap': 'ap',
      'annual premium': 'ap',
      'annual_premium': 'ap',
      'yearly premium': 'ap',
      'yearly_premium': 'ap',
      'premium annual': 'ap',
      'premium_annual': 'ap',
      'annual': 'ap',
      'yearly': 'ap',
      
      'status': 'status',
      'application status': 'status',
      'application_status': 'status',
      'policy status': 'status',
      'policy_status': 'status',
      'current status': 'status',
      'current_status': 'status',
      
      'paid status': 'paid_status',
      'paid_status': 'paid_status',
      'payment status': 'paid_status',
      'payment_status': 'paid_status',
      'paid': 'paid_status',
      
      // Agent info
      'closed by agent': 'closed_by_agent',
      'closed_by_agent': 'closed_by_agent',
      'agent closed': 'closed_by_agent',
      'closed by': 'closed_by_agent',
      'closed_by': 'closed_by_agent',
      
      'point of sale': 'point_of_sale',
      'point_of_sale': 'point_of_sale',
      'pos': 'point_of_sale',
      'sale location': 'point_of_sale',
      'sale_location': 'point_of_sale',
      
      'pms form filled out': 'pms_form_filled_out',
      'pms_form_filled_out': 'pms_form_filled_out',
      'pms form': 'pms_form_filled_out',
      'pms_form': 'pms_form_filled_out',
      
      'split with': 'split_with',
      'split_with': 'split_with',
      'agent split': 'split_with',
      'agent_split': 'split_with',
      'shared with': 'split_with',
      'shared_with': 'split_with',
      'split': 'split_with',
      
      'effective policy date': 'effective_policy_date',
      'effective_policy_date': 'effective_policy_date',
      'effective date': 'effective_policy_date',
      'effective_date': 'effective_policy_date',
      'start date': 'effective_policy_date',
      'start_date': 'effective_policy_date',
      'policy start date': 'effective_policy_date',
      'policy_start_date': 'effective_policy_date',
      
      'effective policy status': 'effective_policy_status',
      'effective_policy_status': 'effective_policy_status',
      
      // Notes & Commission
      'notes': 'notes',
      'comments': 'notes',
      'remarks': 'notes',
      
      'notes for pay': 'notes_for_pay',
      'notes_for_pay': 'notes_for_pay',
      'payment notes': 'notes_for_pay',
      'payment_notes': 'notes_for_pay',
      
      'paid split': 'paid_split',
      'paid_split': 'paid_split',
      'paid split?': 'paid_split',
      
      'commission status': 'commission_status',
      'commission_status': 'commission_status',
      'comm status': 'commission_status',
      'comm_status': 'commission_status',
      
      'commission paid date': 'commission_paid_date',
      'commission_paid_date': 'commission_paid_date',
      'comm paid date': 'commission_paid_date',
      'comm_paid_date': 'commission_paid_date',
      
      'commission amount': 'commission_amount',
      'commission_amount': 'commission_amount',
      'comm amount': 'commission_amount',
      'comm_amount': 'commission_amount',
      
      'payment cycle': 'policy_payment_cycle',
      'payment_cycle': 'policy_payment_cycle',
      'policy payment cycle': 'policy_payment_cycle',
      'policy_payment_cycle': 'policy_payment_cycle'
    };
    
    // Create new mappings object
    const newMappings = {};
    
    // Initialize all mappings as 'unmapped' 
    headers.forEach(header => {
      newMappings[header] = 'unmapped';
    });
    
    // Try to map each header using exact matches first
    headers.forEach(header => {
      // Normalize header for matching
      const normalizedHeader = header.toLowerCase().trim();
      
      // Check for exact match
      if (exactMappings[normalizedHeader]) {
        newMappings[header] = exactMappings[normalizedHeader];
        return;
      }
      
      // If no exact match, try different approaches
      // Check for substring matches (e.g., "Client Email Address" should match "client_email")
      for (const [key, value] of Object.entries(exactMappings)) {
        if (normalizedHeader.includes(key)) {
          newMappings[header] = value;
          return;
        }
      }
      
      // Special mapping for partial matches
      if (normalizedHeader.includes('phone')) {
        newMappings[header] = 'client_phone_number';
      } else if (normalizedHeader.includes('email')) {
        newMappings[header] = 'client_email';
      } else if (normalizedHeader.includes('state')) {
        newMappings[header] = 'client_state';
      } else if (normalizedHeader.includes('policy') && (normalizedHeader.includes('num') || normalizedHeader.includes('#'))) {
        newMappings[header] = 'policy_number';
      } else if (normalizedHeader.includes('premium') && !normalizedHeader.includes('annual')) {
        newMappings[header] = 'monthly_premium';
      } else if (normalizedHeader.includes('premium') && normalizedHeader.includes('annual')) {
        newMappings[header] = 'ap';
      } else if (normalizedHeader.includes('notes') && !normalizedHeader.includes('pay')) {
        newMappings[header] = 'notes';
      }
    });
    
    console.log('Auto-mapped columns:', newMappings);
    setColumnMappings(newMappings);
  };
  
  // Fix for the Select components in the column mapping
  const getSelectItems = (availableFields: string[]) => {
    return [
      <SelectItem key="unmapped" value="unmapped">Don't import</SelectItem>,
      ...availableFields.map((field) => (
        <SelectItem key={field} value={field}>
          {field.replace(/_/g, ' ')}
        </SelectItem>
      ))
    ]
  }

  function resetImportState() {
    setBulkData('');
    setBulkDataPreview([]);
    setParseError('');
    setMappingStep(false);
    setImportMethod('paste');
    setUploadedFile(null);
    setImportProgress(0);
    setColumnMappings({});
    setAvailableFields([]);
    setValidRows(0);
    setInvalidRows(0);
    setImportSuccess(false);
    setImportFeedback([]);
  }

  async function handleBulkImport() {
    setImportLoading(true)
    setImportProgress(0)
    setImportFeedback([]) // Clear previous feedback
    
    try {
      // Ensure we have mappings and data to import
      if (Object.keys(columnMappings).length === 0) {
        setParseError('Please map at least one column before importing')
        setImportLoading(false)
        return
      }
      
      if (!bulkDataPreview || bulkDataPreview.length === 0) {
        setParseError('No data to import')
        setImportLoading(false)
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setParseError('You must be logged in to import data')
        setImportLoading(false)
        return
      }
            
      // Helper function to safely convert string to number
      const safeNumberConversion = (value: any): number | null => {
        if (value === undefined || value === null || value === '') return null;
            
        if (typeof value === 'number') return value;
        
              if (typeof value === 'string') {
          // Remove currency symbols and commas
          const cleanedValue = value.replace(/[$,]/g, '').trim();
          if (!cleanedValue) return null;
          
          const parsedValue = parseFloat(cleanedValue);
          return isNaN(parsedValue) ? null : parsedValue;
        }
        
        return null;
      };
      
      // Helper function to safely convert any value to a date string
      const safeDateConversion = (value: any): string | null => {
        if (!value) return null;
        
        try {
          // Handle different date formats
          if (typeof value === 'string') {
            // Already in ISO format
            if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
              return value.split('T')[0];
            }
            
            // Handle MM/DD/YYYY format
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
              const [month, day, year] = value.split('/').map(num => parseInt(num, 10));
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            
            // Handle MM-DD-YYYY format
            if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
              const [month, day, year] = value.split('-').map(num => parseInt(num, 10));
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            
            // Try standard date parsing as fallback
            const date = new Date(value);
            return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
          }
          
          if (value instanceof Date) {
            return value.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Date conversion error:', error, 'for value:', value);
        }
        
        return null;
      };
      
      // Helper function to convert to boolean
      const safeBooleanConversion = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        
        if (typeof value === 'string') {
          const normalizedValue = value.trim().toLowerCase();
          return ['yes', 'true', 'y', '1', 'on', 'checked'].includes(normalizedValue);
        }
        
        if (typeof value === 'number') {
          return value === 1;
        }
        
        return false;
      };
      
      // Process the data
      console.log('Processing bulk data import for', bulkDataPreview.length, 'records');
      
      const mappedRecords = bulkDataPreview.map((row, index) => {
        // Start with agent_id and timestamps
        const record: any = {
          agent_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Process each mapping
        Object.entries(columnMappings).forEach(([header, field]) => {
          if (field !== 'unmapped') {
            let rawValue = row[header];
            
            // Skip undefined/null values
            if (rawValue === undefined || rawValue === null) {
              return;
            }
            
            // Handle different field types
            switch (field) {
              case 'pms_form_filled_out':
              case 'tobacco_nicotine_use':
              case 'medical_lung_disease':
              case 'medical_heart_attack':
              case 'medical_heart_failure':
              case 'medical_blood_clots':
              case 'medical_cancer':
              case 'medical_diabetes':
              case 'medical_high_bp':
              case 'medical_high_cholesterol':
                record[field] = safeBooleanConversion(rawValue);
                break;
                
              case 'monthly_premium':
              case 'ap':
              case 'commission_amount':
              case 'height_feet':
              case 'height_inches':
              case 'weight_lbs':
                record[field] = safeNumberConversion(rawValue);
                break;
                
              case 'policy_submit_date':
              case 'effective_policy_date':
              case 'commission_paid_date':
              case 'date_of_birth':
                record[field] = safeDateConversion(rawValue);
                break;
                
              default:
                // Handle string fields, ensuring we don't store empty strings
                if (typeof rawValue === 'string') {
                  const trimmedValue = rawValue.trim();
                  record[field] = trimmedValue === '' ? null : trimmedValue;
                } else if (rawValue !== undefined) {
                  // Convert non-string values to string if needed
                  record[field] = String(rawValue);
                }
            }
          }
        });
        
        // Calculate commission amount if monthly premium exists but commission amount doesn't
        if ((!record.commission_amount || record.commission_amount === 0) && 
            (record.monthly_premium && record.monthly_premium > 0)) {
          // Calculate commission as premium * 9 * 0.5
          record.commission_amount = record.monthly_premium * 9 * 0.5;
          console.log(`Auto-calculated commission for record ${index + 1}: $${record.commission_amount.toFixed(2)} from premium $${record.monthly_premium}`);
        }
        
        return record;
      });
      
      // Validate required fields for each record
      const validRecords = [];
      const errorMessages = [];
      
      mappedRecords.forEach((record, index) => {
        const rowIndex = index + 2; // +2 for zero-indexing and header row
        const validationErrors = [];
        
        // Required field validation
        if (!record.proposed_insured) {
          validationErrors.push('Client name (Proposed Insured) is required');
        }
        
        if (!record.client_phone_number) {
          validationErrors.push('Client phone number is required');
        }
        
        // Either carrier or carrier_id must be present
        if (!record.carrier && !record.carrier_id) {
          validationErrors.push('Carrier information is required');
        }
        
        if (!record.product) {
          validationErrors.push('Product/Policy type is required');
        }
        
        // Add any validation errors to our list
        if (validationErrors.length > 0) {
          errorMessages.push(`Row ${rowIndex}: ${validationErrors.join(', ')}`);
        } else {
          validRecords.push(record);
        }
      });
      
      if (validRecords.length === 0) {
        setParseError('No valid records to import. Please check the validation errors and try again.');
        setImportSuccess(false);
        setImportLoading(false);
        return;
      }
      
      console.log(`Validated ${validRecords.length} records out of ${mappedRecords.length}`);
      
      // Process import in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < validRecords.length; i += batchSize) {
        batches.push(validRecords.slice(i, i + batchSize));
      }
      
      console.log(`Processing ${batches.length} batches with batch size ${batchSize}`);
      
      // Track import results
      let successCount = 0;
      let failureCount = 0;
      const feedbackMessages = [...errorMessages];
      
      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const currentBatch = batches[batchIndex];
        
        try {
          console.log(`Processing batch ${batchIndex + 1} with ${currentBatch.length} records`);
          
          // Insert batch into database
          const { data, error } = await supabase
            .from('agent_applications')
            .insert(currentBatch)
            .select('id');
          
          if (error) {
            console.error(`Batch ${batchIndex + 1} error:`, error);
            failureCount += currentBatch.length;
            feedbackMessages.push(`Batch ${batchIndex + 1} error: ${error.message || 'Unknown database error'}`);
          } else {
            console.log(`Batch ${batchIndex + 1} success:`, data);
            successCount += data.length;
            feedbackMessages.push(`Batch ${batchIndex + 1}: Successfully imported ${data.length} records`);
          }
        } catch (batchError) {
          console.error(`Exception in batch ${batchIndex + 1}:`, batchError);
          failureCount += currentBatch.length;
          feedbackMessages.push(`Batch ${batchIndex + 1} error: ${(batchError as Error).message || 'Unknown error'}`);
        }
        
        // Update progress and feedback
        const progress = Math.round(((batchIndex + 1) / batches.length) * 100);
        setImportProgress(progress);
        setImportFeedback(feedbackMessages);
        
        // Add a small delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Update feedback with final results
      setImportSuccess(true);
      setImportLoading(false);
      setImportProgress(100);
      setImportFeedback(feedbackMessages);
      
      // Handle final status
      if (successCount > 0) {
        if (failureCount > 0) {
          setParseError(`Partial success: ${successCount} records imported, ${failureCount} failed. See details below.`);
        } else {
          setParseError(null);
          toast({
            title: 'Import successful',
            description: `Successfully imported all ${successCount} records.`
          });
          
          // Reset the import state on success
          setBulkImportOpen(false);
          setBulkData('');
          setBulkDataPreview([]);
          setColumnMappings({});
          setMappingStep(false);
          
          // Refresh the applications data
          fetchApplications();
        }
      } else {
        setParseError(`Import failed: All ${failureCount} records failed to import. See details below.`);
      }
    } catch (error) {
      console.error('Unexpected error during import:', error);
      setParseError(`Import failed: ${(error as Error).message || 'Unknown error'}`);
      setImportSuccess(false);
      setImportLoading(false);
      setImportProgress(0);
      setImportFeedback([`System error: ${(error as Error).message || 'Unknown error'}`]);
    } finally {
      setImportLoading(false);
    }
  }

  // Function to open edit dialog or navigate to edit page
  const openEditDialog = (application: AgentApplication) => {
    console.log("Opening edit for application:", application.id);
    
    // Use direct navigation for more reliable editing
    window.location.href = `/agent/applications/${application.id}/edit`;
    
    // The dialog approach below is kept as a backup, but we're using direct navigation instead
    /*
    setCurrentApplication(application)
    setEditFormValues({
      month: application.month || '',
      policy_submit_date: application.policy_submit_date || '',
      closed_by_agent: application.closed_by_agent || '',
      proposed_insured: application.proposed_insured || '',
      client_phone_number: application.client_phone_number || '',
      client_state: application.client_state || '',
      policy_number: application.policy_number || '',
      carrier: application.carrier || '',
      product: application.product || '',
      monthly_premium: application.monthly_premium || 0,
      ap: application.ap || 0,
      status: application.status || '',
      paid_status: application.paid_status || '',
      point_of_sale: application.point_of_sale || '',
      pms_form_filled_out: application.pms_form_filled_out || false,
      split_with: application.split_with || '',
      effective_policy_date: application.effective_policy_date || '',
      effective_policy_status: application.effective_policy_status || '',
      notes: application.notes || '',
      notes_for_pay: application.notes_for_pay || '',
      paid_split: application.paid_split || '',
      commission_status: application.commission_status || '',
      commission_paid_date: application.commission_paid_date || '',
      policy_payment_cycle: application.policy_payment_cycle || '',
      commission_amount: application.commission_amount || 0,
    })
    setEditDialogOpen(true)
    */
  }

  // Function to handle form field changes
  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to save changes
  const saveApplicationChanges = async () => {
    if (!currentApplication?.id) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && process.env.NODE_ENV !== 'development') {
        throw new Error('You must be logged in to update applications')
      }
      
      // Update the month columns based on commission payment date if status is "Paid"
      if (editFormValues.commission_status === "Paid" && editFormValues.commission_paid_date) {
        // Get the month from the commission paid date
        const paidDate = new Date(editFormValues.commission_paid_date);
        const paidMonth = paidDate.getMonth() + 1; // JavaScript months are 0-indexed
        const paidYear = paidDate.getFullYear();
        const currentYear = new Date().getFullYear();
        
        // Calculate which month column to update based on the date
        // If we're in the same year, just use the month number
        // If it's from last year, adjust accordingly
        let monthColumnIndex;
        
        if (paidYear === currentYear) {
          monthColumnIndex = paidMonth;
        } else {
          // Handle previous year(s) - this is a simplification and might need adjusting
          // based on your business logic for tracking commissions across years
          const monthDiff = (currentYear - paidYear) * 12 + paidMonth;
          if (monthDiff > 0 && monthDiff <= 12) {
            monthColumnIndex = monthDiff;
          }
        }
        
        // If we determined a valid month column, update it with the commission amount
        if (monthColumnIndex && monthColumnIndex > 0 && monthColumnIndex <= 12) {
          const monthField = `month_${monthColumnIndex}`;
          console.log(`Updating ${monthField} with commission amount:`, editFormValues.commission_amount);
          
          // Add the commission amount to the appropriate month field
          editFormValues[monthField] = editFormValues.commission_amount || 0;
        }
      }
      
      const { data, error } = await supabase
        .from('agent_applications')
        .update(editFormValues)
        .eq('id', currentApplication.id)
        .eq('agent_id', session?.user?.id || 'demo-agent-id')
      
      if (error) {
        console.error('Error updating application:', error)
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      
      // Refresh applications list
      await fetchApplications()
      
      // Close dialog and reset state
      setEditDialogOpen(false)
      setCurrentApplication(null)
      
      toast({
        title: 'Application Updated',
        description: 'The application has been updated successfully.',
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Error saving changes:', error)
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update application',
        variant: 'destructive',
      })
    }
  }

  // Make columns expose the edit action
  const columnsWithEdit = columns.map(column => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: any) => {
          const application = row.original
          return (
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                onClick={() => {
                  console.log("Navigating to edit page for application:", application.id);
                  window.location.href = `/agent/applications/${application.id}/edit`;
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => deleteApplication(application.id)}
                disabled={bulkActionLoading}
              >
                <Trash className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
              <ApplicationActions applicationId={application.id} />
            </div>
          )
        }
      }
    }
    return column
  })

  // Function to handle bulk edit form field changes
  const handleBulkEditFieldChange = (field: string, value: any) => {
    setBulkEditValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to save bulk edit changes
  const saveBulkChanges = async () => {
    if (Object.keys(rowSelection).length === 0) return
    
    try {
      setBulkActionLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && process.env.NODE_ENV !== 'development') {
        throw new Error('You must be logged in to update applications')
      }
      
      // Get selected application IDs
      const selectedIds = Object.keys(rowSelection).map(index => {
        return filteredApplications[parseInt(index)].id
      })
      
      // Remove empty values from bulkEditValues
      const valuesToUpdate = Object.fromEntries(
        Object.entries(bulkEditValues).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
      
      // Don't proceed if no fields to update
      if (Object.keys(valuesToUpdate).length === 0) {
        toast({
          title: 'No Changes',
          description: 'Please specify at least one field to update.',
          variant: 'warning',
        })
        return
      }
      
      // Add updated timestamp
      valuesToUpdate.updated_at = new Date().toISOString()
      
      // Update all selected applications
      const { data, error } = await supabase
        .from('agent_applications')
        .update(valuesToUpdate)
        .in('id', selectedIds)
        .eq('agent_id', session?.user?.id || 'demo-agent-id')
      
      if (error) {
        console.error('Error updating applications:', error)
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      
      // Refresh applications list
      await fetchApplications()
      
      // Close dialog and reset state
      setBulkEditDialogOpen(false)
      setBulkEditValues({})
      setRowSelection({})
      
      toast({
        title: 'Applications Updated',
        description: `Successfully updated ${selectedIds.length} applications.`,
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Error saving bulk changes:', error)
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update applications',
        variant: 'destructive',
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Function to delete a single application
  const deleteApplication = async (applicationId: string) => {
    if (!applicationId) return;
    
    try {
      setBulkActionLoading(true);
      
      // Get current session from Supabase directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        toast({
          title: 'Authentication Error',
          description: 'Unable to verify your session. Please refresh the page and try again.',
          variant: 'destructive',
        });
        setBulkActionLoading(false);
        return;
      }
      
      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to delete applications. Please refresh the page and try again.',
          variant: 'destructive',
        });
        setBulkActionLoading(false);
        return;
      }
      
      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this application?')) {
        setBulkActionLoading(false);
        return;
      }
      
      console.log(`Attempting to delete application: ${applicationId}`);
      
      // Try first to use Supabase directly with RLS
      try {
        // This will work if RLS policies are properly set up
        const { error: deleteError } = await supabase
          .from('agent_applications')
          .delete()
          .eq('id', applicationId);
        
        if (deleteError) {
          console.log('Direct delete failed, falling back to API:', deleteError.message);
          throw new Error('Direct delete failed');
        }
        
        // If we get here, deletion was successful
        console.log('Application deleted successfully via direct RLS access');
        setApplications(prevApplications => 
          prevApplications.filter(app => app.id !== applicationId)
        );
        
        toast({
          title: 'Success',
          description: 'Application deleted successfully',
        });
        
        return; // Exit the function since deletion was successful
      } catch (directDeleteError) {
        // Fall back to the API route if direct delete fails
        console.log('Falling back to API route for deletion');
      }
      
      // Use the API route as a fallback (with credentials to ensure cookies are sent)
      const response = await fetch('/api/applications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          userId: session.user.id,
        }),
        credentials: 'include' // Ensure cookies are sent
      });
      
      if (!response.ok) {
        // If the response is 401 Unauthorized, the session might have expired
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please refresh the page to log in again.',
            variant: 'destructive',
          });
          return;
        }
        
        // If the response is 403 Forbidden, the user doesn't have permission
        if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to delete this application.',
            variant: 'destructive',
          });
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete application');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Remove the deleted application from the local state
        setApplications(prevApplications => 
          prevApplications.filter(app => app.id !== applicationId)
        );
        
        toast({
          title: 'Success',
          description: 'Application deleted successfully',
        });
      } else {
        console.error('Error deleting application:', result.error);
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete application',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Function to delete multiple applications
  const deleteBulkApplications = async () => {
    if (Object.keys(rowSelection).length === 0) return;
    
    try {
      setBulkActionLoading(true);
      
      // Get current session from Supabase directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        toast({
          title: 'Authentication Error',
          description: 'Unable to verify your session. Please refresh the page and try again.',
          variant: 'destructive',
        });
        setBulkActionLoading(false);
        return;
      }
      
      console.log("Session information for bulk delete:", session ? { 
        id: session.user?.id,
        email: session.user?.email,
        isAuthenticated: !!session
      } : "No session found");
      
      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to delete applications. Please refresh the page and try again.',
          variant: 'destructive',
        });
        setBulkActionLoading(false);
        return;
      }
      
      if (bulkDeleteConfirmation !== "DELETE") {
        toast({
          title: 'Confirmation Required',
          description: 'Please type DELETE in the confirmation field to proceed.',
          variant: 'destructive',
        });
        setBulkActionLoading(false);
        return;
      }
      
      // Get the selected IDs
      const selectedIds = Object.keys(rowSelection).map(index => {
        return filteredApplications[parseInt(index)].id;
      });
      
      console.log("Selected IDs for deletion:", selectedIds);
      console.log("Total applications before delete:", applications.length);
      
      // Confirm deletion
      if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} applications? This action cannot be undone.`)) {
        setBulkActionLoading(false);
        return;
      }
      
      // Try first to use Supabase directly with RLS
      try {
        // This will work if RLS policies are properly set up
        const { error: deleteError } = await supabase
          .from('agent_applications')
          .delete()
          .in('id', selectedIds);
        
        if (deleteError) {
          console.log('Direct bulk delete failed, falling back to API:', deleteError.message);
          throw new Error('Direct delete failed');
        }
        
        // If we get here, deletion was successful
        console.log('Applications deleted successfully via direct RLS access');
        
        // Update local state
        setApplications(prevApplications => 
          prevApplications.filter(app => !selectedIds.includes(app.id))
        );
        
        // Clear row selection
        setRowSelection({});
        setBulkDeleteConfirmation("");
        
        toast({
          title: 'Success',
          description: `${selectedIds.length} applications deleted successfully`,
        });
        
        return; // Exit the function since deletion was successful
      } catch (directDeleteError) {
        // Fall back to the API route if direct delete fails
        console.log('Falling back to API route for bulk deletion');
      }
      
      // Use the API route as a fallback
      const response = await fetch('/api/applications/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedIds,
          userId: session.user.id,
        }),
        credentials: 'include' // Ensure cookies are sent
      });
      
      if (!response.ok) {
        // If the response is 401 Unauthorized, the session might have expired
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please refresh the page to log in again.',
            variant: 'destructive',
          });
          return;
        }
        
        // If the response is 403 Forbidden, the user doesn't have permission
        if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to delete these applications.',
            variant: 'destructive',
          });
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete applications');
      }
      
      const result = await response.json();
      console.log("Bulk delete API response:", result);
      
      if (result.success) {
        // Update the applications list by removing the deleted ones
        if (result.deletedIds && result.deletedIds.length > 0) {
          setApplications(prevApplications => 
            prevApplications.filter(app => !result.deletedIds.includes(app.id))
          );
          
          // Clear row selection
          setRowSelection({});
          setBulkDeleteConfirmation("");
          
          toast({
            title: 'Success',
            description: `${result.deletedIds.length} applications deleted successfully`,
          });
        }
        
        // Show warning about applications that couldn't be found
        if (result.notFoundIds && result.notFoundIds.length > 0) {
          toast({
            title: 'Warning',
            description: `${result.notFoundIds.length} applications couldn't be found`,
            variant: 'warning',
          });
        }
        
        // Show warning about applications that user doesn't have permission to delete
        if (result.restrictedIds && result.restrictedIds.length > 0) {
          toast({
            title: 'Permission Warning',
            description: `You don't have permission to delete ${result.restrictedIds.length} applications`,
            variant: 'warning',
          });
        }
      } else {
        console.error("Error deleting applications:", result.error);
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete applications',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error("Error deleting applications:", error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // When the Auto-map button is clicked
  const handleAutoMap = () => {
    if (!bulkDataPreview || bulkDataPreview.length === 0) {
      setParseError('No data available to map');
      return;
    }

    // Create a comprehensive mapping dictionary to match various header formats
    const mappingDictionary = {
      // Client Information
      'proposed insured': 'proposed_insured',
      'proposed_insured': 'proposed_insured',
      'client name': 'proposed_insured',
      'customer name': 'proposed_insured',
      'full name': 'proposed_insured',
      'name': 'proposed_insured',
      'client': 'proposed_insured',
      'insured': 'proposed_insured',
      
      'client phone': 'client_phone_number',
      'client phone number': 'client_phone_number',
      'client_phone_number': 'client_phone_number',
      'phone number': 'client_phone_number',
      'phone': 'client_phone_number',
      'contact': 'client_phone_number',
      'mobile': 'client_phone_number',
      'cell': 'client_phone_number',
      
      'client email': 'client_email',
      'client_email': 'client_email',
      'email': 'client_email',
      'e-mail': 'client_email',
      
      'client state': 'client_state',
      'client_state': 'client_state',
      'state': 'client_state',
      'st': 'client_state',
      
      // Policy Details
      'month': 'month',
      'mth': 'month',
      'mo': 'month',
      
      'policy submit date': 'policy_submit_date',
      'policy_submit_date': 'policy_submit_date',
      'submit date': 'policy_submit_date',
      'date submitted': 'policy_submit_date',
      'submission date': 'policy_submit_date',
      'application date': 'policy_submit_date',
      
      'policy number': 'policy_number',
      'policy_number': 'policy_number',
      'policy #': 'policy_number',
      'policy#': 'policy_number',
      'policy no': 'policy_number',
      'policy no.': 'policy_number',
      'policy_no': 'policy_number',
      
      'carrier': 'carrier',
      'carrier_id': 'carrier_id',
      'insurance company': 'carrier',
      'insurance provider': 'carrier',
      'company': 'carrier',
      'provider': 'carrier',
      
      'product': 'product',
      'policy type': 'product',
      'policy_type': 'product',
      'type': 'product',
      'plan': 'product',
      
      'monthly premium': 'monthly_premium',
      'monthly_premium': 'monthly_premium',
      'premium': 'monthly_premium',
      'monthly': 'monthly_premium',
      'mo premium': 'monthly_premium',
      
      'ap': 'ap',
      'annual premium': 'ap',
      'annual_premium': 'ap',
      'yearly premium': 'ap',
      'annual': 'ap',
      
      'status': 'status',
      'application status': 'status',
      'app status': 'status',
      'policy status': 'status',
      
      'paid status': 'paid_status',
      'paid_status': 'paid_status',
      'payment status': 'paid_status',
      
      // Additional Information
      'closed by agent': 'closed_by_agent',
      'closed_by_agent': 'closed_by_agent',
      'agent closed': 'closed_by_agent',
      'closed by': 'closed_by_agent',
      
      'point of sale': 'point_of_sale',
      'point_of_sale': 'point_of_sale',
      'pos': 'point_of_sale',
      'sale location': 'point_of_sale',
      
      'pms form filled out': 'pms_form_filled_out',
      'pms_form_filled_out': 'pms_form_filled_out',
      'pms form': 'pms_form_filled_out',
      'pms': 'pms_form_filled_out',
      
      'split with': 'split_with',
      'split_with': 'split_with',
      'agent split': 'split_with',
      'split': 'split_with',
      
      'effective policy date': 'effective_policy_date',
      'effective_policy_date': 'effective_policy_date',
      'effective date': 'effective_policy_date',
      'start date': 'effective_policy_date',
      
      'effective policy status': 'effective_policy_status',
      'effective_policy_status': 'effective_policy_status',
      
      // Notes & Commission
      'notes': 'notes',
      'comments': 'notes',
      'remarks': 'notes',
      
      'notes for pay': 'notes_for_pay',
      'notes_for_pay': 'notes_for_pay',
      'payment notes': 'notes_for_pay',
      
      'paid split': 'paid_split',
      'paid_split': 'paid_split',
      'paid split?': 'paid_split',
      
      'commission status': 'commission_status',
      'commission_status': 'commission_status',
      'comm status': 'commission_status',
      
      'commission paid date': 'commission_paid_date',
      'commission_paid_date': 'commission_paid_date',
      'comm paid date': 'commission_paid_date',
      
      'policy payment cycle': 'policy_payment_cycle',
      'policy_payment_cycle': 'policy_payment_cycle',
      'payment cycle': 'policy_payment_cycle',
      'cycle': 'policy_payment_cycle',
      
      'commission amount': 'commission_amount',
      'commission_amount': 'commission_amount',
      'comm amount': 'commission_amount',
    };
    
    // Reset all mappings first to ensure consistent results
    const newMappings = {};
    Object.keys(bulkDataPreview[0] || {}).forEach(header => {
      newMappings[header] = 'unmapped';
    });
    
    // Apply mappings based on the dictionary
    Object.keys(bulkDataPreview[0] || {}).forEach(header => {
      const headerLower = header.toLowerCase().trim();
      
      // Check for exact match
      if (mappingDictionary[headerLower]) {
        newMappings[header] = mappingDictionary[headerLower];
        return;
      }
      
      // Try fuzzy matching by checking if header contains key phrases
      for (const [key, value] of Object.entries(mappingDictionary)) {
        if (headerLower.includes(key.toLowerCase())) {
          newMappings[header] = value;
          return;
        }
      }
      
      // Special cases for partial matches
      if (headerLower.includes('phone') || headerLower.includes('mobile') || headerLower.includes('cell')) {
        newMappings[header] = 'client_phone_number';
      } else if (headerLower.includes('email')) {
        newMappings[header] = 'client_email';
      } else if (headerLower.includes('state')) {
        newMappings[header] = 'client_state';
      } else if (headerLower.includes('premium') && !headerLower.includes('annual')) {
        newMappings[header] = 'monthly_premium';
      } else if (headerLower.includes('premium') && headerLower.includes('annual')) {
        newMappings[header] = 'ap';
      } else if (headerLower.includes('policy') && (headerLower.includes('number') || headerLower.includes('#'))) {
        newMappings[header] = 'policy_number';
      } else if (headerLower.includes('date') && headerLower.includes('submit')) {
        newMappings[header] = 'policy_submit_date';
      } else if (headerLower.includes('name') || headerLower.includes('insured')) {
        newMappings[header] = 'proposed_insured';
      }
    });
    
    console.log('Auto-mapped fields:', newMappings);
    setColumnMappings(newMappings);
    toast({
      title: 'Auto-mapping applied',
      description: 'Column mappings have been automatically determined based on column names.'
    });
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Insurance Applications</h2>
            <p className="text-muted-foreground">Manage your insurance applications and payment history</p>
          </div>
        </div>
        
        {/* Dashboard Metrics Section */}
        {!loading && <DashboardMetrics />}
        
        <PaymentHistoryLegend />
        
        <div className="h-full flex flex-col overflow-hidden">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  {/* Removed the duplicated title and description here */}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => router.push('/agent/applications/new')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> New Application
                  </Button>
                  <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Bulk Add Applications</Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-h-[90vh] max-w-[1200px] overflow-auto bg-background border shadow-lg p-4 rounded-xl" style={{backgroundColor: 'white'}}>
                      <DialogHeader className="pb-2 border-b mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Upload className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <DialogTitle className="text-xl">Bulk Add Applications</DialogTitle>
                            <DialogDescription className="text-sm">
                              Import multiple applications at once from a spreadsheet or CSV file.
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      
                      {importSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="mb-4 rounded-full bg-green-100 p-3">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold">Import Successful</h3>
                          <p className="text-center text-muted-foreground mt-2">
                            Your applications have been imported successfully.
                          </p>
                          {importFeedback.length > 0 && (
                            <div className="mt-4 max-h-[200px] overflow-auto border rounded p-3 text-sm w-full">
                              <h4 className="font-medium mb-2">Import Details:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {importFeedback.map((message, idx) => (
                                  <li key={idx} className={message.includes('error') ? 'text-red-600' : 'text-green-600'}>
                                    {message}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button 
                            className="mt-6" 
                            onClick={() => { 
                              setBulkImportOpen(false)
                              resetImportState()
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      ) : importLoading && importProgress > 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Progress value={importProgress} className="w-full max-w-md mb-4" />
                          <p className="text-center text-sm text-muted-foreground">
                            Importing your applications... {importProgress}%
                          </p>
                        </div>
                      ) : !mappingStep ? (
                        <div>
                          <Tabs 
                            defaultValue="paste" 
                            className="mt-4"
                            onValueChange={(value) => {
                              setImportMethod(value as 'paste' | 'file');
                              setParseError('');
                            }}
                          >
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                              <TabsTrigger value="paste">Paste Data</TabsTrigger>
                              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="paste" className="mt-4">
                              <div className="space-y-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="bulkData">Paste your spreadsheet data</Label>
                                  <Textarea
                                    id="bulkData"
                                    placeholder="Paste data from Excel, Google Sheets, or CSV"
                                    className="min-h-[200px] font-mono text-xs"
                                    value={bulkData}
                                    onChange={(e) => {
                                      setBulkData(e.target.value);
                                      setParseError(''); // Clear any previous errors when data changes
                                    }}
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>Tips for pasting data:</p>
                                  <ul className="list-disc pl-5 space-y-1 mt-1">
                                    <li>Make sure your data includes a header row</li>
                                    <li>Supported delimiters: comma, tab, semicolon</li>
                                    <li>Copy directly from Excel, Google Sheets, or other spreadsheet apps</li>
                                  </ul>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="upload" className="mt-4">
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                                <UploadCloud className="h-8 w-8 text-muted-foreground mb-4" />
                                <p className="mb-4 text-sm text-muted-foreground text-center">
                                  Drag and drop your CSV file here, or click to select a file
                                </p>
                                <input
                                  type="file"
                                  accept=".csv,.xls,.xlsx,.txt"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="file-upload"
                                />
                                <Button asChild variant="outline" size="sm">
                                  <label htmlFor="file-upload" className="cursor-pointer">
                                    Choose File
                                  </label>
                                </Button>
                                {uploadedFile && (
                                  <div className="mt-4 text-sm">
                                    Selected: <span className="font-medium">{uploadedFile.name}</span>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>

                          {parseError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mt-4 text-sm">
                              {parseError}
                            </div>
                          )}

                          <div className="flex justify-end mt-6 space-x-2">
                            <Button variant="outline" onClick={() => setBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={parseBulkData} 
                              disabled={
                                (importMethod === 'paste' && !bulkData.trim()) || 
                                (importMethod === 'file' && !uploadedFile)
                              }
                              className={
                                ((importMethod === 'paste' && !bulkData.trim()) || 
                                (importMethod === 'file' && !uploadedFile))
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : ''
                              }
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Continue to Mapping
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="mt-4 mb-6">
                            <h3 className="text-lg font-medium mb-2">Map Your Columns</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              We've found {bulkDataPreview.length} rows. Please match each column to the appropriate field in our system.
                            </p>
                            
                            <div className="flex flex-wrap gap-3 mb-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAutoMap}
                                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                Auto-map columns
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const newMappings = {};
                                  Object.keys(bulkDataPreview[0] || {}).forEach(header => {
                                    newMappings[header] = 'unmapped';
                                  });
                                  setColumnMappings(newMappings);
                                }}
                                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Clear all mappings
                              </Button>
                            </div>

                            {/* Mapping progress card */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2 items-center">
                                  <ClipboardList className="h-5 w-5 text-blue-600" />
                                  <h4 className="font-medium">Mapping Progress</h4>
                                </div>
                                <div className="text-sm">
                                  <span className="font-mono font-medium">{Object.values(columnMappings).filter(v => v && v !== 'unmapped').length}</span> 
                                  <span className="text-muted-foreground"> of </span>
                                  <span className="font-mono font-medium">{Object.keys(bulkDataPreview[0] || {}).length}</span>
                                  <span className="text-muted-foreground"> columns mapped</span>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <Progress 
                                  value={(Object.values(columnMappings).filter(v => v && v !== 'unmapped').length / Object.keys(bulkDataPreview[0] || {}).length) * 100} 
                                  className="h-2 bg-blue-100"
                                />
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span className={columnMappings.proposed_insured ? "font-medium" : "text-blue-400"}>
                                    Proposed Insured {columnMappings.proposed_insured ? "✓" : ""}
                                  </span>
                                </div>
                                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span className={columnMappings.carrier ? "font-medium" : "text-blue-400"}>
                                    Carrier {columnMappings.carrier ? "✓" : ""}
                                  </span>
                                </div>
                                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span className={columnMappings.product ? "font-medium" : "text-blue-400"}>
                                    Product {columnMappings.product ? "✓" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Column Mapping Interface */}
                          <div className="space-y-6 mb-6">
                            {Object.keys(bulkDataPreview[0] || {}).map((header) => {
                              const isMapped = columnMappings[header] && columnMappings[header] !== 'unmapped';
                              const isRequired = ['proposed_insured', 'carrier', 'product'].includes(columnMappings[header]);
                              
                              return (
                                <div 
                                  key={`map-row-${header}`} 
                                  className={`flex flex-col sm:flex-row items-start sm:items-center border rounded-lg p-3 transition-colors ${
                                    isMapped 
                                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
                                      : 'bg-white hover:bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="w-full sm:w-1/3 mb-3 sm:mb-0 flex items-center gap-2">
                                    <div className={`p-2 rounded-md ${isMapped ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                      <FileText className={`h-4 w-4 ${isMapped ? 'text-blue-600' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm truncate max-w-full sm:max-w-[200px]" title={header}>
                                        {header}
                                        {isRequired && (
                                          <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200">
                                            Required
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {bulkDataPreview[0][header] ? 
                                          <span className="opacity-75">Sample: {String(bulkDataPreview[0][header]).substring(0, 30)}{String(bulkDataPreview[0][header]).length > 30 ? '...' : ''}</span> 
                                          : 'No sample value'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="hidden sm:flex flex-1 px-4 justify-center items-center">
                                    <div className={`h-0.5 w-full ${isMapped ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
                                  </div>
                                  
                                  <div className="w-full sm:w-1/3 mt-2 sm:mt-0">
                                    <Select
                                      value={columnMappings[header] || 'unmapped'}
                                      onValueChange={(value) => {
                                        setColumnMappings(prev => ({
                                          ...prev,
                                          [header]: value
                                        }));
                                      }}
                                    >
                                      <SelectTrigger 
                                        className={`w-full transition-all ${
                                          isMapped 
                                            ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm hover:bg-blue-200' 
                                            : 'bg-white hover:bg-gray-50'
                                        }`}
                                      >
                                        <SelectValue placeholder="Map to field..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[300px]">
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Basic Client Info
                                          </SelectLabel>
                                          <SelectItem value="unmapped" className="text-gray-500">
                                            <div className="flex items-center">
                                              <Ban className="h-3 w-3 mr-2 opacity-70" />
                                              <span>Ignore this column</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="proposed_insured" className="text-blue-700 font-medium">
                                            <div className="flex items-center">
                                              <Star className="h-3 w-3 mr-2 text-amber-500" />
                                              <span>Proposed Insured (Required)</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="client_phone_number">Client Phone Number</SelectItem>
                                          <SelectItem value="client_state">Client State</SelectItem>
                                          <SelectItem value="client_email">Client Email</SelectItem>
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Policy Basics
                                          </SelectLabel>
                                          <SelectItem value="policy_number">Policy Number</SelectItem>
                                          <SelectItem value="carrier" className="text-blue-700 font-medium">
                                            <div className="flex items-center">
                                              <Star className="h-3 w-3 mr-2 text-amber-500" />
                                              <span>Carrier (Required)</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="carrier_id">Carrier ID</SelectItem>
                                          <SelectItem value="product" className="text-blue-700 font-medium">
                                            <div className="flex items-center">
                                              <Star className="h-3 w-3 mr-2 text-amber-500" />
                                              <span>Product (Required)</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="monthly_premium">Monthly Premium</SelectItem>
                                          <SelectItem value="ap">AP (Annual Premium)</SelectItem>
                                          <SelectItem value="status">Status</SelectItem>
                                          <SelectItem value="paid_status">Paid Status</SelectItem>
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Dates
                                          </SelectLabel>
                                          <SelectItem value="month">Month</SelectItem>
                                          <SelectItem value="policy_submit_date">Policy Submit Date</SelectItem>
                                          <SelectItem value="effective_policy_date">Effective Policy Date</SelectItem>
                                          <SelectItem value="commission_paid_date">Commission Paid Date</SelectItem>
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Agent Information
                                          </SelectLabel>
                                          <SelectItem value="closed_by_agent">Closed By Agent</SelectItem>
                                          <SelectItem value="point_of_sale">Point of Sale</SelectItem>
                                          <SelectItem value="pms_form_filled_out">PMS Form Filled Out</SelectItem>
                                          <SelectItem value="split_with">Split With</SelectItem>
                                          <SelectItem value="paid_split">Paid Split</SelectItem>
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Commission & Status
                                          </SelectLabel>
                                          <SelectItem value="effective_policy_status">Effective Policy Status</SelectItem>
                                          <SelectItem value="commission_status">Commission Status</SelectItem>
                                          <SelectItem value="policy_payment_cycle">Policy Payment Cycle</SelectItem>
                                          <SelectItem value="commission_amount">Commission Amount</SelectItem>
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                          <SelectLabel className="text-xs flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            Notes
                                          </SelectLabel>
                                          <SelectItem value="notes">Notes</SelectItem>
                                          <SelectItem value="notes_for_pay">Notes for Pay</SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Data Preview Section */}
                          <div className="mt-6 border rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 border-b">
                              <h4 className="font-medium flex items-center gap-2">
                                <Eye className="h-4 w-4 text-blue-600" />
                                Data Preview
                                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                                  First 5 rows ({bulkDataPreview.length} total)
                                </Badge>
                              </h4>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <Table className="min-w-full">
                                <TableHeader className="bg-gray-50">
                                  <TableRow>
                                    {Object.keys(bulkDataPreview[0] || {}).map((header) => {
                                      const isMapped = columnMappings[header] && columnMappings[header] !== 'unmapped';
                                      
                                      return (
                                        <TableHead 
                                          key={`preview-header-${header}`}
                                          className={`text-xs font-medium px-3 py-2 ${
                                            isMapped ? 'text-blue-700' : 'text-gray-500'
                                          }`}
                                        >
                                          {header}
                                          {isMapped && (
                                            <div className="text-xs mt-1 font-normal">
                                              ↓ <span className="text-blue-600">{columnMappings[header].replace(/_/g, ' ')}</span>
                                            </div>
                                          )}
                                        </TableHead>
                                      );
                                    })}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {bulkDataPreview.slice(0, 5).map((row, rowIndex) => (
                                    <TableRow key={`preview-row-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-gray-50/50' : ''}>
                                      {Object.keys(row).map((key) => {
                                        const isMapped = columnMappings[key] && columnMappings[key] !== 'unmapped';
                                        
                                        return (
                                          <TableCell 
                                            key={`preview-cell-${rowIndex}-${key}`}
                                            className={`text-xs px-3 py-2 ${
                                              isMapped ? 'text-slate-800' : 'text-slate-500'
                                            }`}
                                          >
                                            {typeof row[key] === 'string' ? row[key] : String(row[key] || '')}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setMappingStep(false)}>
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back to Upload
                            </Button>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">
                                {Object.values(columnMappings).filter(v => v && v !== 'unmapped').length} fields mapped
                              </div>
                              <Button 
                                onClick={handleBulkImport} 
                                disabled={importLoading || Object.values(columnMappings).filter(v => v && v !== 'unmapped').length === 0}
                                className={`transition-all ${
                                  Object.values(columnMappings).filter(v => v && v !== 'unmapped').length === 0 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                }`}
                              >
                                {importLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Applications
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending-first-payment">Pending First Payment</TabsTrigger>
                <TabsTrigger value="pending-payment">Pending Payment</TabsTrigger>
                <TabsTrigger value="paid-issued">Paid & Issued</TabsTrigger>
                <TabsTrigger value="not-taken">Not Taken</TabsTrigger>
                <TabsTrigger value="needs-attention">Needs Attention</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="approved" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="pending-first-payment" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="pending-payment" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="paid-issued" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="not-taken" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="needs-attention" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="flex-1 overflow-hidden">
                {loading ? (
                  <ApplicationSkeletonLoader />
                ) : (
                  <ErrorBoundary>
                    <DataTable 
                      columns={columnsWithEdit} 
                      data={filteredApplications} 
                      state={{ rowSelection }}
                      onRowSelectionChange={setRowSelection}
                    />
                  </ErrorBoundary>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ... dialog components ... */}
        </div>
      </div>
    </TooltipProvider>
  )
} 