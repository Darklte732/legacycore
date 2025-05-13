export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      agent_applications: {
        Row: {
          id: string
          agent_id: string
          proposed_insured: string
          carrier: string
          product_type: string
          face_amount: number
          premium: number
          status: string
          policy_health?: string
          commission_amount?: number
          created_at: string
          updated_at: string
          policy_submit_date?: string
          requirements_pending?: boolean
          payment_status?: string
          agent_split_percentage?: number
          first_month_paid?: boolean
          issued?: boolean
          issue_date?: string
          attention_reason?: string
          paid_status?: string
        }
        Insert: {
          id?: string
          agent_id: string
          proposed_insured: string
          carrier: string
          product_type: string
          face_amount: number
          premium: number
          status: string
          policy_health?: string
          commission_amount?: number
          created_at?: string
          updated_at?: string
          policy_submit_date?: string
          requirements_pending?: boolean
          payment_status?: string
          agent_split_percentage?: number
          first_month_paid?: boolean
          issued?: boolean
          issue_date?: string
          attention_reason?: string
          paid_status?: string
        }
        Update: {
          id?: string
          agent_id?: string
          proposed_insured?: string
          carrier?: string
          product_type?: string
          face_amount?: number
          premium?: number
          status?: string
          policy_health?: string
          commission_amount?: number
          created_at?: string
          updated_at?: string
          policy_submit_date?: string
          requirements_pending?: boolean
          payment_status?: string
          agent_split_percentage?: number
          first_month_paid?: boolean
          issued?: boolean
          issue_date?: string
          attention_reason?: string
          paid_status?: string
        }
      }
      applications: {
        Row: {
          id: string
          agent_id: string
          proposed_insured: string
          carrier: string
          product_type: string
          face_amount: number
          premium: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          proposed_insured: string
          carrier: string
          product_type: string
          face_amount: number
          premium: number
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          proposed_insured?: string
          carrier?: string
          product_type?: string
          face_amount?: number
          premium?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      application_payments: {
        Row: {
          id: string
          application_id: string
          month_number: number
          payment_status: string
          payment_date: string
        }
        Insert: {
          id?: string
          application_id: string
          month_number: number
          payment_status: string
          payment_date: string
        }
        Update: {
          id?: string
          application_id?: string
          month_number?: number
          payment_status?: string
          payment_date?: string
        }
      }
      commission_payments: {
        Row: {
          id: string
          application_id: string
          agent_id: string
          amount: number
          status: string
          payment_date: string
        }
        Insert: {
          id?: string
          application_id: string
          agent_id: string
          amount: number
          status: string
          payment_date: string
        }
        Update: {
          id?: string
          application_id?: string
          agent_id?: string
          amount?: number
          status?: string
          payment_date?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
} 