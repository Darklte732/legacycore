import { AgentApplication } from '@/types/application'

/**
 * Sort applications by different criteria
 * @param applications Array of applications to sort
 * @param sortBy Sorting criteria
 * @returns Sorted applications array
 */
export const sortApplications = (applications: AgentApplication[], sortBy: string) => {
  return [...applications].sort((a, b) => {
    if (sortBy === 'health') {
      const healthOrder = {
        'Payment Issues': 1,
        'Needs Attention': 2,
        'Pending First Payment': 3,
        'Active': 4,
        'Cancelled': 5
      };
      return (healthOrder[a.policy_health as keyof typeof healthOrder] || 99) - 
             (healthOrder[b.policy_health as keyof typeof healthOrder] || 99);
    }
    
    // Add other sort options as needed
    // For example, sorting by payment status:
    if (sortBy === 'paymentHealth') {
      // Get payment health status for each application
      const getPaymentHealthPriority = (app: AgentApplication) => {
        const monthColumns = ['month_1', 'month_2', 'month_3', 'month_4', 'month_5', 
                             'month_6', 'month_7', 'month_8', 'month_9', 'month_10', 
                             'month_11', 'month_12'];
        
        let missedCount = 0;
        let paidCount = 0;
        
        monthColumns.forEach(col => {
          const value = app[col as keyof AgentApplication];
          if (typeof value === 'string' && (value.toLowerCase().includes('missed') || value.toLowerCase().includes('nsf'))) {
            missedCount++;
          } else if (typeof value === 'string' && value.toLowerCase().includes('paid')) {
            paidCount++;
          }
        });
        
        // Priority: critical (high priority) -> warning -> good -> neutral (low priority)
        if (missedCount >= 2) return 1; // critical
        if (missedCount === 1) return 2; // warning
        if (paidCount > 0) return 3; // good
        return 4; // neutral
      };
      
      return getPaymentHealthPriority(a) - getPaymentHealthPriority(b);
    }
    
    // Default to no sorting
    return 0;
  });
};

/**
 * Get the payment health status of an application based on payment history
 * @param application The application to check
 * @returns Payment health status: 'critical', 'warning', 'good', or 'neutral'
 */
export const getPaymentHealth = (application: AgentApplication) => {
  const monthColumns = ['month_1', 'month_2', 'month_3', 'month_4', 'month_5', 
                       'month_6', 'month_7', 'month_8', 'month_9', 'month_10', 
                       'month_11', 'month_12'];
  
  let missedCount = 0;
  let paidCount = 0;
  
  monthColumns.forEach(col => {
    const value = application[col as keyof AgentApplication];
    if (typeof value === 'string' && (value.toLowerCase().includes('missed') || value.toLowerCase().includes('nsf'))) {
      missedCount++;
    } else if (typeof value === 'string' && value.toLowerCase().includes('paid')) {
      paidCount++;
    }
  });
  
  if (missedCount >= 2) return 'critical';
  if (missedCount === 1) return 'warning';
  if (paidCount > 0) return 'good';
  return 'neutral';
}; 