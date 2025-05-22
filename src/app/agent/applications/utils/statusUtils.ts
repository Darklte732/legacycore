import { AgentApplication } from '@/types/application'

/**
 * Determine the CSS class for a status cell based on the status and policy health
 * @param status Status text
 * @param policyHealth Policy health text
 * @param paidStatus Paid status text (optional)
 * @returns CSS class name
 */
export function getStatusClass(
  status?: string | null, 
  policyHealth?: string | null, 
  paidStatus?: string | null
): string {
  // For Policy Health column
  if (policyHealth) {
    if (policyHealth === 'Active') return 'status-active';
    if (policyHealth === 'Pending First Payment') return 'status-pending';
    if (policyHealth === 'Payment Issues' || policyHealth === 'Needs Attention') return 'status-attention';
    if (policyHealth === 'Cancelled') return 'status-cancelled';
  }
  
  // For Status column
  if (status) {
    if (status === 'Approved' && paidStatus === 'Paid') return 'status-active';
    if (status === 'Approved' && paidStatus === 'Unpaid') return 'status-pending';
    if (status.includes('Cancelled') || status === 'Declined') return 'status-cancelled';
    if (status === '1st Month Paid') return 'status-active';
    if (status.includes('Approved') || status.includes('Live') || status.includes('Paid') || status.includes('Active')) {
      return 'status-active';
    }
    if (status.includes('Pending') || status.includes('In Progress')) {
      return 'status-pending';
    }
    if (status.includes('Cancellation') || status.includes('Issues') || status.includes('Attention')) {
      return 'status-attention';
    }
  }
  
  return '';
}

/**
 * Determine the CSS class for a table row based on policy health
 * @param policyHealth Policy health text
 * @returns CSS class name for the row
 */
export function getRowClass(policyHealth?: string | null): string {
  if (!policyHealth) return '';
  
  if (policyHealth === 'Active') return 'row-active';
  if (policyHealth === 'Pending First Payment') return 'row-pending';
  if (policyHealth === 'Payment Issues' || policyHealth === 'Needs Attention') return 'row-attention';
  if (policyHealth === 'Cancelled') return 'row-cancelled';
  
  return '';
}

/**
 * Get the CSS class for a payment indicator based on its status
 * @param status Payment status text
 * @returns CSS class name
 */
export function getPaymentIndicatorClass(status?: string | null): string {
  if (!status) return 'payment-empty';
  
  const statusUpper = status.toUpperCase();
  
  // Match against the constant values from PaymentStatus type
  if (statusUpper === 'PAID') {
    return 'payment-paid';
  } 
  if (statusUpper === 'MISSED') {
    return 'payment-missed';
  }
  if (statusUpper === 'PENDING') {
    return 'payment-pending';
  }
  if (statusUpper === 'NSF') {
    return 'payment-nsf';
  }
  if (statusUpper === 'WAIVED') {
    return 'payment-waived';
  }
  
  // Fallback for legacy string values
  const statusLower = status.toLowerCase();
  if (statusLower.includes('paid')) {
    return 'payment-paid';
  } 
  if (statusLower.includes('miss')) {
    return 'payment-missed';
  }
  if (statusLower.includes('pend')) {
    return 'payment-pending';
  }
  if (statusLower.includes('nsf')) {
    return 'payment-nsf';
  }
  if (statusLower.includes('waiv')) {
    return 'payment-waived';
  }
  
  return 'payment-empty';
}

/**
 * Get the appropriate title for a payment indicator
 * @param status Payment status text
 * @param monthNumber Month number
 * @param paymentDate Optional payment date
 * @returns Title text for the indicator
 */
export function getPaymentIndicatorTitle(
  status: string | null, 
  monthNumber: number,
  paymentDate?: string | null
): string {
  if (!status) return `Month ${monthNumber}: Not yet due`;
  
  const statusLower = status.toLowerCase();
  const dateInfo = paymentDate ? ` on ${paymentDate}` : '';
  
  if (statusLower.includes('paid')) {
    return `Month ${monthNumber}: Paid${dateInfo}`;
  } 
  if (statusLower.includes('miss')) {
    return `Month ${monthNumber}: Missed payment`;
  }
  if (statusLower.includes('pend')) {
    return `Month ${monthNumber}: Payment pending`;
  }
  if (statusLower.includes('nsf')) {
    return `Month ${monthNumber}: Insufficient funds`;
  }
  if (statusLower.includes('waiv')) {
    return `Month ${monthNumber}: Payment waived`;
  }
  
  return `Month ${monthNumber}: ${status}`;
} 