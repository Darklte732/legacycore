export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

import { UserRole } from './roles'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string
          avatar_url: string | null
          organization_id: string | null
          role: UserRole | null
          created_at: string | null
          updated_at: string | null
          upline_split_percentage: number | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          avatar_url?: string | null
          organization_id?: string | null
          role?: UserRole | null
          created_at?: string | null
          updated_at?: string | null
          upline_split_percentage?: number | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          avatar_url?: string | null
          organization_id?: string | null
          role?: UserRole | null
          created_at?: string | null
          updated_at?: string | null
          upline_split_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string
          activity_type: string
          description: string
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id: string
          activity_type: string
          description: string
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string
          activity_type?: string
          description?: string
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_applications: {
        Row: {
          id: string
          agent_id: string
          organization_id: string | null
          month: string | null
          policy_submit_date: string | null
          closed_by_agent: string | null
          proposed_insured: string
          client_phone_number: string | null
          client_state: string | null
          city: string | null
          zip: string | null
          gender: string | null
          date_of_birth: string | null
          primary_beneficiary: string | null
          relationship_to_insured: string | null
          tobacco_nicotine_use: boolean | null
          height_feet: number | null
          height_inches: number | null
          weight_lbs: number | null
          medical_lung_disease: boolean | null
          medical_heart_attack: boolean | null
          medical_heart_failure: boolean | null
          medical_blood_clots: boolean | null
          medical_cancer: boolean | null
          medical_diabetes: boolean | null
          medical_high_bp: boolean | null
          medical_high_cholesterol: boolean | null
          policy_number: string | null
          carrier_id: string | null
          product: string | null
          monthly_premium: number | null
          ap: number | null
          status: string | null
          paid_status: string | null
          point_of_sale: string | null
          pms_form_filled_out: boolean | null
          split_with: string | null
          effective_policy_date: string | null
          effective_policy_status: string | null
          notes: string | null
          notes_for_pay: string | null
          paid_split: string | null
          month_1: number | null
          month_2: number | null
          month_3: number | null
          month_4: number | null
          month_5: number | null
          month_6: number | null
          month_7: number | null
          month_8: number | null
          month_9: number | null
          month_10: number | null
          month_11: number | null
          month_12: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          organization_id?: string | null
          month?: string | null
          policy_submit_date?: string | null
          closed_by_agent?: string | null
          proposed_insured: string
          client_phone_number?: string | null
          client_state?: string | null
          city?: string | null
          zip?: string | null
          gender?: string | null
          date_of_birth?: string | null
          primary_beneficiary?: string | null
          relationship_to_insured?: string | null
          tobacco_nicotine_use?: boolean | null
          height_feet?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          medical_lung_disease?: boolean | null
          medical_heart_attack?: boolean | null
          medical_heart_failure?: boolean | null
          medical_blood_clots?: boolean | null
          medical_cancer?: boolean | null
          medical_diabetes?: boolean | null
          medical_high_bp?: boolean | null
          medical_high_cholesterol?: boolean | null
          policy_number?: string | null
          carrier_id?: string | null
          product?: string | null
          monthly_premium?: number | null
          ap?: number | null
          status?: string | null
          paid_status?: string | null
          point_of_sale?: string | null
          pms_form_filled_out?: boolean | null
          split_with?: string | null
          effective_policy_date?: string | null
          effective_policy_status?: string | null
          notes?: string | null
          notes_for_pay?: string | null
          paid_split?: string | null
          month_1?: number | null
          month_2?: number | null
          month_3?: number | null
          month_4?: number | null
          month_5?: number | null
          month_6?: number | null
          month_7?: number | null
          month_8?: number | null
          month_9?: number | null
          month_10?: number | null
          month_11?: number | null
          month_12?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          organization_id?: string | null
          month?: string | null
          policy_submit_date?: string | null
          closed_by_agent?: string | null
          proposed_insured?: string
          client_phone_number?: string | null
          client_state?: string | null
          city?: string | null
          zip?: string | null
          gender?: string | null
          date_of_birth?: string | null
          primary_beneficiary?: string | null
          relationship_to_insured?: string | null
          tobacco_nicotine_use?: boolean | null
          height_feet?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          medical_lung_disease?: boolean | null
          medical_heart_attack?: boolean | null
          medical_heart_failure?: boolean | null
          medical_blood_clots?: boolean | null
          medical_cancer?: boolean | null
          medical_diabetes?: boolean | null
          medical_high_bp?: boolean | null
          medical_high_cholesterol?: boolean | null
          policy_number?: string | null
          carrier_id?: string | null
          product?: string | null
          monthly_premium?: number | null
          ap?: number | null
          status?: string | null
          paid_status?: string | null
          point_of_sale?: string | null
          pms_form_filled_out?: boolean | null
          split_with?: string | null
          effective_policy_date?: string | null
          effective_policy_status?: string | null
          notes?: string | null
          notes_for_pay?: string | null
          paid_split?: string | null
          month_1?: number | null
          month_2?: number | null
          month_3?: number | null
          month_4?: number | null
          month_5?: number | null
          month_6?: number | null
          month_7?: number | null
          month_8?: number | null
          month_9?: number | null
          month_10?: number | null
          month_11?: number | null
          month_12?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_applications_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_applications_carrier_id_fkey"
            columns: ["carrier_id"]
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_applications_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string
          notification_preferences: Json | null
          appearance_preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id: string
          notification_preferences?: Json | null
          appearance_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string
          notification_preferences?: Json | null
          appearance_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          role: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          role?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          role?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        }
      }
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: string;
          content: string;
          timestamp: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          chat_id: string;
          role: string;
          content: string;
          timestamp: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          chat_id?: string;
          role?: string;
          content?: string;
          timestamp?: string;
          created_at?: string;
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 