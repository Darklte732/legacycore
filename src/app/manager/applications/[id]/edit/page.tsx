'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import './styles.css'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { PulseLoader } from 'react-spinners'
import { LoadingButton } from '@/components/ui/loading-button'
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react'

// Suppress React development warnings about forwardRef
// These are coming from third-party components and don't impact functionality
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes && (
    args[0].includes('Function components cannot be given refs') ||
    args[0].includes('Encountered two children with the same key')
  )) {
    // Suppress specific React warnings
    return;
  }
  originalError(...args);
};

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parse, isValid } from 'date-fns'
import { PaymentGrid, PaymentLegend } from '../../../../agent/applications/components/PaymentComponents'
import { User, Phone, Mail, MapPin, Calendar, FileText, DollarSign, ClipboardList, HelpCircle, AlertCircle, CheckCircle, Percent, X, MessageSquare, Banknote } from 'lucide-react'

// Form schema for validation
const formSchema = z.object({
  // Client Information
  proposed_insured: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  client_phone_number: z.string().optional().or(z.literal('')),
  client_state: z.string().optional().or(z.literal('')),
  client_id: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  street_address: z.string().optional(),
  date_of_birth: z.string().optional(),
  
  // Policy Details
  month: z.string().optional(),
  policy_submit_date: z.string().optional(),
  policy_number: z.string().optional(),
  carrier: z.string().optional().or(z.literal('')),
  product: z.string().optional().or(z.literal('')),
  monthly_premium: z.union([z.string(), z.number()]).optional(),
  ap: z.union([z.string(), z.number()]).optional(),
  
  // Status Information
  status: z.string().optional().or(z.literal('')),
  policy_health: z.string().optional(),
  paid_status: z.string().optional(),
  
  // Additional Information
  closed_by_agent: z.string().optional(),
  point_of_sale: z.string().optional(),
  pms_form_filled_out: z.boolean().optional(),
  split_with: z.string().optional(),
  split_percentage: z.union([z.string(), z.number()]).optional(),
  effective_policy_date: z.string().optional(),
  effective_policy_status: z.string().optional(),
  
  // Notes & Commission Information
  notes: z.string().optional(),
  notes_for_pay: z.string().optional(),
  paid_split: z.string().optional(),
  commission_status: z.string().optional(),
  commission_paid_date: z.string().optional(),
  policy_payment_cycle: z.string().optional(),
  commission_amount: z.union([z.string(), z.number()]).optional(),
}).catchall(z.any());

// Define form values interface
interface FormValues {
  // Client Information
  proposed_insured: string;
  client_email?: string;
  client_phone_number?: string;
  client_state: string;
  client_id?: string;
  city?: string;
  zip?: string;
  street_address?: string;
  date_of_birth?: string;
  
  // Policy Details
  carrier_id: string;
  policy_type: string;
  monthly_premium?: string;
  face_amount?: string;
  policy_status?: string;
  policy_submit_date?: string;
  effective_policy_date?: string;
  
  // Agent/Commission Details
  agent_id?: string;
  ucode?: string;
  agent_commission_rate?: string;
  manager_commission_rate?: string;
  agent_commission?: string;
  manager_commission?: string;
  commission_paid?: boolean;
  commission_paid_date?: string;
  ap?: string;
  commission_notes?: string;
  
  // Other Details
  notes?: string;
  organization_id?: string;
}

export default function ManagerEditApplicationPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { role, loading: roleLoading } = useRole()
  
  const [carriers, setCarriers] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null);

  // Define form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposed_insured: '',
      client_email: '',
      client_phone_number: '',
      client_state: '',
      month: '',
      policy_submit_date: '',
      policy_number: '',
      carrier: '',
      product: '',
      monthly_premium: '',
      ap: '',
      status: 'Pending',
      policy_health: '',
      paid_status: '',
      closed_by_agent: '',
      point_of_sale: '',
      pms_form_filled_out: false,
      split_with: '',
      split_percentage: '20', // Default manager split is 20%
      effective_policy_date: '',
      effective_policy_status: '',
      notes: '',
      notes_for_pay: '',
      paid_split: '',
      commission_status: '',
      commission_paid_date: '',
      policy_payment_cycle: '',
      commission_amount: '',
    },
  })

  // Format a date string for use in an input[type="date"]
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      // If it's already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return dateString.split('T')[0]; // Remove time component if exists
      }
      
      // Try to parse the date and format it as YYYY-MM-DD
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd');
      }
      
      console.warn('Invalid date format:', dateString);
      return '';
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Fetch application data
  useEffect(() => {
    async function fetchApplicationData() {
      setIsLoading(true);
      // Extract application ID from params
      const applicationId = Array.isArray(id) ? id[0] : id;
      console.log('Fetching application with ID:', applicationId);
      
      try {
        // Fetch carriers for the dropdown and ensure unique entries
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers')
          .select('id, name');
        
        if (carriersError) {
          console.error('Error fetching carriers:', carriersError);
          toast.error('Error loading carriers');
          setIsLoading(false);
          return;
        }
        
        // Process carriers to ensure no duplicate names
        const processedCarriers = carriersData || [];
        const uniqueCarrierNames = new Set();
        const uniqueCarriers = processedCarriers.filter(carrier => {
          if (uniqueCarrierNames.has(carrier.name)) {
            return false;
          }
          uniqueCarrierNames.add(carrier.name);
          return true;
        });
        
        console.log('Carriers loaded:', uniqueCarriers);
        setCarriers(uniqueCarriers);
        
        // First try the direct SQL RPC function approach - this is more reliable
        console.log('Trying to fetch application using SQL RPC function...');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_application_with_client', { 
            app_id: applicationId 
          });
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          // SQL RPC call successful
          const appData = rpcData[0];
          console.log('Application data loaded via RPC:', appData);
          setApplicationData(appData);
          
          // Format the data for the form
          const formattedData = {
            ...appData,
            policy_submit_date: formatDateForInput(appData.policy_submit_date),
            effective_policy_date: formatDateForInput(appData.effective_policy_date),
            commission_paid_date: formatDateForInput(appData.commission_paid_date),
            date_of_birth: formatDateForInput(appData.date_of_birth),
          };
          
          console.log('Setting form data from RPC:', formattedData);
          form.reset(formattedData);
          setIsLoading(false);
        } else {
          console.log('First RPC function failed, trying simpler fetch_application_direct...', rpcError);
          
          // Try the simpler direct fetch RPC function
          const { data: directData, error: directError } = await supabase
            .rpc('fetch_application_direct', { 
              app_id: applicationId 
            });
            
          if (!directError && directData && directData.length > 0) {
            const appData = directData[0];
            console.log('Application data loaded via direct fetch:', appData);
            setApplicationData(appData);
            
            // Try to fetch associated client data
            await fetchClientData(appData);
          } else {
            console.log('Direct fetch failed too, trying fallback method:', directError);
            
            // Fallback to simple query approach (avoids complex joins that might cause 400 errors)
            const { data: simpleAppData, error: simpleAppError } = await supabase
              .from('agent_applications')
              .select('*')
              .eq('id', applicationId)
              .single();
            
            if (simpleAppError || !simpleAppData) {
              console.error('Error with simple application query:', simpleAppError);
              toast.error('Could not load application data');
              setIsLoading(false);
              return;
            }
            
            console.log('Application data loaded via fallback query:', simpleAppData);
            setApplicationData(simpleAppData);
            
            // Try to fetch associated client data
            await fetchClientData(simpleAppData);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Unexpected error loading application');
        setIsLoading(false);
      }
    }
    
    // Helper function to fetch and process client data (used only for fallback)
    async function fetchClientData(appData: any) {
      let clientData = null;
      
      try {
        // First try to fetch by client_id if available
        if (appData.client_id) {
          const { data: client, error: clientIdError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', appData.client_id)
            .single();
            
          if (!clientIdError && client) {
            clientData = client;
            console.log('Client data loaded by ID:', clientData);
          }
        } 
        // If no client ID or client not found by ID, try to match by name
        else if (appData.proposed_insured) {
          const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .ilike('first_name || \' \' || last_name', `%${appData.proposed_insured}%`)
            .limit(1);
            
          if (!clientError && clients && clients.length > 0) {
            clientData = clients[0];
            console.log('Client data loaded by name:', clientData);
          }
        }
      } catch (clientErr) {
        console.error('Error fetching client data:', clientErr);
      }
      
      // Format and merge data with client information if available
      const formattedData = {
        ...appData,
        policy_submit_date: formatDateForInput(appData.policy_submit_date),
        effective_policy_date: formatDateForInput(appData.effective_policy_date),
        commission_paid_date: formatDateForInput(appData.commission_paid_date),
        // Add client data if available
        ...(clientData && {
          client_id: clientData.id,
          client_email: clientData.email || appData.client_email,
          client_phone_number: clientData.phone || appData.client_phone_number,
          client_state: clientData.state || appData.client_state,
          city: clientData.city || appData.city,
          zip: clientData.zip_code || appData.zip,
          street_address: clientData.address_line1 || appData.street_address,
          date_of_birth: formatDateForInput(clientData.date_of_birth) || formatDateForInput(appData.date_of_birth),
        }),
      };
      
      console.log('Setting form data from fallback:', formattedData);
      form.reset(formattedData);
      setIsLoading(false);
    }

    if (!roleLoading) {
      fetchApplicationData();
    }
  }, [id, form, roleLoading, supabase]);

  // Helper function to calculate Annual Premium from Monthly Premium
  const calculateAP = (monthlyPremium: string | number): number => {
    const premium = parseNumeric(monthlyPremium);
    return premium * 12;
  };

  // Helper function to parse numeric values
  const parseNumeric = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    
    if (typeof value === 'number') return value;
    
    const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Form submission handler
  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    setSaveSuccess(false);
    console.log("Submitting form with values:", values);
    
    try {
      const applicationId = Array.isArray(id) ? id[0] : id;
      
      // Ensure AP is calculated if empty but monthly_premium exists
      if (!values.ap && values.monthly_premium) {
        values.ap = calculateAP(values.monthly_premium);
      }

      // First, handle client record creation/update
      let clientId = values.client_id || null;
      
      if (values.proposed_insured) {
        // Parse proposed_insured into first and last name
        const nameParts = values.proposed_insured.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Prepare client data
        const clientData = {
          first_name: firstName,
          last_name: lastName,
          email: values.client_email || null,
          phone: values.client_phone_number || null,
          state: values.client_state || null,
          date_of_birth: values.date_of_birth || null,
          address_line1: values.street_address || null,
          city: values.city || null,
          zip_code: values.zip || null,
          organization_id: applicationData?.organization_id || null,
          updated_at: new Date().toISOString()
        };
        
        // If we have a client ID, update the existing record
        if (clientId) {
          console.log('Updating existing client record:', clientId);
          
          const { error: updateError } = await supabase
            .from('clients')
            .update(clientData)
            .eq('id', clientId);
          
          if (updateError) {
            console.error('Error updating client record:', updateError);
            // Continue with application update anyway
          } else {
            console.log('Client record updated successfully');
          }
        } 
        // If no client ID but we have enough info, create a new client
        else if (values.client_email || values.client_phone_number) {
          console.log('Creating new client record');
          
          const newClientData = {
            ...clientData,
            created_at: new Date().toISOString()
          };
          
          const { data: insertedClient, error: insertError } = await supabase
            .from('clients')
            .insert(newClientData)
            .select('id')
            .single();
          
          if (!insertError && insertedClient) {
            clientId = insertedClient.id;
            console.log('New client record created with ID:', clientId);
          } else {
            console.error('Error creating client record:', insertError);
            // Continue with application update anyway
          }
        }
      }
      
      // Now update the application in Supabase
      // Convert form values to match the database schema
      const applicationData = {
        // Include all form values
        proposed_insured: values.proposed_insured,
        client_email: values.client_email,
        client_phone_number: values.client_phone_number,
        client_state: values.client_state,
        policy_number: values.policy_number,
        carrier: values.carrier,
        product: values.product,
        monthly_premium: values.monthly_premium,
        ap: values.ap,
        status: values.status,
        policy_health: values.policy_health,
        paid_status: values.paid_status,
        closed_by_agent: values.closed_by_agent,
        point_of_sale: values.point_of_sale,
        pms_form_filled_out: values.pms_form_filled_out,
        split_with: values.split_with,
        split_percentage: values.split_percentage,
        effective_policy_date: values.effective_policy_date,
        effective_policy_status: values.effective_policy_status,
        notes: values.notes,
        notes_for_pay: values.notes_for_pay,
        paid_split: values.paid_split,
        commission_status: values.commission_status,
        commission_paid_date: values.commission_paid_date,
        policy_payment_cycle: values.policy_payment_cycle,
        commission_amount: values.commission_amount,
        policy_submit_date: values.policy_submit_date,
        
        // If we have a client ID, include it
        ...(clientId && { client_id: clientId }),
        
        // Add updated timestamp
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating application with data:', applicationData);
      
      const { error } = await supabase
        .from('agent_applications')
        .update(applicationData)
        .eq('id', applicationId);
      
      if (error) {
        console.error('Error updating application:', error);
        toast.error('Failed to update application');
        setIsSaving(false);
        return;
      }
      
      // Show a more prominent success message with longer duration
      toast.success('Application updated successfully!', {
        duration: 3000,
        position: 'top-center',
        style: { 
          background: '#10b981', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 24px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        },
      });
      
      // Set save success state
      setSaveSuccess(true);
      
      // Wait longer before redirecting to ensure notification is seen
      setTimeout(() => {
        router.push('/manager/applications');
      }, 2500);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading role data...</div>;
  }

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
      
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg success-banner flex items-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
          <div>
            <h3 className="text-green-800 font-medium">Application Saved Successfully!</h3>
            <p className="text-green-700 mt-1">You will be redirected to the applications list shortly.</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <PulseLoader color="#4f46e5" size={12} />
            <p className="text-slate-500 animate-pulse">Loading application data...</p>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-800 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-500" />
                {applicationData && applicationData.proposed_insured 
                  ? `Edit Application - ${applicationData.proposed_insured}` 
                  : 'Edit Application'}
              </h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: {applicationData?.updated_at 
                  ? new Date(applicationData.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) 
                  : 'New application'}
              </p>
            </div>
            <div className="sm:ml-auto">
              <LoadingButton
                onClick={() => form.handleSubmit(onSubmit)()}
                isLoading={isSaving}
                className={cn(
                  "text-white font-medium rounded-full px-6 py-2.5 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow",
                  saveSuccess 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" /> 
                    Save Changes
                  </>
                )}
              </LoadingButton>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Client Information Card */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <div className="form-grid-2 gap-6">
                    <FormField
                      control={form.control}
                      name="proposed_insured"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Client Name</FormLabel>
                          </div>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="client_email"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Email</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="client@example.com"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="client_phone_number"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Phone Number</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="(555) 123-4567"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Date of Birth</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street_address"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Address</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="123 Main St"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>City</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Anytown"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="client_state"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>State</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="CA"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>ZIP Code</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="12345"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Policy Details Card */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    Policy Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <div className="form-grid-2 gap-6">
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Carrier</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select carrier" />
                              </SelectTrigger>
                              <SelectContent>
                                {carriers && carriers.length > 0 ? (
                                  carriers.map(carrier => (
                                    <SelectItem key={carrier.id} value={carrier.name}>
                                      {carrier.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  // Fallback carrier list with unique keys
                                  [
                                    { id: 'americo', name: 'Americo' },
                                    { id: 'aig', name: 'AIG' },
                                    { id: 'royal-neighbors', name: 'Royal Neighbors' },
                                    { id: 'iule', name: 'IULE' },
                                    { id: 'cbo', name: 'CBO' },
                                    { id: 'colonial-penn', name: 'Colonial Penn' },
                                    { id: 'snlic', name: 'SNLIC' },
                                    { id: 'prosperity', name: 'Prosperity' },
                                    { id: 'gpm', name: 'GPM' },
                                    { id: 'great-western', name: 'Great Western' },
                                    { id: 'gwul', name: 'GWUL' },
                                    { id: 'other', name: 'Other' }
                                  ].map(carrier => (
                                    <SelectItem key={carrier.id} value={carrier.name}>
                                      {carrier.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Product Type</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Eagle Select"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="policy_number"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Policy Number</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="123456789"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthly_premium"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Monthly Premium</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e);
                                // Update AP based on monthly premium
                                const monthlyPremium = e.target.value;
                                if (monthlyPremium) {
                                  const ap = calculateAP(monthlyPremium);
                                  form.setValue('ap', ap);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ap"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Annual Premium</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                              className="auto-calculated"
                              readOnly
                            />
                          </FormControl>
                          <FormDescription>
                            Automatically calculated as 12 × Monthly Premium
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="policy_submit_date"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Submit Date</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Information Card */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                    </div>
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <div className="form-grid-2 gap-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Status</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Update policy_health based on status
                                if (value === 'Approved' || value === 'Live' || value === '1st Month Paid') {
                                  form.setValue('policy_health', 'Healthy');
                                } else if (value === 'Pending' || value === 'UW') {
                                  form.setValue('policy_health', 'In Process');
                                } else if (value === 'Cancelled' || value === 'Declined') {
                                  form.setValue('policy_health', 'Cancelled');
                                } else if (value === 'Not taken') {
                                  form.setValue('policy_health', 'Needs Attention');
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="UW">UW</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="1st Month Paid">1st Month Paid</SelectItem>
                                <SelectItem value="Live">Live</SelectItem>
                                <SelectItem value="Not taken">Not taken</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Declined">Declined</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="policy_health"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Policy Health</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value || 'Healthy'}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select health status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Healthy">Healthy</SelectItem>
                                <SelectItem value="In Process">In Process</SelectItem>
                                <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paid_status"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Payment Status</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending First Payment">Pending First Payment</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Late">Late</SelectItem>
                                <SelectItem value="Grace Period">Grace Period</SelectItem>
                                <SelectItem value="Lapsed">Lapsed</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Commission Information Card */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-green-100 p-2 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    Commission Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <div className="form-grid-2 gap-6">
                    <FormField
                      control={form.control}
                      name="split_percentage"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Manager Split Percentage</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="20"
                              {...field}
                              value={field.value || '20'}
                              onChange={(e) => {
                                field.onChange(e);
                                // Recalculate commission amount if monthly premium is set
                                const splitPercentage = parseFloat(e.target.value);
                                const monthlyPremium = form.getValues('monthly_premium');
                                if (monthlyPremium && !isNaN(splitPercentage)) {
                                  const commission = parseNumeric(monthlyPremium) * 9 * (splitPercentage / 100);
                                  form.setValue('commission_amount', commission);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage of the commission the manager receives
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="commission_amount"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Commission Amount</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Manager's commission amount based on split percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="commission_status"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Commission Status</FormLabel>
                          </div>
                          <FormControl>
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Partial">Partial</SelectItem>
                                <SelectItem value="Chargeback">Chargeback</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="commission_paid_date"
                      render={({ field }) => (
                        <FormItem className="form-field">
                          <div className="form-field-header">
                            <FormLabel>Commission Paid Date</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="form-field">
                        <div className="form-field-header">
                          <FormLabel>General Notes</FormLabel>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about this application"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes_for_pay"
                    render={({ field }) => (
                      <FormItem className="form-field mt-4">
                        <div className="form-field-header">
                          <FormLabel>Payment Notes</FormLabel>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about payment or commission"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card className="card animate-in rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden">
                <CardHeader className="card-header border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="card-title flex items-center gap-2 text-slate-800">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-sky-600" />
                    </div>
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content p-6">
                  <PaymentLegend />
                  
                  {applicationData && (
                    <PaymentGrid
                      applicationId={applicationData.id}
                      existingPayments={{
                        month_1: applicationData.month_1,
                        month_2: applicationData.month_2,
                        month_3: applicationData.month_3,
                        month_4: applicationData.month_4,
                        month_5: applicationData.month_5,
                        month_6: applicationData.month_6,
                        month_7: applicationData.month_7,
                        month_8: applicationData.month_8,
                        month_9: applicationData.month_9,
                        month_10: applicationData.month_10,
                        month_11: applicationData.month_11,
                        month_12: applicationData.month_12,
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
} 