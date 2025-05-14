'use client'

import { useState, useEffect, useRef } from 'react'
import { AgentApplication, PaymentStatus } from '@/types/application'
import { createClient } from '@/lib/supabase/client'
import { getPaymentIndicatorClass, getPaymentIndicatorTitle } from '../utils/statusUtils'
import '../components/status-styles.css'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'

// Define the type for payment data from database
interface PaymentData {
  month_number: number
  payment_status: PaymentStatus | null
  payment_date: string | null
  updated_at: string | null
}

// Single payment indicator component with improved error handling
export const PaymentIndicator = ({ 
  status, 
  monthNumber, 
  applicationId,
  paymentDate,
  onPaymentUpdated
}: { 
  status: PaymentStatus | null, 
  monthNumber: number, 
  applicationId: string,
  paymentDate?: string | null,
  onPaymentUpdated?: () => void
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    paymentDate ? new Date(paymentDate) : undefined
  );
  const isMounted = useRef(true);
  
  // Clear state and refs on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Use larger sizes and more visible styles for important indicators
  const getIndicatorClasses = () => {
    const baseClass = getPaymentIndicatorClass(status);
    const firstMonthClass = monthNumber === 1 ? 'first-month ' : '';
    const size = monthNumber === 1 ? 'w-4 h-4' : 'w-3 h-3';
    return `payment-indicator ${baseClass} ${firstMonthClass} ${size} ${isUpdating ? 'animate-pulse' : ''}`;
  };
  
  const indicatorClass = getIndicatorClasses();
  // Ensure all indicators have a meaningful tooltip, even empty ones
  const tooltipTitle = status 
    ? getPaymentIndicatorTitle(status, monthNumber, paymentDate)
    : `Month ${monthNumber}: Click to set payment status`;
  
  // Check if this is the first payment and it should be marked as paid
  useEffect(() => {
    let isActive = true; // Track whether this effect should still update state
    
    const checkFirstPayment = async () => {
      if (monthNumber === 1 && !status) {
        // Fetch the application details
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('agent_applications')
            .select('status, paid_status')
            .eq('id', applicationId)
            .single();
            
          if (error) throw error;
          
          // Only proceed if component is still mounted and effect is still active
          if (isMounted.current && isActive) {
            if (data && (data.status?.includes('Paid') || data.paid_status === 'Paid')) {
              // This should be marked as paid, so update it
              updatePaymentStatus('PAID');
            }
          }
        } catch (err) {
          console.error('Error checking first payment status:', err);
        }
      }
    };
    
    // Check if we need to mark as paid
    checkFirstPayment();
    
    // Cleanup function
    return () => {
      isActive = false; // Mark effect as inactive when unmounted
    };
  }, [monthNumber, status, applicationId]);
  
  const updatePaymentStatus = async (newStatus: PaymentStatus, date?: Date | null) => {
    if (!isMounted.current) return; // Don't proceed if unmounted
    
    setIsUpdating(true);
    try {
      const supabase = createClient();
      
      // Direct database update with fallback options
      const paymentDate = date || 
                          (newStatus === 'PAID' ? new Date() : null);
                          
      // First, try the application_payments table
      const { error: paymentError } = await supabase
        .from('application_payments')
        .upsert({
          application_id: applicationId,
          month_number: monthNumber,
          payment_status: newStatus,
          payment_date: paymentDate ? paymentDate.toISOString() : null,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'application_id,month_number' 
        });
        
      if (paymentError) {
        console.error('Failed to update payment record:', paymentError);
      }
      
      // Also update the legacy month field directly
      const monthField = `month_${monthNumber}`;
      const { error: appError } = await supabase
        .from('agent_applications')
        .update({ [monthField]: newStatus })
        .eq('id', applicationId);
        
      if (appError) {
        console.error('Failed to update month field:', appError);
      }
      
      // If this is the first month and marking as PAID, update paid_status
      if (monthNumber === 1 && newStatus === 'PAID') {
        await supabase
          .from('agent_applications')
          .update({ 
            paid_status: 'Paid',
            policy_health: 'Active'
          })
          .eq('id', applicationId);
      }
      
      if (isMounted.current) {
        toast.success(`Payment for month ${monthNumber} marked as ${newStatus}`);
        if (onPaymentUpdated) {
          onPaymentUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      if (isMounted.current) {
        toast.error('Failed to update payment status');
      }
    } finally {
      if (isMounted.current) {
        setIsUpdating(false);
        setShowPaymentMenu(false);
      }
    }
  };

  return (
    <ErrorBoundary>
      <Popover open={showPaymentMenu} onOpenChange={setShowPaymentMenu}>
        <PopoverTrigger asChild>
          <div 
            className={indicatorClass}
            title={tooltipTitle}
            style={{
              border: monthNumber === 1 ? '2px solid #666' : '1px solid #d0d0d0',
              boxShadow: status === 'PAID' ? '0 0 2px 1px rgba(19, 115, 51, 0.5)' : 'none',
              backgroundColor: status ? undefined : 'white', // Force white background for empty indicators
              opacity: 1 // Ensure full opacity at all times
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-72" style={{ backgroundColor: 'white', opacity: 1, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #d0d0d0' }}>
          <div className="space-y-4">
            <div className="font-medium">Month {monthNumber} Payment</div>
            
            {/* Date picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isUpdating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" style={{ backgroundColor: 'white', opacity: 1 }}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Payment status buttons */}
            <div className="grid grid-cols-2 gap-2">
              {isUpdating ? (
                <div className="col-span-2 flex justify-center items-center py-4">
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="bg-[#e6f4ea] text-[#137333] hover:bg-[#d3eedb] hover:text-[#137333]"
                    onClick={() => updatePaymentStatus('PAID', selectedDate)}
                    disabled={isUpdating}
                  >
                    Paid
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#fce8e6] text-[#c5221f] hover:bg-[#fadad7] hover:text-[#c5221f]"
                    onClick={() => updatePaymentStatus('MISSED', selectedDate)}
                    disabled={isUpdating}
                  >
                    Missed
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d4e2fc] hover:text-[#1a73e8]"
                    onClick={() => updatePaymentStatus('PENDING', selectedDate)}
                    disabled={isUpdating}
                  >
                    Pending
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#fef7e0] text-[#ea8600] hover:bg-[#fdf3d0] hover:text-[#ea8600]"
                    onClick={() => updatePaymentStatus('NSF', selectedDate)}
                    disabled={isUpdating}
                  >
                    NSF
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#f1f3f4] text-[#80868b] hover:bg-[#e4e6e8] hover:text-[#80868b]"
                    onClick={() => updatePaymentStatus('WAIVED', selectedDate)}
                    disabled={isUpdating}
                  >
                    Waived
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white text-gray-700 hover:bg-gray-100"
                    onClick={() => updatePaymentStatus(null, null)}
                    disabled={isUpdating}
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </ErrorBoundary>
  );
};

// Payment history grid component (12 months)
export const PaymentGrid = ({ 
  application,
  onPaymentUpdated
}: { 
  application: AgentApplication,
  onPaymentUpdated?: () => void
}) => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchPayments = async () => {
      if (!application?.id) return;
      
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('application_payments')
          .select('month_number, payment_status, payment_date, updated_at')
          .eq('application_id', application.id)
          .order('month_number');
          
        if (error) {
          throw error;
        }
        
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [application?.id]);
  
  // Custom refresh function for when payments are updated
  const refreshPayments = () => {
    if (onPaymentUpdated) {
      onPaymentUpdated();
    }
  };
  
  // Create an array of 12 months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Get payment status for a specific month
  const getMonthStatus = (month: number): PaymentStatus | null => {
    // First try to get from payments data
    const payment = payments.find(p => p.month_number === month);
    if (payment) {
      return payment.payment_status;
    }
    
    // Auto-set first month as paid if application status contains "Paid" or "paid_status" is "Paid"
    if (month === 1 && (
        application.status?.includes('Paid') || 
        application.paid_status === 'Paid' || 
        application.status === 'Live' ||
        application.status === 'Approved'
      )) {
      console.log(`Auto-marking month 1 as PAID for application with status=${application.status}, paid_status=${application.paid_status}`);
      return 'PAID';
    }
    
    // Fallback to month_X fields for backward compatibility
    const monthKey = `month_${month}` as keyof typeof application;
    return (application[monthKey] as PaymentStatus) || null;
  };
  
  // Get payment date for a specific month
  const getPaymentDate = (month: number): string | null => {
    // First check from payments data
    const payment = payments.find(p => p.month_number === month);
    if (payment && payment.payment_date) {
      return payment.payment_date;
    }
    
    // For first month, use effective_policy_date if it exists and month is paid
    if (month === 1 && getMonthStatus(month) === 'PAID' && application.effective_policy_date) {
      return application.effective_policy_date;
    }
    
    return null;
  };
  
  useEffect(() => {
    // Auto-update first payment if status is "Paid & Issued" or paid_status is "Paid"
    const autoUpdateFirstPayment = async () => {
      if (!application?.id) return;
      
      // Check if status qualifies for auto-marking first payment
      const shouldAutoMarkFirstPayment = (
        (application.status?.includes('Paid') || 
         application.paid_status === 'Paid' || 
         application.status === 'Live' ||
         application.status === 'Approved') && 
        !payments.some(p => p.month_number === 1 && p.payment_status === 'PAID')
      );
      
      if (shouldAutoMarkFirstPayment) {
        try {
          console.log(`Auto-updating first payment record for application ${application.id}`);
          const supabase = createClient();
          
          // First check if the RPC function exists
          const { data: rpcCheck, error: rpcCheckError } = await supabase.rpc(
            'update_payment_and_policy_health', 
            {
              p_application_id: application.id,
              p_month_number: 1,
              p_payment_status: 'PAID',
              p_payment_date: application.effective_policy_date || new Date().toISOString()
            },
            { count: 'exact' }
          );
          
          if (rpcCheckError) {
            console.error('Error checking RPC function:', rpcCheckError);
            // Fallback to direct insert if RPC is not available
            console.log('Falling back to direct insert into application_payments');
            
            // Check if payment record exists
            const { data: existingPayments } = await supabase
              .from('application_payments')
              .select('id')
              .eq('application_id', application.id)
              .eq('month_number', 1);
              
            if (!existingPayments || existingPayments.length === 0) {
              // Insert new payment record
              await supabase
                .from('application_payments')
                .insert({
                  application_id: application.id,
                  month_number: 1,
                  payment_status: 'PAID',
                  payment_date: application.effective_policy_date || new Date().toISOString()
                });
            } else {
              // Update existing payment record
              await supabase
                .from('application_payments')
                .update({
                  payment_status: 'PAID',
                  payment_date: application.effective_policy_date || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('application_id', application.id)
                .eq('month_number', 1);
            }
          }
          
          // Also update legacy month_1 field directly
          await supabase
            .from('agent_applications')
            .update({ month_1: 'PAID' })
            .eq('id', application.id);
            
          refreshPayments();
          console.log('First payment auto-updated successfully');
        } catch (error) {
          console.error('Error auto-updating first payment:', error);
        }
      }
    };
    
    autoUpdateFirstPayment();
  }, [application?.id, application?.status, application?.paid_status, payments]);
  
  return (
    <div className="payment-history-container">
      {loading ? (
        <div className="text-sm text-gray-500">Loading payment history...</div>
      ) : (
        <>
          {months.map(month => (
            <PaymentIndicator
              key={month}
              status={getMonthStatus(month)}
              monthNumber={month}
              applicationId={application.id}
              paymentDate={getPaymentDate(month)}
              onPaymentUpdated={refreshPayments}
            />
          ))}
        </>
      )}
    </div>
  );
};

// Payment Update Modal Component
export const PaymentUpdateModal = ({ 
  applicationId, 
  monthNumber, 
  currentStatus,
  currentPaymentDate,
  onClose 
}: { 
  applicationId: string, 
  monthNumber: number, 
  currentStatus: string,
  currentPaymentDate?: string | null,
  onClose: () => void 
}) => {
  const [status, setStatus] = useState(currentStatus || '');
  const [paymentDate, setPaymentDate] = useState(currentPaymentDate || '');
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  
  const handleSave = async () => {
    if (!status) {
      toast.error('Please select a payment status');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if payment record exists
      const { data: existingPayments, error: fetchError } = await supabase
        .from('application_payments')
        .select('*')
        .eq('application_id', applicationId)
        .eq('month_number', monthNumber);
        
      if (fetchError) throw fetchError;
      
      // If record exists, update it, otherwise insert new record
      if (existingPayments && existingPayments.length > 0) {
        const { error } = await supabase
          .from('application_payments')
          .update({
            payment_status: status,
            payment_date: status === 'PAID' ? paymentDate || null : null,
            updated_at: new Date().toISOString()
          })
          .eq('application_id', applicationId)
          .eq('month_number', monthNumber);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('application_payments')
          .insert({
            application_id: applicationId,
            month_number: monthNumber,
            payment_status: status,
            payment_date: status === 'PAID' ? paymentDate || null : null
          });
          
        if (error) throw error;
      }
      
      // Update policy health
      await updatePolicyHealth(applicationId);
      
      toast.success('Payment status updated');
      onClose();
    } catch (error) {
      console.error('Error saving payment status:', error);
      toast.error('Error saving payment status');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="payment-update-modal">
      <div className="payment-modal-content">
        <div className="payment-modal-header">
          <h3>Update Payment Status - Month {monthNumber}</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="payment-modal-body">
          <div className="form-group">
            <label htmlFor="payment-status">Payment Status</label>
            <select
              id="payment-status"
              className="payment-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="PAID">Paid</option>
              <option value="MISSED">Missed</option>
              <option value="PENDING">Pending</option>
              <option value="NSF">NSF (Insufficient Funds)</option>
              <option value="WAIVED">Waived</option>
            </select>
          </div>
          {status === 'PAID' && (
            <div className="form-group">
              <label htmlFor="payment-date">Payment Date</label>
              <input
                type="date"
                id="payment-date"
                className="payment-date-input"
                value={paymentDate || ''}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="payment-modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to update policy health based on payment statuses
async function updatePolicyHealth(applicationId: string) {
  const supabase = createClient();
  
  try {
    // Get all payments for this application
    const { data: payments, error: fetchError } = await supabase
      .from('application_payments')
      .select('*')
      .eq('application_id', applicationId);
      
    if (fetchError) throw fetchError;
    
    // Get application details
    const { data: applications, error: appError } = await supabase
      .from('agent_applications')
      .select('status, paid_status')
      .eq('id', applicationId);
      
    if (appError) throw appError;
    if (!applications || applications.length === 0) return;
    
    const app = applications[0];
    
    // Check if policy is already cancelled
    if (app.status?.includes('Cancelled') || app.status === 'Declined') {
      return; // Don't change cancelled policies
    }
    
    // Count missed payments
    const missedPayments = payments?.filter(p => 
      p.payment_status === 'MISSED' || p.payment_status === 'NSF'
    ).length || 0;
    
    // Determine new policy health
    let newPolicyHealth;
    
    if (missedPayments >= 2) {
      newPolicyHealth = 'Payment Issues';
    } else if (app.status === 'Approved' && app.paid_status === 'Paid') {
      newPolicyHealth = 'Active';
    } else if (app.status === 'Approved' && app.paid_status === 'Unpaid') {
      newPolicyHealth = 'Pending First Payment';
    } else {
      // Keep existing policy health
      return;
    }
    
    // Update policy health
    const { error: updateError } = await supabase
      .from('agent_applications')
      .update({ policy_health: newPolicyHealth })
      .eq('id', applicationId);
      
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating policy health:', error);
    throw error;
  }
}

// Payment status legend component
export const PaymentLegend = () => (
  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-paid"></div>
      <span>Paid</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-missed"></div>
      <span>Missed</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-pending"></div>
      <span>Pending</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-nsf"></div>
      <span>NSF</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-waived"></div>
      <span>Waived</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="payment-indicator payment-empty"></div>
      <span>Not Due</span>
    </div>
  </div>
);

// NEW: Create a wrapper component for the payment history grid
export const SafePaymentHistoryGrid = ({ applicationId }: { applicationId: string }) => {
  return (
    <ErrorBoundary>
      <PaymentHistoryGrid applicationId={applicationId} />
    </ErrorBoundary>
  );
};

// NEW: Payment history grid component for the applications table
export const PaymentHistoryGrid = ({ applicationId }: { applicationId: string }) => {
  const [payments, setPayments] = useState<Record<number, PaymentData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchController = useRef<AbortController | null>(null);
  
  // Use a stable key for rendering indicators
  const stableKey = useRef(`payment-grid-${applicationId}`).current;
  
  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    // Create new abort controller for this instance
    fetchController.current = new AbortController();

    // Only fetch if we have an application ID
    if (applicationId) {
      fetchPayments();
    }
    
    // Clean up function that runs when component unmounts
    return () => {
      // First abort any pending requests
      if (fetchController.current) {
        fetchController.current.abort();
      }
      
      // Then mark component as unmounted to prevent state updates
      isMounted.current = false;
      
      // Clear state
      setPayments({});
    };
  }, [applicationId]);
  
  const fetchPayments = async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get payments from the dedicated table
      const { data: paymentData, error: paymentError } = await supabase
        .from('application_payments')
        .select('*')
        .eq('application_id', applicationId)
        .order('month_number')
        .abortSignal(fetchController.current?.signal);
      
      if (paymentError) {
        if (paymentError.code === '20') {
          // This is an abort error, just return silently
          return;
        }
        
        console.error('Error fetching payments:', paymentError);
        if (isMounted.current) {
          setError('Failed to load payment data');
        }
        return;
      }
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Process the data into a record by month
        const paymentsByMonth: Record<number, PaymentData> = {};
        
        if (paymentData && paymentData.length > 0) {
          paymentData.forEach((payment) => {
            paymentsByMonth[payment.month_number] = payment;
          });
        }
        
        setPayments(paymentsByMonth);
      }
    } catch (error) {
      // Check if this is an AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, no need to update state
        return;
      }
      
      console.error('Error in fetchPayments:', error);
      if (isMounted.current) {
        setError('An unexpected error occurred');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const getMonthStatus = (month: number): PaymentStatus | null => {
    return payments[month]?.payment_status || null;
  };
  
  const getPaymentDate = (month: number): string | null => {
    return payments[month]?.payment_date || null;
  };
  
  const handlePaymentUpdated = () => {
    if (isMounted.current) {
      fetchPayments();
    }
  };
  
  // Create indicators for months 1-12 with careful key management
  const renderPaymentIndicators = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return months.map((month) => (
      <PaymentIndicator
        key={`${stableKey}-month-${month}`}
        status={getMonthStatus(month)}
        monthNumber={month}
        applicationId={applicationId}
        paymentDate={getPaymentDate(month)}
        onPaymentUpdated={handlePaymentUpdated}
      />
    ));
  };
  
  // Create a simpler display if loading is taking too long
  if (loading && !Object.keys(payments).length) {
    return (
      <div className="payment-history-container flex items-center justify-center">
        <div className="text-xs text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="payment-history-container">
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }
  
  // Render the actual component
  return (
    <div className="payment-history-container">
      {renderPaymentIndicators()}
    </div>
  );
};

// Payment history legend component
export const PaymentHistoryLegend = () => {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 mb-4">
      <span className="font-medium">Payment Legend:</span>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#137333] mr-1"></div>
        <span>Paid</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#1a73e8] mr-1"></div>
        <span>Pending</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#c5221f] mr-1"></div>
        <span>Missed</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#ea8600] mr-1"></div>
        <span>NSF</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-[#80868b] mr-1"></div>
        <span>Waived</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full border border-gray-300 mr-1"></div>
        <span>Not Set</span>
      </div>
    </div>
  );
}; 