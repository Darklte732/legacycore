'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
    // Make all indicators consistently small
    const size = 'w-3 h-3';
    return `payment-indicator ${baseClass} ${firstMonthClass} ${size} ${isUpdating ? 'animate-pulse' : ''}`;
  };
  
  const indicatorClass = getIndicatorClasses();
  // Ensure all indicators have a meaningful tooltip with payment dates
  const tooltipTitle = !status 
    ? `Month ${monthNumber}: Click to set payment status`
    : paymentDate 
      ? `Month ${monthNumber}: ${status} (${new Date(paymentDate).toLocaleDateString()})`
      : `Month ${monthNumber}: ${status}`;
  
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
            .select('status, paid_status, effective_policy_date')
            .eq('id', applicationId)
            .single();
            
          if (error) throw error;
          
          // Only proceed if component is still mounted and effect is still active
          if (isMounted.current && isActive) {
            // MUCH stricter check - only mark as paid if explicitly paid_status='Paid'
            if (data && 
                data.paid_status === 'Paid' && 
                data.effective_policy_date !== null) {
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
      
      // Use the payment date logic
      const paymentDate = date || 
                          (newStatus === 'PAID' ? new Date() : null);
      
      // Get current application state first to ensure we're working with the latest data
      const { data: appData, error: appError } = await supabase
        .from('agent_applications')
        .select('effective_policy_date, status, paid_status, month_1')
        .eq('id', applicationId)
        .single();
        
      if (appError) {
        console.error('Failed to get application data:', appError);
        if (isMounted.current) {
          toast.error('Error retrieving application data');
        }
        return;
      }
      
      // Synchronize the paid_status for Month 1 changes
      let shouldUpdatePaidStatus = false;
      let newPaidStatus: string | null = null;
      
      if (monthNumber === 1) {
        if (newStatus === 'PAID') {
          // If first month is being marked as PAID, update paid_status to "Paid"
          shouldUpdatePaidStatus = true;
          newPaidStatus = 'Paid';
        } else if (newStatus === null || newStatus === 'MISSED' || newStatus === 'NSF') {
          // If first month is being marked as unpaid/missed, update paid_status to "Unpaid"
          shouldUpdatePaidStatus = true;
          newPaidStatus = 'Unpaid';
        }
      }
      
      // Use our track_payment RPC function with the synchronization info
      const { data: trackResult, error: trackError } = await supabase.rpc(
        'track_payment',
        { 
          p_application_id: applicationId,
          p_month_number: monthNumber,
          p_payment_status: newStatus,
          p_payment_date: paymentDate ? paymentDate.toISOString() : null,
          p_update_paid_status: shouldUpdatePaidStatus,
          p_new_paid_status: newPaidStatus
        }
      );
      
      if (trackError) {
        console.error('Payment tracking failed:', trackError);
        
        // Fall back to manual synchronization
        await manualSyncPaymentStatus(supabase, newStatus, paymentDate, shouldUpdatePaidStatus, newPaidStatus);
      } else {
        // Check if the tracking was successful
        if (trackResult && trackResult.success) {
          console.log('Payment tracking successful:', trackResult.message);
          
          // If we have a next payment scheduled, log it
          if (trackResult.next_payment) {
            console.log('Next payment scheduled:', trackResult.next_payment);
          }
          
          if (isMounted.current) {
            toast.success(trackResult.message || `Payment for month ${monthNumber} marked as ${newStatus || 'cleared'}`);
            if (onPaymentUpdated) {
              onPaymentUpdated();
            }
          }
        } else {
          // RPC succeeded but returned an error message
          const errorMsg = trackResult?.message || 'Payment update failed';
          console.error('Payment tracking returned error:', errorMsg);
          
          if (isMounted.current) {
            toast.error(errorMsg);
          }
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
  
  // Manual synchronization when the RPC function fails
  const manualSyncPaymentStatus = async (
    supabase: any, 
    newStatus: PaymentStatus, 
    paymentDate: Date | null,
    shouldUpdatePaidStatus: boolean,
    newPaidStatus: string | null
  ) => {
    console.log('Performing manual payment synchronization...');
    
    try {
      // Update both tables for consistency
      // 1. Update agent_applications table
      const monthField = `month_${monthNumber}`;
      let updateFields: any = { [monthField]: newStatus };
      
      // If we need to update paid_status as well
      if (shouldUpdatePaidStatus && newPaidStatus) {
        updateFields.paid_status = newPaidStatus;
        
        // If marking as paid, also update policy health
        if (newPaidStatus === 'Paid') {
          updateFields.policy_health = 'Active';
        } else if (newPaidStatus === 'Unpaid') {
          updateFields.policy_health = 'Pending First Payment';
        }
      }
      
      const { error: appError } = await supabase
        .from('agent_applications')
        .update(updateFields)
        .eq('id', applicationId);
        
      if (appError) {
        throw new Error(`Failed to update agent_applications: ${appError.message}`);
      }
      
      // 2. Update application_payments table
      try {
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
          console.error('Failed to update application_payments (non-critical):', paymentError);
        }
      } catch (paymentErr) {
        console.error('Error updating application_payments (continuing):', paymentErr);
      }
      
      // 3. If this was a PAID update, schedule the next payment
      if (newStatus === 'PAID' && monthNumber < 12) {
        const nextMonth = monthNumber + 1;
        const nextDate = paymentDate ? new Date(paymentDate) : new Date();
        nextDate.setDate(nextDate.getDate() + 30); // Add 30 days
        
        try {
          // Update next month in agent_applications
          await supabase
            .from('agent_applications')
            .update({ [`month_${nextMonth}`]: 'PENDING' })
            .eq('id', applicationId);
            
          // Add pending payment for next month
          await supabase
            .from('application_payments')
            .upsert({
              application_id: applicationId,
              month_number: nextMonth,
              payment_status: 'PENDING',
              payment_date: nextDate.toISOString(),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'application_id,month_number' 
            });
        } catch (nextError) {
          console.error('Error scheduling next payment (non-critical):', nextError);
        }
      }
      
      if (isMounted.current) {
        toast.success(`Payment for month ${monthNumber} marked as ${newStatus || 'cleared'}`);
        if (onPaymentUpdated) {
          onPaymentUpdated();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      if (isMounted.current) {
        toast.error(`Failed to update payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return false;
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
          console.error('Error fetching payments:', error);
          // Don't show error toast for permission issues
          if (!error.message.includes('permission') && !error.message.includes('must be owner')) {
            toast.error('Failed to load payment history');
          }
          // Continue without data - we'll fallback to application month fields
        } else {
          setPayments(data || []);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Don't show error toast to avoid overwhelming the user
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
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowPayments, setShouldShowPayments] = useState(false);
  const [nextPaymentDates, setNextPaymentDates] = useState<{[key: number]: string}>({});
  const isMounted = useRef(true);
  
  // Use a stable key for rendering indicators
  const stableKey = useRef(`payment-grid-${applicationId}`).current;
  
  // Memoize the fetch functions to use in dependencies
  const fetchApplicationDetails = useCallback(async () => {
    if (!applicationId || !isMounted.current) return;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agent_applications')
        .select('effective_policy_date, status, paid_status, month_1')
        .eq('id', applicationId)
        .single();
        
      if (error) {
        console.error('Error fetching application details:', error);
        return;
      }
      
      if (data && isMounted.current) {
        // Check if paid_status changed and needs to be reflected in UI
        const paidStatusChanged = application?.paid_status !== data.paid_status;
        
        setApplication(data);
        
        // MUCH STRICTER check - Only show payment history for applications explicitly marked as paid
        const isIssuedAndPaid = 
          data.paid_status === 'Paid' && 
          data.effective_policy_date !== null;
        
        setShouldShowPayments(isIssuedAndPaid);
        
        // If paid_status changed, refresh payment data
        if (paidStatusChanged) {
          console.log('Paid status changed, refreshing payment data...');
          fetchPayments();
        }
      }
    } catch (error) {
      console.error('Error in fetchApplicationDetails:', error);
    }
  }, [applicationId, application?.paid_status]);
  
  const fetchPayments = useCallback(async () => {
    if (!applicationId || !isMounted.current) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('application_payments')
        .select('month_number, payment_status, payment_date, updated_at')
        .eq('application_id', applicationId)
        .order('month_number');
        
      if (error) {
        // Still log the error but don't show to user
        console.error('Error fetching payments:', error);
      } else if (data && isMounted.current) {
        setPayments(data);
        
        // Extract and track next payment dates
        const paymentDates: {[key: number]: string} = {};
        data.forEach(payment => {
          if (payment.payment_date) {
            paymentDates[payment.month_number] = payment.payment_date;
          }
        });
        setNextPaymentDates(paymentDates);
      }
    } catch (error) {
      console.error('Error in payment history:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [applicationId]);
  
  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    // Only fetch if we have an application ID
    if (applicationId) {
      fetchApplicationDetails();
      fetchPayments();
    }
    
    // Clean up function that runs when component unmounts
    return () => {
      // Mark component as unmounted to prevent state updates
      isMounted.current = false;
    };
  }, [applicationId, fetchApplicationDetails, fetchPayments]);
  
  // Set up a polling mechanism to check for payment status changes
  useEffect(() => {
    if (!applicationId || !shouldShowPayments) return;
    
    // Poll for changes every 5 seconds to catch updates from other users
    const pollInterval = setInterval(() => {
      if (isMounted.current) {
        fetchApplicationDetails();
      }
    }, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [applicationId, shouldShowPayments, fetchApplicationDetails]);
  
  const getMonthStatus = (month: number): PaymentStatus | null => {
    // First check payment record
    const payment = payments.find(p => p.month_number === month);
    if (payment?.payment_status) {
      return payment.payment_status;
    }
    
    // For first month, ONLY show as PAID if it's explicitly set that way
    if (month === 1 && application) {
      // Only trust the explicit month_1 field or payments table records
      // Do not automatically assume paid based on status
      if (application.month_1 === 'PAID') {
        return 'PAID';
      }
    }
    
    return null;
  };
  
  const getPaymentDate = (month: number): string | null => {
    // First check from payments data
    const payment = payments.find(p => p.month_number === month);
    if (payment?.payment_date) {
      return payment.payment_date;
    }
    
    // For first month with effective policy date
    if (month === 1 && application?.effective_policy_date && getMonthStatus(1) === 'PAID') {
      return application.effective_policy_date;
    }
    
    // Check if this is a consecutive month that should be scheduled
    if (month > 1 && nextPaymentDates[month]) {
      return nextPaymentDates[month];
    }
    
    return null;
  };
  
  const getTooltipText = (month: number): string => {
    const status = getMonthStatus(month);
    const date = getPaymentDate(month);
    
    if (!status) {
      return `Month ${month}: Not yet due`;
    }
    
    if (date) {
      const formattedDate = new Date(date).toLocaleDateString();
      return `Month ${month}: ${status} (${formattedDate})`;
    }
    
    return `Month ${month}: ${status}`;
  };
  
  const handlePaymentUpdated = useCallback(() => {
    if (isMounted.current) {
      fetchPayments();
      fetchApplicationDetails();
    }
  }, [fetchPayments, fetchApplicationDetails]);
  
  // Create indicators for months 1-12 with careful key management
  const renderPaymentIndicators = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
      <div className="flex gap-1 items-center">
        {months.map((month) => (
          <PaymentIndicator
            key={`${stableKey}-month-${month}`}
            status={getMonthStatus(month)}
            monthNumber={month}
            applicationId={applicationId}
            paymentDate={getPaymentDate(month)}
            onPaymentUpdated={handlePaymentUpdated}
          />
        ))}
      </div>
    );
  };
  
  // Show nothing if the application isn't issued and paid
  if (!shouldShowPayments) {
    if (application?.effective_policy_date && application?.paid_status !== 'Paid') {
      // Show a placeholder with explanation for applications with effective date but not paid
      return (
        <div className="payment-history-container flex items-center">
          <div className="text-xs text-gray-500">Payment tracking begins after first payment</div>
        </div>
      );
    }
    // Otherwise show nothing
    return null;
  }
  
  // Create a simpler display if loading is taking too long
  if (loading && payments.length === 0) {
    return (
      <div className="payment-history-container flex items-center">
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