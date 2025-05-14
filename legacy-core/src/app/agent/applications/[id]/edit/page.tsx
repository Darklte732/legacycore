'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import './styles.css'

import { Button } from '@/components/ui/button'
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
import { PaymentGrid, PaymentLegend } from '../../components/PaymentComponents'

// Form schema for validation
const formSchema = z.object({
  // Client Information
  proposed_insured: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  client_phone_number: z.string().min(10, "Valid phone number required"),
  client_state: z.string().min(1, "State is required"),
  
  // Policy Details
  month: z.string().optional(),
  policy_submit_date: z.string().optional(),
  policy_number: z.string().optional(),
  carrier: z.string().min(1, "Carrier is required"),
  product: z.string().min(1, "Policy type is required"),
  monthly_premium: z.union([z.string(), z.number()]),
  ap: z.union([z.string(), z.number()]).optional(),
  
  // Status Information
  status: z.string().min(1, "Status is required").refine(
    (val) => val.trim().length > 0, 
    { message: "Status cannot be empty" }
  ),
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

type FormValues = z.infer<typeof formSchema>

export default function EditApplicationPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { role, loading: roleLoading } = useRole()
  
  const [carriers, setCarriers] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null);

  // Define form
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
      split_percentage: '40',
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
        // Fetch carriers for the dropdown
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers')
          .select('id, name');
        
        if (carriersError) {
          console.error('Error fetching carriers:', carriersError);
          toast.error('Error loading carriers');
          setIsLoading(false);
          return;
        }
        
        console.log('Carriers loaded:', carriersData);
        setCarriers(carriersData || []);
        
        // Fetch the fresh application data directly from Supabase
        const { data, error } = await supabase
          .from('agent_applications')
          .select('*')
          .eq('id', applicationId)
          .single();
        
        if (error) {
          console.error('Error fetching application data:', error);
          toast.error('Error loading application data');
          setIsLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No application data found for ID:', applicationId);
          toast.error('Application data not found');
          setIsLoading(false);
          return;
        }
        
        console.log('Application data loaded:', JSON.stringify(data, null, 2));
        setApplicationData(data);
        
        // Build form values object with ALL possible fields from the database
        const formValues = {
          proposed_insured: data.proposed_insured || '',
          client_email: data.client_email || '',
          client_phone_number: data.client_phone_number || '',
          client_state: data.client_state || '',
          month: data.month || '',
          policy_submit_date: formatDateForInput(data.policy_submit_date),
          policy_number: data.policy_number || '',
          carrier: data.carrier || '',
          product: data.product || '',
          monthly_premium: data.monthly_premium?.toString() || '',
          ap: data.ap?.toString() || '',
          status: data.status || 'Pending',
          policy_health: data.policy_health || '',
          paid_status: data.paid_status || '',
          closed_by_agent: data.closed_by_agent || '',
          point_of_sale: data.point_of_sale || '',
          pms_form_filled_out: !!data.pms_form_filled_out,
          split_with: data.split_with || '',
          split_percentage: data.split_percentage?.toString() || '40',
          effective_policy_date: formatDateForInput(data.effective_policy_date),
          effective_policy_status: data.effective_policy_status || '',
          notes: data.notes || '',
          notes_for_pay: data.notes_for_pay || '',
          paid_split: data.paid_split || '',
          commission_status: data.commission_status || 'Pending',
          commission_paid_date: formatDateForInput(data.commission_paid_date),
          policy_payment_cycle: data.policy_payment_cycle || 'Initial',
          commission_amount: data.commission_amount?.toString() || '',
        };
        
        console.log('Setting form values with:', JSON.stringify(formValues, null, 2));
        
        // Reset the form with all values at once
        form.reset(formValues);
        console.log('Form values after reset:', form.getValues());
        
        // Update loading state
        setIsLoading(false);
      } catch (error) {
        console.error('Unexpected error fetching application:', error);
        toast.error('Failed to load application');
        setIsLoading(false);
      }
    }

    if (id) {
      fetchApplicationData();
    } else {
      console.error('No application ID provided');
      toast.error('No application ID provided');
      setIsLoading(false);
    }
  }, [id, supabase, form]);

  // Calculate AP from monthly premium (12 months)
  const calculateAP = (monthlyPremium: string | number): number => {
    const premium = typeof monthlyPremium === 'string' 
      ? parseFloat(monthlyPremium.replace(/[^0-9.-]+/g, '')) 
      : monthlyPremium;
      
    const annualValue = isNaN(premium) ? 0 : premium * 12;
    console.log(`Calculating AP: $${premium} × 12 = $${annualValue}`);
    return annualValue;
  };

  // Parse numeric value from string (handle currency formatting)
  const parseNumeric = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') {
      // Remove all non-numeric characters except decimal point
      const cleaned = value.replace(/[^0-9.-]+/g, '');
      return parseFloat(cleaned) || 0;
    }
    
    return typeof value === 'number' ? value : 0;
  };

  // Update the onSubmit function to properly handle status updates
  async function onSubmit(values: FormValues) {
    console.log('onSubmit called with values:', values);
    setIsSaving(true);
    
    try {
      // Validate required fields explicitly
      if (!values.proposed_insured?.trim()) {
        toast.error('Client name is required');
        setIsSaving(false);
        return;
      }
      
      if (!values.client_phone_number?.trim()) {
        toast.error('Client phone number is required');
        setIsSaving(false);
        return;
      }
      
      if (!values.carrier?.trim()) {
        toast.error('Carrier is required');
        setIsSaving(false);
        return;
      }
      
      if (!values.product?.trim()) {
        toast.error('Policy type is required');
        setIsSaving(false);
        return;
      }
      
      // Prepare values for Supabase - handle numeric fields
      const monthlyPremium = parseNumeric(values.monthly_premium);
      // Ensure AP is calculated correctly as monthly_premium * 12
      const calculatedAP = monthlyPremium * 12;
      
      console.log(`Calculating final AP for submission: $${monthlyPremium} monthly × 12 = $${calculatedAP} annual`);
      
      // Calculate commission based on monthly premium, 9-month advance, and split percentage
      const splitPercentage = values.split_percentage ? parseNumeric(values.split_percentage) : 40;
      const agentSplitRatio = (100 - splitPercentage) / 100; // Convert to decimal (e.g. 80% agent / 20% split)
      const calculatedCommission = monthlyPremium * 9 * agentSplitRatio;
      
      console.log(`Calculating commission: $${monthlyPremium} monthly × 9 × ${agentSplitRatio} = $${calculatedCommission}`);
      
      const dataToUpdate = {
        ...values,
        monthly_premium: monthlyPremium,
        ap: calculatedAP, // Always use the calculated AP value
        commission_amount: values.commission_amount ? parseNumeric(values.commission_amount) : calculatedCommission,
        split_percentage: splitPercentage, // Add split percentage to update data
        client_email: values.client_email || null // Handle empty email
      };
      
      console.log('Submitting data:', dataToUpdate);
      
      // Update application in the database
      const { data, error } = await supabase
        .from('agent_applications')
        .update(dataToUpdate)
        .eq('id', Array.isArray(id) ? id[0] : id)
        .select();
      
      if (error) {
        console.error('Update error:', error);
        toast.error('Failed to update application');
        return;
      }
      
      // If paid_status is 'Paid', also update the month_1 field and create payment record
      if (values.paid_status === 'Paid') {
        try {
          // Update month_1 field
          await supabase
            .from('agent_applications')
            .update({ month_1: 'PAID' })
            .eq('id', Array.isArray(id) ? id[0] : id);
            
          // Create or update payment record
          const applicationId = Array.isArray(id) ? id[0] : id;
          const effectiveDate = values.effective_policy_date || new Date().toISOString();
          
          const { error: paymentError } = await supabase
            .from('application_payments')
            .upsert({
              application_id: applicationId,
              month_number: 1,
              payment_status: 'PAID',
              payment_date: effectiveDate,
              updated_at: new Date().toISOString()
            }, { onConflict: 'application_id,month_number' });
            
          if (paymentError) {
            console.error('Error updating payment record:', paymentError);
          }
        } catch (paymentUpdateError) {
          console.error('Error updating payment status:', paymentUpdateError);
        }
      }
      
        toast.success('Application updated successfully');
      console.log('Update successful:', data);
        
      // Redirect to applications list on success
      router.push('/agent/applications');
    } catch (error) {
      console.error('Direct update error:', error);
      toast.error('An error occurred while updating the application');
    } finally {
      setIsSaving(false);
    }
  }

  // Policy types for dropdown
  const policyTypes = [
    'Term Life',
    'Whole Life',
    'Universal Life',
    'Final Expense',
    'Indexed Universal Life',
    'Medicare Supplement',
    'Medicare Advantage',
    'Annuity',
    'Other'
  ]

  // Policy statuses for dropdown
  const policyStatuses = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'UW', label: 'UW' },
    { value: 'Declined', label: 'Declined' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Cancellation in Progress', label: 'Cancellation in Progress' },
    { value: 'Live', label: 'Live' },
    { value: '1st Month Paid', label: '1st Month Paid' },
    { value: 'Hold', label: 'Hold' },
    { value: 'Review', label: 'Review' },
    { value: 'Postponed', label: 'Postponed' },
  ];
  
  // Policy health statuses for dropdown
  const policyHealthStatuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending First Payment', label: 'Pending First Payment' },
    { value: 'Payment Issues', label: 'Payment Issues' },
    { value: 'Needs Attention', label: 'Needs Attention' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  // Paid statuses for dropdown
  const paidStatuses = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Pending', label: 'Pending' },
  ];
  
  // Commission status options
  const commissionStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Not Applicable', label: 'Not Applicable' },
    { value: 'Partial', label: 'Partial' },
  ];
  
  // Payment cycle options
  const paymentCycleOptions = [
    { value: 'Initial', label: 'Initial' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Semi-Annual', label: 'Semi-Annual' },
    { value: 'Annual', label: 'Annual' },
  ];

  // States for dropdown
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  const refetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Refetching application data after update');
      
      const applicationId = Array.isArray(id) ? id[0] : id;
      const { data, error } = await supabase
        .from('agent_applications')
        .select('*')
        .eq('id', applicationId)
        .single();
      
      if (error) {
        console.error('Error refetching application data:', error);
        toast.error('Failed to refresh application data');
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log('Refreshed application data:', data);
        setApplicationData(data);
        
        // Update form values with fresh data
        const formValues = {
          proposed_insured: data.proposed_insured || '',
          client_email: data.client_email || '',
          client_phone_number: data.client_phone_number || '',
          client_state: data.client_state || '',
          month: data.month || '',
          policy_submit_date: formatDateForInput(data.policy_submit_date),
          policy_number: data.policy_number || '',
          carrier: data.carrier || '',
          product: data.product || '',
          monthly_premium: data.monthly_premium?.toString() || '',
          ap: data.ap?.toString() || '',
          status: data.status || 'Pending',
          policy_health: data.policy_health || '',
          paid_status: data.paid_status || '',
          closed_by_agent: data.closed_by_agent || '',
          point_of_sale: data.point_of_sale || '',
          pms_form_filled_out: !!data.pms_form_filled_out,
          split_with: data.split_with || '',
          split_percentage: data.split_percentage?.toString() || '20',
          effective_policy_date: formatDateForInput(data.effective_policy_date),
          effective_policy_status: data.effective_policy_status || '',
          notes: data.notes || '',
          notes_for_pay: data.notes_for_pay || '',
          paid_split: data.paid_split || '',
          commission_status: data.commission_status || 'Pending',
          commission_paid_date: formatDateForInput(data.commission_paid_date),
          policy_payment_cycle: data.policy_payment_cycle || 'Initial',
          commission_amount: data.commission_amount?.toString() || '',
        };
        
        form.reset(formValues);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in refetchData:', error);
      toast.error('Failed to refresh data');
      setIsLoading(false);
    }
  };

  // Function to directly update policy health
  const updatePolicyHealth = async (policyHealth: string) => {
    try {
      const supabase = createClient();
      
      // Make multiple attempts to update policy health
      let success = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 3;
      
      while (!success && attempts < MAX_ATTEMPTS) {
        attempts++;
        console.log(`Updating policy health to "${policyHealth}" (attempt ${attempts})`);
        
        // Try the dedicated RPC function first
        const { data, error } = await supabase.rpc(
          'force_update_policy_health',
          {
            p_application_id: Array.isArray(id) ? id[0] : id,
            p_policy_health: policyHealth
          }
        );
        
        if (error) {
          console.error(`RPC error on attempt ${attempts}:`, error);
          
          if (attempts === MAX_ATTEMPTS) {
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 300 * attempts));
          continue;
        }
        
        // Update succeeded
        success = true;
      }
      
      if (!success) {
        throw new Error("Failed to update policy health after multiple attempts");
      }
      
      // Update the form and local state
      form.setValue('policy_health', policyHealth);
      if (applicationData) {
        setApplicationData({
          ...applicationData,
          policy_health: policyHealth
        });
      }
      
      toast.success(`Policy health updated to ${policyHealth}`);
      
      // Refresh data to ensure UI is in sync
      await refetchData();
      
      return true;
    } catch (error) {
      console.error('Error updating policy health:', error);
      toast.error('Failed to update policy health: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  // Effective policy status options
  const effectivePolicyStatusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Expired', label: 'Expired' },
  ];

  return (
    <div className="edit-application-form">
      <Button
         variant="ghost"
         onClick={() => router.back()}
        className="back-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back
      </Button>
      
      <h1 className="page-title animate-in">Edit Application</h1>
      <p className="page-subtitle">Update the application information</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <Card className="card animate-in">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="form-grid form-grid-2">
                <FormField
                  control={form.control}
                  name="proposed_insured"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel>Client Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
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
                      <FormLabel>Client Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email Address" {...field} />
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
                      <FormLabel>Client Phone*</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
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
                      <FormLabel>State*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card className="card animate-in" style={{animationDelay: "50ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                Policy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="form-grid form-grid-2">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input placeholder="Month (e.g., Jan 2023)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="policy_submit_date"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel>Policy Submit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="policy_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Policy Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select carrier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carriers.map(carrier => (
                            <SelectItem key={carrier.id} value={carrier.name}>{carrier.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Type*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {policyTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthly_premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Premium</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="$0.00" 
                          value={field.value || ""} 
                          onChange={(e) => {
                            // Ensure numeric input only
                            const value = e.target.value.replace(/[^0-9.-]/g, '');
                            field.onChange(value);
                            
                            // Immediately calculate AP (Annual Premium = monthly premium × 12)
                            const monthlyValue = parseFloat(value) || 0;
                            const apValue = monthlyValue * 12;
                            console.log(`Monthly premium changed to: $${monthlyValue}, calculating AP: $${monthlyValue} × 12 = $${apValue}`);
                            
                            // Update AP field
                            form.setValue('ap', apValue.toString());
                            
                            // Also update commission amount - now using 9 months instead of 12
                            // Use split_percentage if available, otherwise default to 50%
                            const splitPercentage = form.getValues('split_percentage') || 40;
                            const agentSplitRatio = (100 - splitPercentage) / 100; // Convert to decimal (e.g. 80% agent / 20% split)
                            const commission = monthlyValue * 9 * agentSplitRatio;
                            form.setValue('commission_amount', commission.toString());
                            console.log(`Commission calculated as: $${monthlyValue} × 9 × ${agentSplitRatio} = $${commission}`);
                          }}
                          onBlur={() => {
                            // Recalculate on blur to ensure accuracy
                            const value = field.value;
                            if (value) {
                              const monthlyValue = parseFloat(value.toString()) || 0;
                              const apValue = monthlyValue * 12;
                              form.setValue('ap', apValue.toString());
                            }
                          }}
                          className="bg-white focus:border-blue-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter monthly premium amount - AP will auto-calculate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Annual Premium (12-month)
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">auto-calculated</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="$0.00" 
                          {...field}
                          className="bg-gray-50 border-gray-300" 
                        />
                      </FormControl>
                      <FormDescription className="text-blue-600">
                        Calculated as monthly premium × 12
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Status Information */}
          <Card className="card animate-in" style={{animationDelay: "100ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="form-grid form-grid-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {policyStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="policy_health"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Health</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          updatePolicyHealth(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy health" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {policyHealthStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paid_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select paid status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paidStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="closed_by_agent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closed By Agent</FormLabel>
                      <FormControl>
                        <Input placeholder="Agent Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="effective_policy_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Policy Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="effective_policy_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Policy Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                      <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                      </FormControl>
                        <SelectContent>
                          {effectivePolicyStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Payment History */}
          <Card className="card animate-in" style={{animationDelay: "150ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-4">
                <PaymentLegend />
                {applicationData && (
                  <PaymentGrid
                    application={applicationData}
                    onPaymentUpdated={refetchData}
                  />
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Click on any payment indicator to update its status. Changes will be reflected immediately 
                  and may update the Policy Health status automatically.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <Card className="card animate-in" style={{animationDelay: "200ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="form-grid form-grid-2">
                <FormField
                  control={form.control}
                  name="point_of_sale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Point of Sale</FormLabel>
                      <FormControl>
                        <Input placeholder="Point of Sale" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="split_with"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Split With</FormLabel>
                      <FormControl>
                        <Input placeholder="Agent Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="split_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Split Percentage</FormLabel>
                      <Select
                        value={field.value?.toString() || "20"}
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          
                          // Recalculate commission amount when split changes
                          const monthlyPremium = parseFloat(form.getValues('monthly_premium')) || 0;
                          const splitPercentage = parseInt(value);
                          const agentSplitRatio = (100 - splitPercentage) / 100;
                          const commission = monthlyPremium * 9 * agentSplitRatio;
                          form.setValue('commission_amount', commission.toString());
                          console.log(`Commission recalculated: $${monthlyPremium} × 9 × ${agentSplitRatio} = $${commission}`);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select split percentage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5% (You keep 95%)</SelectItem>
                          <SelectItem value="10">10% (You keep 90%)</SelectItem>
                          <SelectItem value="15">15% (You keep 85%)</SelectItem>
                          <SelectItem value="20">20% (You keep 80%)</SelectItem>
                          <SelectItem value="25">25% (You keep 75%)</SelectItem>
                          <SelectItem value="30">30% (You keep 70%)</SelectItem>
                          <SelectItem value="35">35% (You keep 65%)</SelectItem>
                          <SelectItem value="40">40% (You keep 60%)</SelectItem>
                          <SelectItem value="45">45% (You keep 55%)</SelectItem>
                          <SelectItem value="50">50% (You keep 50%)</SelectItem>
                          <SelectItem value="55">55% (You keep 45%)</SelectItem>
                          <SelectItem value="60">60% (You keep 40%)</SelectItem>
                          <SelectItem value="65">65% (You keep 35%)</SelectItem>
                          <SelectItem value="70">70% (You keep 30%)</SelectItem>
                          <SelectItem value="75">75% (You keep 25%)</SelectItem>
                          <SelectItem value="80">80% (You keep 20%)</SelectItem>
                          <SelectItem value="85">85% (You keep 15%)</SelectItem>
                          <SelectItem value="90">90% (You keep 10%)</SelectItem>
                          <SelectItem value="95">95% (You keep 5%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Percentage that goes to the split agent. The rest goes to you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paid_split"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Split</FormLabel>
                      <FormControl>
                        <Input placeholder="Split Details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pms_form_filled_out"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>PMS Form Filled Out</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Commission Information */}
          <Card className="card animate-in" style={{animationDelay: "250ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Commission Information
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="form-grid form-grid-2">
                <FormField
                  control={form.control}
                  name="commission_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Status</FormLabel>
                      <Select
                        value={field.value || 'Pending'}
                        onValueChange={(value) => {
                          console.log('Commission status changed to:', value);
                          field.onChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select commission status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commissionStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commission_paid_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Paid Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commission_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Amount</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="$0.00" 
                          value={field.value || "0"} 
                          onChange={(e) => {
                            // Ensure numeric input only
                            const value = e.target.value.replace(/[^\d.-]/g, '');
                            field.onChange(value);
                            console.log('Commission amount changed to:', value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated as: Monthly Premium × 9 × (Your Split Percentage)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="policy_payment_cycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Cycle</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment cycle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentCycleOptions.map(cycle => (
                            <SelectItem key={cycle.value} value={cycle.value}>{cycle.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          <Card className="card animate-in" style={{animationDelay: "300ms"}}>
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General notes about this application"
                          className="min-h-[100px]"
                          {...field}
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
                    <FormItem>
                      <FormLabel>Notes for Pay</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes related to payment"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
              className="outline"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={isSaving}
              className="primary"
              onClick={async () => {
                try {
                  console.log('Direct database update initiated');
                  setIsSaving(true);
                  
                  // Get the application ID from params
                  const applicationId = Array.isArray(id) ? id[0] : id;
                  console.log('Application ID for direct update:', applicationId);
                  
                  // Get current form values
                  const formValues = form.getValues();
                  console.log('Form values for direct update:', formValues);
                  
                  // Parse numeric values properly
                  const parseNumeric = (value: string | number | undefined | null): number | null => {
                    if (value === undefined || value === null || value === '') return null;
                    const parsed = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
                    return isNaN(parsed) ? null : parsed;
                  };
                  
                  // Special handling for policy health updates - use the dedicated RPC function
                  if (formValues.policy_health && formValues.policy_health !== applicationData?.policy_health) {
                    console.log(`Policy health changing from ${applicationData?.policy_health} to ${formValues.policy_health}`);
                    try {
                      const policyHealthResult = await supabase.rpc(
                        'force_update_policy_health',
                        {
                          p_application_id: applicationId,
                          p_policy_health: formValues.policy_health
                        }
                      );
                      
                      if (policyHealthResult.error) {
                        console.error('Error updating policy health with RPC:', policyHealthResult.error);
                        toast.error(`Failed to update policy health: ${policyHealthResult.error.message}`);
                      } else {
                        console.log('Policy health updated successfully with RPC');
                        // Update our local state to reflect the change
                        if (applicationData) {
                          setApplicationData({
                            ...applicationData,
                            policy_health: formValues.policy_health
                          });
                        }
                      }
                    } catch (policyHealthError) {
                      console.error('Exception updating policy health:', policyHealthError);
                    }
                  }
                  
                  // Calculate AP from monthly premium (12-month)
                  const monthlyPremium = parseNumeric(formValues.monthly_premium) || 0;
                  const calculatedAP = monthlyPremium * 12;
                  
                  console.log(`Direct update AP calculation: $${monthlyPremium} × 12 = $${calculatedAP}`);
                  
                  // Calculate commission based on 9-month annualized premium * split percentage
                  const splitPercentage = parseNumeric(formValues.split_percentage) || 40;
                  const commissionMultiplier = splitPercentage / 100; // Convert percentage to decimal
                  const calculatedCommission = monthlyPremium * 9 * commissionMultiplier;
                  
                  console.log(`Commission calculation: $${monthlyPremium} × 9 × ${commissionMultiplier} = $${calculatedCommission}`);
                  
                  // Validate commission_status before creating update data
                  const validCommissionStatuses = ['Pending', 'Partial', 'Paid', 'Not Applicable'];
                  if (formValues.commission_status && !validCommissionStatuses.includes(formValues.commission_status)) {
                    toast.error(`Invalid commission status: ${formValues.commission_status}. Must be one of: ${validCommissionStatuses.join(', ')}`);
                    setIsSaving(false);
                    return;
                  }
                  
                  // Build update data object with all form fields
                  const updateData = {
                    // Client Information
                    proposed_insured: formValues.proposed_insured?.trim(),
                    client_email: formValues.client_email?.trim() || null,
                    client_phone_number: formValues.client_phone_number?.trim(),
                    client_state: formValues.client_state,
                    
                    // Policy Details
                    month: formValues.month?.trim(),
                    policy_submit_date: formValues.policy_submit_date || null,
                    policy_number: formValues.policy_number?.trim() || null,
                    carrier: formValues.carrier?.trim(),
                    product: formValues.product?.trim(),
                    monthly_premium: parseNumeric(formValues.monthly_premium),
                    ap: calculatedAP,
                    
                    // Status Information
                    status: formValues.status?.trim(),
                    policy_health: formValues.policy_health?.trim() || null,
                    paid_status: formValues.paid_status?.trim() || null,
                    
                    // Additional Information
                    closed_by_agent: formValues.closed_by_agent?.trim() || null,
                    point_of_sale: formValues.point_of_sale?.trim() || null,
                    pms_form_filled_out: !!formValues.pms_form_filled_out,
                    split_with: formValues.split_with?.trim() || null,
                    split_percentage: splitPercentage,
                    effective_policy_date: formValues.effective_policy_date || null,
                    effective_policy_status: formValues.effective_policy_status?.trim() || null,
                    
                    // Notes & Commission Information
                    notes: formValues.notes?.trim() || null,
                    notes_for_pay: formValues.notes_for_pay?.trim() || null,
                    paid_split: formValues.paid_split?.trim() || null,
                    commission_status: formValues.commission_status || 'Pending',
                    commission_paid_date: formValues.commission_paid_date || null,
                    policy_payment_cycle: formValues.policy_payment_cycle || 'Initial',
                    commission_amount: formValues.commission_amount ? parseNumeric(formValues.commission_amount) : calculatedCommission,
                    
                    // Payment fields - preserve existing values to avoid overwriting payment indicators
                    month_1: applicationData?.month_1 || null,
                    month_2: applicationData?.month_2 || null,
                    month_3: applicationData?.month_3 || null,
                    month_4: applicationData?.month_4 || null,
                    month_5: applicationData?.month_5 || null,
                    month_6: applicationData?.month_6 || null,
                    month_7: applicationData?.month_7 || null,
                    month_8: applicationData?.month_8 || null,
                    month_9: applicationData?.month_9 || null,
                    month_10: applicationData?.month_10 || null,
                    month_11: applicationData?.month_11 || null,
                    month_12: applicationData?.month_12 || null,
                    
                    // Metadata
                    updated_at: new Date().toISOString()
                  };
                  
                  // Get session info to include agent_id if available
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session?.user?.id) {
                    updateData.agent_id = session.user.id;
                  }
                  
                  console.log('Complete update data:', updateData);
                  
                  // Make multiple attempts to update if needed
                  let updateSuccess = false;
                  let updateAttempts = 0;
                  const MAX_ATTEMPTS = 3;
                  
                  while (!updateSuccess && updateAttempts < MAX_ATTEMPTS) {
                    updateAttempts++;
                    
                    try {
                      // Directly update the database
                      const { data, error } = await supabase
                        .from('agent_applications')
                        .update(updateData)
                        .eq('id', applicationId)
                        .select();
                      
                      if (error) {
                        console.error(`Direct update error (attempt ${updateAttempts}):`, error);
                        
                        // Handle specific constraint errors with clear messages
                        if (error.code === '23514' && error.message.includes('commission_status_check')) {
                          toast.error('Invalid Commission Status: Please select from Pending, Partial, Paid, or Not Applicable');
                        } else {
                          toast.error(`Failed to update: ${error.message}`);
                        }
                        
                        // Wait a bit before retrying
                        if (updateAttempts < MAX_ATTEMPTS) {
                          await new Promise(resolve => setTimeout(resolve, 500 * updateAttempts));
                          continue;
                        } else {
                          setIsSaving(false);
                          return;
                        }
                      }
                      
                      // If data is empty or undefined, the update might not have worked
                      if (!data || data.length === 0) {
                        console.error('Update successful but no data returned - update may not have been applied');
                        
                        // Check if the update actually happened before showing error
                        const { data: verifyData } = await supabase
                          .from('agent_applications')
                          .select('updated_at')
                          .eq('id', applicationId)
                          .single();
                          
                        if (verifyData && new Date(verifyData.updated_at) > new Date(applicationData?.updated_at || 0)) {
                          console.log('Update verified through timestamp check');
                          updateSuccess = true;
                        } else {
                          toast.error('Update may not have been saved. Please check and try again.');
                          if (updateAttempts < MAX_ATTEMPTS) {
                            await new Promise(resolve => setTimeout(resolve, 500 * updateAttempts));
                            continue;
                          } else {
                            setIsSaving(false);
                            return;
                          }
                        }
                      } else {
                        console.log(`Direct update successful on attempt ${updateAttempts}! Updated data:`, data);
                        updateSuccess = true;
                      }
                    } catch (updateError) {
                      console.error(`Update error (attempt ${updateAttempts}):`, updateError);
                      if (updateAttempts >= MAX_ATTEMPTS) {
                        toast.error('Failed after multiple attempts. Please try again later.');
                        setIsSaving(false);
                        return;
                      }
                      await new Promise(resolve => setTimeout(resolve, 500 * updateAttempts));
                    }
                  }
                  
                  // Force a delay to ensure the update is processed before redirecting
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Verify the update by fetching the latest data
                  try {
                    const { data: verifyData, error: verifyError } = await supabase
                      .from('agent_applications')
                      .select('*')
                      .eq('id', applicationId)
                      .single();
                    
                    if (verifyError) {
                      console.error('Verification error:', verifyError);
                    } else {
                      console.log('Verification data:', verifyData);
                      // Check if key fields were updated correctly
                      if (verifyData.policy_health !== updateData.policy_health || 
                          verifyData.status !== updateData.status ||
                          verifyData.paid_status !== updateData.paid_status) {
                        console.warn('Verification shows different values than what was submitted!');
                        console.warn('Expected vs actual:', {
                          policy_health: { expected: updateData.policy_health, actual: verifyData.policy_health },
                          status: { expected: updateData.status, actual: verifyData.status },
                          paid_status: { expected: updateData.paid_status, actual: verifyData.paid_status }
                        });
                        
                        // Make one last attempt to update critical fields with dedicated calls
                        if (verifyData.policy_health !== updateData.policy_health) {
                          await supabase.rpc('force_update_policy_health', {
                            p_application_id: applicationId,
                            p_policy_health: updateData.policy_health
                          });
                        }
                      } else {
                        console.log('Verification successful - changes were applied correctly');
                      }
                    }
                  } catch (verifyError) {
                    console.error('Error verifying update:', verifyError);
                  }
                  
                  toast.success('Application updated successfully');
                  await refetchData();
                  setIsSaving(false);
                  
                  // Navigate back to the applications list page instead of detail view
                  router.push('/agent/applications');
                } catch (error) {
                  console.error('Error saving application:', error);
                  toast.error('An error occurred while saving the application');
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="loading-spinner"></div>
                  Saving...
                </div>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 