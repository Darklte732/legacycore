'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AgentApplication } from '@/types/application'
import { ArrowUpDown, MoreHorizontal, Check, X, Pencil, DollarSign, User, Phone, MapPin, Calendar, FileText, CreditCard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Checkbox } from "@/components/ui/checkbox"
import { format } from 'date-fns'
import { ApplicationActions } from "@/components/ApplicationActions"
import { getPaymentHealth } from './utils'
import { PaymentGrid, PaymentLegend, SafePaymentHistoryGrid } from './components/PaymentComponents'
import './components/status-styles.css'
import { getStatusClass, getRowClass } from './utils/statusUtils'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export { PaymentLegend }

// Helper to format phone numbers
const formatPhoneNumber = (phone: string) => {
  if (!phone) return 'N/A';
  
  // Remove any non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // If not standard format, return original with some cleanup
  return phone;
};

const PolicyHealthBadge = ({ health }: { health: string }) => {
  // Use the utility function to determine the CSS class
  const statusClass = getStatusClass(null, health);
  
  return (
    <span className={`status-cell ${statusClass}`}>
      {health}
    </span>
  );
};

const getPaidStatusColor = (status: string | null) => {
  if (!status) return 'text-gray-500';
  if (status === 'Paid') return 'text-emerald-600 font-semibold';
  if (status === 'Unpaid') return 'text-blue-600 font-semibold';
  if (status?.includes('Return Draft') || status?.includes('NSF')) return 'text-rose-600 font-semibold';
  if (status === 'Cancelled') return 'text-rose-600 font-semibold';
  return 'text-gray-900';
};

// Format currency with appropriate styling based on amount
const CurrencyDisplay = ({ amount = 0, prefix = '$', showPositiveInGreen = false }) => {
  const isPositive = amount > 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
  
  let className = 'amount-cell';
  if (!isPositive && amount !== 0) {
    className = 'amount-cell text-rose-600';
  }
  
  return (
    <span className={className}>
      {prefix}{formatted}
    </span>
  );
};

export const columns: ColumnDef<AgentApplication>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="applications-page checkbox"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="applications-page checkbox"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'month',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Month
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const month = row.getValue('month') as string;
      return <span className="font-medium">{month || 'N/A'}</span>
    }
  },
  {
    accessorKey: 'policy_submit_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Submit Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('policy_submit_date') as string
      return date ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="whitespace-nowrap font-medium">{format(new Date(date), 'MM/dd/yyyy')}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Policy Submit Date</p>
          </TooltipContent>
        </Tooltip>
      ) : 'N/A'
    },
  },
  {
    accessorKey: 'closed_by_agent',
    header: ({ column }) => {
      return (
        <div className="applications-page header-cell-content">
          <User className="h-4 w-4 mr-1" />
          Agent
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.getValue('closed_by_agent') as string;
      return <span className="whitespace-nowrap">{agent || 'N/A'}</span>
    }
  },
  {
    accessorKey: 'proposed_insured',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <User className="h-4 w-4 mr-1" />
          Proposed Insured
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const id = row.original.id
      const name = row.getValue('proposed_insured') as string;
      return (
        <div className="name-cell">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/agent/applications/${id}/edit`} 
                className="font-medium text-blue-600 hover:underline whitespace-nowrap"
              >
                {name}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Client: {name}</p>
              <p className="text-xs text-muted-foreground">Click to view/edit application</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    },
  },
  {
    accessorKey: 'client_phone_number',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <Phone className="h-4 w-4 mr-1" />
        Phone
      </div>
    ),
    cell: ({ row }) => {
      const phone = row.getValue('client_phone_number') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="phone-cell whitespace-nowrap">{formatPhoneNumber(phone)}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Phone: {formatPhoneNumber(phone)}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'client_state',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <MapPin className="h-4 w-4 mr-1" />
        State
      </div>
    ),
    cell: ({ row }) => {
      const state = row.getValue('client_state') as string;
      return state ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="state-cell">{state}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>State: {state}</p>
          </TooltipContent>
        </Tooltip>
      ) : 'N/A'
    }
  },
  {
    accessorKey: 'policy_number',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <FileText className="h-4 w-4 mr-1" />
        Policy #
      </div>
    ),
    cell: ({ row }) => {
      const policyNumber = row.getValue('policy_number') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="policy-number-cell">{policyNumber || 'N/A'}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Policy Number: {policyNumber || 'Not Assigned'}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'carrier',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Carrier</div>
    ),
    cell: ({ row }) => {
      const carrier = row.getValue('carrier') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium whitespace-nowrap">{carrier || 'N/A'}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insurance Carrier: {carrier || 'Not Specified'}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'product',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Product</div>
    ),
    cell: ({ row }) => {
      const product = row.getValue('product') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="whitespace-nowrap">{product || 'N/A'}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insurance Product: {product || 'Not Specified'}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'monthly_premium',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Monthly Premium
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('monthly_premium')) || 0
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span><CurrencyDisplay amount={amount} showPositiveInGreen={true} /></span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Monthly Premium: ${amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Annual: ${(amount * 12).toFixed(2)}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'ap',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Annual Premium
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('ap')) || 0
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span><CurrencyDisplay amount={amount} showPositiveInGreen={true} /></span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Annual Premium: ${amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Monthly: ${(amount / 12).toFixed(2)}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Status</div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const paidStatus = row.getValue('paid_status') as string
      
      // Use the utility function to determine the CSS class
      const statusClass = getStatusClass(status, null, paidStatus);
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`status-cell ${statusClass}`}>
              {status || 'N/A'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Application Status: {status || 'N/A'}</p>
            {paidStatus && <p>Payment Status: {paidStatus}</p>}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'policy_health',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Policy Health</div>
    ),
    cell: ({ row }) => {
      const health = row.getValue('policy_health') as string || 'Unknown'
      
      // Apply the row class based on policy health
      const rowClass = getRowClass(health);
      
      // Store the row class for later use in the table render
      if (row.original) {
        row.original.rowClassName = rowClass;
      }
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PolicyHealthBadge health={health} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Policy Health: {health}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'paid_status',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <CreditCard className="h-4 w-4 mr-1" />
        Paid Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('paid_status') as string
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`${getPaidStatusColor(status)}`}>
              {status || 'N/A'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Paid Status: {status || 'Not Specified'}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'point_of_sale',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Point of Sale</div>
    ),
    cell: ({ row }) => {
      const pointOfSale = row.getValue('point_of_sale') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{pointOfSale || 'N/A'}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Point of Sale: {pointOfSale || 'Not Specified'}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'pms_form_filled_out',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">PMS Form</div>
    ),
    cell: ({ row }) => {
      const filled = row.getValue('pms_form_filled_out') as boolean
      return filled ? 
        <div className="flex justify-center">
          <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          </span>
        </div> : 
        <div className="flex justify-center">
          <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
            <X className="h-3.5 w-3.5 text-rose-600" />
          </span>
        </div>
    },
  },
  {
    accessorKey: 'split_with',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Split With</div>
    ),
    cell: ({ row }) => {
      const splitWith = row.getValue('split_with') as string;
      return splitWith ? 
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {splitWith}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Split with {splitWith}</p>
          </TooltipContent>
        </Tooltip> : 
        'None'
    }
  },
  {
    accessorKey: 'split_percentage',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Split %</div>
    ),
    cell: ({ row }) => {
      const splitPercentage = parseInt(row.getValue('split_percentage')) || 0;
      return splitPercentage > 0 ? 
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {splitPercentage}%
        </span> : 
        'N/A'
    },
  },
  {
    accessorKey: 'effective_policy_date',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <Calendar className="h-4 w-4 mr-1" />
        Effective Date
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue('effective_policy_date') as string
      return date ? 
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="whitespace-nowrap font-medium">{format(new Date(date), 'MM/dd/yyyy')}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Effective Policy Date</p>
          </TooltipContent>
        </Tooltip> : 
        'N/A'
    },
  },
  {
    accessorKey: 'effective_policy_status',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Effective Status</div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('effective_policy_status') as string;
      if (!status) return 'N/A';
      
      // Determine badge style based on status
      let badgeClass = 'bg-gray-100 text-gray-800';
      
      if (status.toLowerCase().includes('active')) {
        badgeClass = 'bg-emerald-100 text-emerald-800';
      } else if (status.toLowerCase().includes('pending')) {
        badgeClass = 'bg-amber-100 text-amber-800';
      } else if (status.toLowerCase().includes('cancel')) {
        badgeClass = 'bg-rose-100 text-rose-800';
      }
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
              {status}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Effective Policy Status: {status}</p>
            <p className="text-xs text-muted-foreground">
              {status.toLowerCase().includes('active') ? 'Policy is active and in force' : 
               status.toLowerCase().includes('pending') ? 'Policy is pending activation' : 
               status.toLowerCase().includes('cancel') ? 'Policy has been cancelled' :
               'Current policy status'}
            </p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Notes</div>
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;
      
      if (!notes) return 'No notes';
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[200px] truncate cursor-help">{notes}</div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p>{notes}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'notes_for_pay',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Pay Notes</div>
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes_for_pay') as string;
      
      if (!notes) return 'No notes';
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[200px] truncate cursor-help">{notes}</div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p>{notes}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'paid_split',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Paid Split?</div>
    ),
    cell: ({ row }) => {
      const paidSplit = row.getValue('paid_split') as string;
      
      if (!paidSplit) return 'N/A';
      
      const isYes = paidSplit.toLowerCase() === 'yes' || paidSplit === 'true' || paidSplit === '1';
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {isYes ? (
              <div className="flex justify-center">
                <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </span>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-amber-600" />
                </span>
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Split Commission Paid: {isYes ? 'Yes' : 'No'}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: 'commission_status',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <DollarSign className="h-4 w-4 mr-1" />
        Commission Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('commission_status') as string
      
      // Map commission status to CSS classes
      let statusClass = 'status-cell';
      
      if (status) {
        const normalizedStatus = status.toLowerCase().trim();
        
        if (normalizedStatus === 'paid') {
          statusClass += ' status-approved';
        } else if (normalizedStatus === 'pending') {
          statusClass += ' status-pending';
        } else if (normalizedStatus === 'chargeback') {
          statusClass += ' status-cancelled';
        } else if (normalizedStatus === 'partial') {
          statusClass += ' status-attention';
        }
      }
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={statusClass}>
              {status || 'N/A'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Commission Status: {status || 'Not Set'}</p>
            <p className="text-xs text-muted-foreground">
              {status?.toLowerCase() === 'paid' ? 'Commission has been paid' : 
               status?.toLowerCase() === 'pending' ? 'Commission payment is pending' : 
               status?.toLowerCase() === 'chargeback' ? 'Commission has been charged back' :
               status?.toLowerCase() === 'partial' ? 'Commission has been partially paid' :
               'No commission status available'}
            </p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'commission_paid_date',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">
        <Calendar className="h-4 w-4 mr-1" />
        Commission Date
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue('commission_paid_date') as string
      const commissionStatus = row.getValue('commission_status') as string
      
      // Apply different styling based on commission status
      let dateClass = 'font-medium';
      if (commissionStatus?.toLowerCase().includes('paid')) {
        dateClass = 'text-emerald-600 font-medium';
      }
      
      return date ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`whitespace-nowrap ${dateClass}`}>
              {format(new Date(date), 'MM/dd/yyyy')}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Commission Payment Date: {format(new Date(date), 'MMMM d, yyyy')}</p>
          </TooltipContent>
        </Tooltip>
      ) : 'N/A'
    },
  },
  {
    accessorKey: 'policy_payment_cycle',
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Payment Cycle</div>
    ),
    cell: ({ row }) => {
      const cycle = row.getValue('policy_payment_cycle') as string
      
      if (!cycle) return 'Initial';
      
      // Map payment cycle to badge style
      let badgeClass = 'bg-gray-100 text-gray-800';
      
      const normalizedCycle = cycle.toLowerCase().trim();
      if (normalizedCycle === 'complete') {
        badgeClass = 'bg-emerald-100 text-emerald-800';
      } else if (normalizedCycle === 'recurring') {
        badgeClass = 'bg-blue-100 text-blue-800';
      } else if (normalizedCycle === 'initial') {
        badgeClass = 'bg-amber-100 text-amber-800';
      }
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
              {cycle}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Payment Cycle: {cycle}</p>
            <p className="text-xs text-muted-foreground">
              {normalizedCycle === 'complete' ? 'All payments completed' : 
               normalizedCycle === 'recurring' ? 'Regular recurring payments' : 
               normalizedCycle === 'initial' ? 'First payment cycle' :
               'Payment cycle information'}
            </p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'commission_amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="applications-page header-cell-content"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Commission
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Get the commission amount, with fallback to calculated value from premium if needed
      let amount = parseFloat(row.getValue('commission_amount')) || 0;
      let calculatedFromPremium = false;
      let annualPremium = parseFloat(row.getValue('ap')) || 0;
      let splitPercentage = parseInt(row.getValue('split_percentage')) || 20;
      let agentSplitRatio = (100 - splitPercentage) / 100;
      
      // If no commission amount is set, calculate it from annual premium and split percentage
      if (amount === 0) {
        calculatedFromPremium = true;
        if (annualPremium > 0) {
          amount = annualPremium * agentSplitRatio;
        }
      }
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span><CurrencyDisplay amount={amount} showPositiveInGreen={true} /></span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Commission: ${amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Annual Premium: ${annualPremium.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Agent Split: {100-splitPercentage}%</p>
            {calculatedFromPremium && (
              <p className="text-xs text-muted-foreground italic">
                Calculated as: ${annualPremium.toFixed(2)} × {agentSplitRatio.toFixed(2)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  // Payment History column with the new indicator system
  {
    id: "payment_grid",
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Payment Grid</div>
    ),
    cell: ({ row }) => {
      const application = row.original
      const existingPayments = {
        month_1: application.month_1,
        month_2: application.month_2,
        month_3: application.month_3,
        month_4: application.month_4,
        month_5: application.month_5,
        month_6: application.month_6,
        month_7: application.month_7,
        month_8: application.month_8,
        month_9: application.month_9,
        month_10: application.month_10,
        month_11: application.month_11,
        month_12: application.month_12,
      }
      return (
        <PaymentGrid
          applicationId={application.id}
          existingPayments={existingPayments}
        />
      )
    },
  },
  {
    accessorKey: 'payment_history',
    header: 'Payment History',
    cell: ({ row }) => {
      const applicationId = row.original.id;
      return <SafePaymentHistoryGrid applicationId={applicationId} />;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="applications-page header-cell-content">Actions</div>
    ),
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original
      // This cell renderer will be overridden by the columnsWithEdit in page.tsx
      return <ApplicationActions applicationId={application.id} />
    },
  },
] 