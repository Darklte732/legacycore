// Types for Agent Applications

// Payment status type
export type PaymentStatus = 'PAID' | 'MISSED' | 'PENDING' | 'NSF' | 'WAIVED' | null;

export interface AgentApplication {
  id: string
  created_at: string
  agent_id: string
  organization_id?: string
  month?: string
  policy_submit_date?: string
  closed_by_agent?: string
  proposed_insured: string
  client_phone_number?: string
  client_state?: string
  policy_number?: string
  carrier?: string
  carrier_id?: string
  product?: string
  monthly_premium?: number
  ap?: number
  status?: string
  policy_health?: string
  paid_status?: string
  point_of_sale?: string
  pms_form_filled_out?: boolean
  split_with?: string
  effective_policy_date?: string
  effective_policy_status?: string
  notes?: string
  notes_for_pay?: string
  paid_split?: string
  month_1?: PaymentStatus
  month_2?: PaymentStatus
  month_3?: PaymentStatus
  month_4?: PaymentStatus
  month_5?: PaymentStatus
  month_6?: PaymentStatus
  month_7?: PaymentStatus
  month_8?: PaymentStatus
  month_9?: PaymentStatus
  month_10?: PaymentStatus
  month_11?: PaymentStatus
  month_12?: PaymentStatus
  updated_at?: string
  commission_status?: string
  commission_paid_date?: string
  policy_payment_cycle?: string
  commission_amount?: number
  commission_payment_reference?: string
  rowClassName?: string
}

export interface ApplicationFormValues {
  client_name: string
  client_email: string
  client_phone: string
  policy_type: string
  carrier: string
  premium: string
  effective_date: string
  organization_id?: string
  month?: string
  policy_submit_date?: string
  closed_by_agent?: string
  proposed_insured: string
  client_phone_number?: string
  client_state?: string
  policy_number?: string
  carrier_id?: string
  carrier_name?: string // Join from carriers table
  product?: string
  monthly_premium?: number
  ap?: number
  status?: string
  policy_health?: string
  paid_status?: string
  point_of_sale?: string
  pms_form_filled_out?: boolean
  split_with?: string
  effective_policy_date?: string
  effective_policy_status?: string
  notes?: string
  notes_for_pay?: string
  paid_split?: string
  month_1?: number
  month_2?: number
  month_3?: number
  month_4?: number
  month_5?: number
  month_6?: number
  month_7?: number
  month_8?: number
  month_9?: number
  month_10?: number
  month_11?: number
  month_12?: number
  updated_at?: string
  commission_status?: string
  commission_paid_date?: string
  policy_payment_cycle?: string
  commission_amount?: number
  commission_payment_reference?: string
}

export interface AgentApplicationFormValues {
  month: string
  policy_submit_date: string
  closed_by_agent: string
  proposed_insured: string
  client_phone_number: string
  client_state: string
  policy_number: string
  carrier_id: string
  product: string
  monthly_premium: string | number
  ap: string | number
  status: string
  policy_health: string
  paid_status: string
  point_of_sale: string
  pms_form_filled_out: boolean
  split_with: string
  effective_policy_date: string
  effective_policy_status: string
  notes: string
  notes_for_pay: string
  paid_split: string
  commission_status?: string
  commission_paid_date?: string
  policy_payment_cycle?: string
  commission_amount?: number
  commission_payment_reference?: string
} 