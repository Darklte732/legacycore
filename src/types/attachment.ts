export type AttachmentType = 'draft_return' | 'policy_update' | 'client_communication' | 'other';

export interface Attachment {
  id: string;
  organization_id: string;
  user_id: string;
  client_id?: string;
  policy_id?: string;
  carrier_id?: string;
  carrier_name?: string;
  title: string;
  description?: string;
  attachment_type: AttachmentType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentDetail {
  id: string;
  attachment_id: string;
  policy_number?: string;
  reason?: string;
  amount?: number;
  effective_date?: string;
  insured_name?: string;
  status?: string;
  return_date?: string;
  second_return_date?: string;
  product_name?: string;
  producer_id?: string;
  producer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentWithDetails extends Attachment {
  policy_number?: string;
  reason?: string;
  amount?: number;
  effective_date?: string;
  insured_name?: string;
  status?: string;
  return_date?: string;
  second_return_date?: string;
  product_name?: string;
  producer_id?: string;
  producer_name?: string;
  download_url?: string;
}

export interface AttachmentFormData {
  title: string;
  carrier: string;
  attachmentType: AttachmentType;
  policyNumber?: string;
  reason?: string;
  amount?: number;
  effectiveDate?: string;
  insuredName?: string;
  content?: string;
} 