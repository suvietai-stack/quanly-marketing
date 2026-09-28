export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_branding: {
        Row: {
          app_name: string
          description: string
          favicon_url: string | null
          id: number
          logo_url: string | null
          org_name: string
          short_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app_name?: string
          description?: string
          favicon_url?: string | null
          id?: number
          logo_url?: string | null
          org_name?: string
          short_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app_name?: string
          description?: string
          favicon_url?: string | null
          id?: number
          logo_url?: string | null
          org_name?: string
          short_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      app_branding_history: {
        Row: {
          actor_id: string | null
          after: Json
          before: Json
          created_at: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          after: Json
          before: Json
          created_at?: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          after?: Json
          before?: Json
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          permissions: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          is_system?: boolean
          name: string
          permissions?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          permissions?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      attendance_explanation_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          explanation_id: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          explanation_id: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          explanation_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_explanation_events_explanation_id_fkey"
            columns: ["explanation_id"]
            isOneToOne: false
            referencedRelation: "attendance_explanations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_explanations: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          owner_id: string
          reason_id: string
          reason_name: string
          recalled: boolean
          recalled_at: string | null
          reconcile_note: string | null
          reconciled: boolean
          reconciled_at: string | null
          reconciled_by: string | null
          submitted_at: string
          time_in: string | null
          time_out: string | null
          updated_at: string
          witness_at: string | null
          witness_id: string
          witness_note: string | null
          witness_status: string
          work_date: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          owner_id: string
          reason_id: string
          reason_name: string
          recalled?: boolean
          recalled_at?: string | null
          reconcile_note?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          submitted_at?: string
          time_in?: string | null
          time_out?: string | null
          updated_at?: string
          witness_at?: string | null
          witness_id: string
          witness_note?: string | null
          witness_status?: string
          work_date: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          owner_id?: string
          reason_id?: string
          reason_name?: string
          recalled?: boolean
          recalled_at?: string | null
          reconcile_note?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          submitted_at?: string
          time_in?: string | null
          time_out?: string | null
          updated_at?: string
          witness_at?: string | null
          witness_id?: string
          witness_note?: string | null
          witness_status?: string
          work_date?: string
        }
        Relationships: []
      }
      backlinks: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      catalogs: {
        Row: {
          items: Json
          scope: string
          updated_at: string
        }
        Insert: {
          items?: Json
          scope: string
          updated_at?: string
        }
        Update: {
          items?: Json
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_notify_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      employee_kpi_adjustments: {
        Row: {
          created_at: string
          created_by: string | null
          field: string
          from_value: number
          id: string
          item_id: string
          reason: string
          to_value: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          field?: string
          from_value: number
          id?: string
          item_id: string
          reason?: string
          to_value: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          field?: string
          from_value?: number
          id?: string
          item_id?: string
          reason?: string
          to_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpi_adjustments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "employee_kpi_items"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_kpi_items: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          kpi_period_id: string
          kr_id: string | null
          label: string | null
          metadata: Json
          metric_key: string
          social_id: string | null
          target_operator: string
          target_value: number
          unit: string
          updated_at: string
          website_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          kpi_period_id: string
          kr_id?: string | null
          label?: string | null
          metadata?: Json
          metric_key: string
          social_id?: string | null
          target_operator?: string
          target_value?: number
          unit?: string
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          kpi_period_id?: string
          kr_id?: string | null
          label?: string | null
          metadata?: Json
          metric_key?: string
          social_id?: string | null
          target_operator?: string
          target_value?: number
          unit?: string
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpi_items_kpi_period_id_fkey"
            columns: ["kpi_period_id"]
            isOneToOne: false
            referencedRelation: "employee_kpi_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_kpi_items_kr_id_fkey"
            columns: ["kr_id"]
            isOneToOne: false
            referencedRelation: "goal_krs"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_kpi_periods: {
        Row: {
          created_at: string
          created_by: string | null
          goal_id: string | null
          id: string
          period_end: string
          period_start: string
          period_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          goal_id?: string | null
          id?: string
          period_end: string
          period_start: string
          period_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          goal_id?: string | null
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpi_periods_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_kpi_snapshots: {
        Row: {
          data: Json
          engine_version: string
          id: string
          kpi_period_id: string
          locked_at: string
          locked_by: string | null
        }
        Insert: {
          data?: Json
          engine_version: string
          id?: string
          kpi_period_id: string
          locked_at?: string
          locked_by?: string | null
        }
        Update: {
          data?: Json
          engine_version?: string
          id?: string
          kpi_period_id?: string
          locked_at?: string
          locked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpi_snapshots_kpi_period_id_fkey"
            columns: ["kpi_period_id"]
            isOneToOne: true
            referencedRelation: "employee_kpi_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      goal_krs: {
        Row: {
          brand_id: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          goal_id: string
          id: string
          label: string | null
          metadata: Json
          metric_key: string
          social_id: string | null
          status: string
          target_value: number
          updated_at: string
          website_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          goal_id: string
          id?: string
          label?: string | null
          metadata?: Json
          metric_key: string
          social_id?: string | null
          status?: string
          target_value?: number
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          goal_id?: string
          id?: string
          label?: string | null
          metadata?: Json
          metric_key?: string
          social_id?: string | null
          status?: string
          target_value?: number
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_krs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          brand_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json
          period_end: string
          period_start: string
          social_id: string | null
          status: string
          title: string
          updated_at: string
          website_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          period_end: string
          period_start: string
          social_id?: string | null
          status?: string
          title: string
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          period_end?: string
          period_start?: string
          social_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          website_id?: string | null
        }
        Relationships: []
      }
      growth: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      leave_request_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          id: string
          request_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          request_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_request_submissions: {
        Row: {
          approver_id: string
          calc: Json
          decided_at: string | null
          decided_by: string | null
          detail: string | null
          id: string
          no: number
          note: string | null
          payload: Json
          reason_id: string
          reason_name: string
          request_id: string
          result: string | null
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          approver_id: string
          calc: Json
          decided_at?: string | null
          decided_by?: string | null
          detail?: string | null
          id?: string
          no: number
          note?: string | null
          payload: Json
          reason_id: string
          reason_name: string
          request_id: string
          result?: string | null
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          approver_id?: string
          calc?: Json
          decided_at?: string | null
          decided_by?: string | null
          detail?: string | null
          id?: string
          no?: number
          note?: string | null
          payload?: Json
          reason_id?: string
          reason_name?: string
          request_id?: string
          result?: string | null
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_request_submissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied: Json
          approver_id: string
          calc: Json
          cancel_reason: string | null
          cancel_state: string | null
          created_at: string
          created_by: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          detail: string | null
          id: string
          mark_at: string
          owner_id: string
          payload: Json
          reason_id: string
          reason_name: string
          status: string
          submission_no: number
          submitted_at: string
          type: string
          updated_at: string
        }
        Insert: {
          applied: Json
          approver_id: string
          calc: Json
          cancel_reason?: string | null
          cancel_state?: string | null
          created_at?: string
          created_by: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          detail?: string | null
          id?: string
          mark_at: string
          owner_id: string
          payload: Json
          reason_id: string
          reason_name: string
          status?: string
          submission_no?: number
          submitted_at?: string
          type: string
          updated_at?: string
        }
        Update: {
          applied?: Json
          approver_id?: string
          calc?: Json
          cancel_reason?: string | null
          cancel_state?: string | null
          created_at?: string
          created_by?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          detail?: string | null
          id?: string
          mark_at?: string
          owner_id?: string
          payload?: Json
          reason_id?: string
          reason_name?: string
          status?: string
          submission_no?: number
          submitted_at?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      map_posts: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          attendance_id: string | null
          content_id: string | null
          created_at: string
          dedup_key: string
          id: string
          kind: string
          leave_request_id: string | null
          order_id: string | null
          payload: Json | null
          push_status: string
          read_at: string | null
          recipient_id: string
          signal_id: string | null
          zalo_attempts: number
          zalo_error: string | null
          zalo_sent_at: string | null
          zalo_status: string
        }
        Insert: {
          attendance_id?: string | null
          content_id?: string | null
          created_at?: string
          dedup_key: string
          id?: string
          kind: string
          leave_request_id?: string | null
          order_id?: string | null
          payload?: Json | null
          push_status?: string
          read_at?: string | null
          recipient_id: string
          signal_id?: string | null
          zalo_attempts?: number
          zalo_error?: string | null
          zalo_sent_at?: string | null
          zalo_status?: string
        }
        Update: {
          attendance_id?: string | null
          content_id?: string | null
          created_at?: string
          dedup_key?: string
          id?: string
          kind?: string
          leave_request_id?: string | null
          order_id?: string | null
          payload?: Json | null
          push_status?: string
          read_at?: string | null
          recipient_id?: string
          signal_id?: string | null
          zalo_attempts?: number
          zalo_error?: string | null
          zalo_sent_at?: string | null
          zalo_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance_explanations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "web_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_leave_request_id_fkey"
            columns: ["leave_request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "opportunity_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_signal_events: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: Json
          id: string
          kind: string
          signal_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          kind: string
          signal_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          kind?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_signal_events_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "opportunity_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_signal_notes: {
        Row: {
          author_id: string
          channel: string | null
          created_at: string
          event_type: string | null
          id: string
          lost_reason: string | null
          next_contact_at: string | null
          next_contact_on: string | null
          note: string | null
          revenue: number | null
          signal_id: string
          status_from: string | null
          status_to: string | null
        }
        Insert: {
          author_id: string
          channel?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          lost_reason?: string | null
          next_contact_at?: string | null
          next_contact_on?: string | null
          note?: string | null
          revenue?: number | null
          signal_id: string
          status_from?: string | null
          status_to?: string | null
        }
        Update: {
          author_id?: string
          channel?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          lost_reason?: string | null
          next_contact_at?: string | null
          next_contact_on?: string | null
          note?: string | null
          revenue?: number | null
          signal_id?: string
          status_from?: string | null
          status_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_signal_notes_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "opportunity_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_signals: {
        Row: {
          address: string | null
          assigned_at: string | null
          assigned_to: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          customer_name: string
          detected_on: string
          id: string
          lost_reason: string | null
          marketing_note: string | null
          need_detail: string | null
          need_group: string | null
          need_groups: string[]
          next_contact_at: string | null
          next_contact_on: string | null
          phone: string
          products: string[]
          revenue: number | null
          source: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_name: string
          detected_on?: string
          id?: string
          lost_reason?: string | null
          marketing_note?: string | null
          need_detail?: string | null
          need_group?: string | null
          need_groups?: string[]
          next_contact_at?: string | null
          next_contact_on?: string | null
          phone: string
          products?: string[]
          revenue?: number | null
          source: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_name?: string
          detected_on?: string
          id?: string
          lost_reason?: string | null
          marketing_note?: string | null
          need_detail?: string | null
          need_group?: string | null
          need_groups?: string[]
          next_contact_at?: string | null
          next_contact_on?: string | null
          phone?: string
          products?: string[]
          revenue?: number | null
          source?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          desired_position: string | null
          email: string | null
          full_name: string
          id: string
          is_system_admin: boolean
          last_seen_at: string | null
          must_change_password: boolean
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          desired_position?: string | null
          email?: string | null
          full_name?: string
          id: string
          is_system_admin?: boolean
          last_seen_at?: string | null
          must_change_password?: boolean
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          desired_position?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_system_admin?: boolean
          last_seen_at?: string | null
          must_change_password?: boolean
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_config: {
        Row: {
          id: number
          token: string
        }
        Insert: {
          id?: number
          token?: string
        }
        Update: {
          id?: number
          token?: string
        }
        Relationships: []
      }
      push_deliveries: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          id: string
          notification_id: string
          sent_at: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          notification_id: string
          sent_at?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string
          sent_at?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device: string | null
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          status: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device?: string | null
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          status?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device?: string | null
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      seo_checks: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      socials: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_permission_overrides: {
        Row: {
          permissions: string[]
          updated_at: string
          use_custom: boolean
          user_id: string
        }
        Insert: {
          permissions?: string[]
          updated_at?: string
          use_custom?: boolean
          user_id: string
        }
        Update: {
          permissions?: string[]
          updated_at?: string
          use_custom?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      web_contents: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      web_topics: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      zalo_link_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zalo_links: {
        Row: {
          last_interaction_at: string | null
          linked_at: string
          status: string
          user_id: string
          zalo_user_id: string
        }
        Insert: {
          last_interaction_at?: string | null
          linked_at?: string
          status?: string
          user_id: string
          zalo_user_id: string
        }
        Update: {
          last_interaction_at?: string | null
          linked_at?: string
          status?: string
          user_id?: string
          zalo_user_id?: string
        }
        Relationships: []
      }
      zalo_oa_config: {
        Row: {
          access_token: string | null
          app_id: string | null
          app_secret: string | null
          auto_send: boolean
          base_url: string | null
          care_cron_token: string | null
          care_enabled: boolean
          care_hour: number
          care_last_run: string | null
          care_stale_days: number
          care_wait_hours: number
          id: number
          last_error: string | null
          oa_id: string | null
          oa_name: string | null
          oa_secret_key: string | null
          oauth_state: string | null
          oauth_verifier: string | null
          refresh_token: string | null
          status: string
          test_send_at: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          app_id?: string | null
          app_secret?: string | null
          auto_send?: boolean
          base_url?: string | null
          care_cron_token?: string | null
          care_enabled?: boolean
          care_hour?: number
          care_last_run?: string | null
          care_stale_days?: number
          care_wait_hours?: number
          id?: number
          last_error?: string | null
          oa_id?: string | null
          oa_name?: string | null
          oa_secret_key?: string | null
          oauth_state?: string | null
          oauth_verifier?: string | null
          refresh_token?: string | null
          status?: string
          test_send_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          app_id?: string | null
          app_secret?: string | null
          auto_send?: boolean
          base_url?: string | null
          care_cron_token?: string | null
          care_enabled?: boolean
          care_hour?: number
          care_last_run?: string | null
          care_stale_days?: number
          care_wait_hours?: number
          id?: number
          last_error?: string | null
          oa_id?: string | null
          oa_name?: string | null
          oa_secret_key?: string | null
          oauth_state?: string | null
          oauth_verifier?: string | null
          refresh_token?: string | null
          status?: string
          test_send_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      att_note: { Args: { _id: string; _note: string }; Returns: undefined }
      att_recall: { Args: { _id: string }; Returns: undefined }
      att_reconcile: {
        Args: { _id: string; _note: string }
        Returns: undefined
      }
      att_submit: {
        Args: {
          _date: string
          _detail: string
          _in: string
          _kind: string
          _out: string
          _reason_id: string
          _witness: string
        }
        Returns: string
      }
      att_update: {
        Args: {
          _date: string
          _detail: string
          _id: string
          _in: string
          _kind: string
          _out: string
          _reason_id: string
          _witness: string
        }
        Returns: undefined
      }
      att_witness: {
        Args: { _confirm: boolean; _id: string; _note: string }
        Returns: undefined
      }
      att_witnesses: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
      branding_save: {
        Args: {
          _app_name: string
          _description: string
          _favicon_url: string
          _logo_url: string
          _org_name: string
          _short_name: string
        }
        Returns: undefined
      }
      can_edit_signal_catalog: { Args: { _uid: string }; Returns: boolean }
      content_notify_save: { Args: { _data: Json }; Returns: undefined }
      content_remind_run: { Args: never; Returns: number }
      cw_reviewer: { Args: { d: Json; st: string }; Returns: string }
      cw_uid: { Args: { _name: string }; Returns: string }
      get_profiles_directory: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          last_seen_at: string
          status: Database["public"]["Enums"]["account_status"]
          username: string
        }[]
      }
      goal_delete_empty: { Args: { _goal: string }; Returns: number }
      goal_links: { Args: { _goal: string }; Returns: Json }
      goal_purge_test: {
        Args: { _execute?: boolean; _goal: string }
        Returns: Json
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      is_active: { Args: { _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      leave_approvers: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
      leave_cancel_decide: {
        Args: { _approve: boolean; _id: string; _note: string }
        Returns: undefined
      }
      leave_cancel_request: {
        Args: { _id: string; _reason: string }
        Returns: undefined
      }
      leave_decide: {
        Args: { _approve: boolean; _id: string; _note: string }
        Returns: undefined
      }
      leave_exception_cancel: {
        Args: { _id: string; _reason: string }
        Returns: undefined
      }
      leave_reason_usage: { Args: { _id: string }; Returns: number }
      leave_reassign: {
        Args: { _approver: string; _id: string; _note: string }
        Returns: undefined
      }
      leave_recall: { Args: { _id: string }; Returns: undefined }
      leave_resubmit: {
        Args: {
          _approver: string
          _detail: string
          _id: string
          _payload: Json
          _reason_id: string
        }
        Returns: undefined
      }
      leave_settings_get: { Args: never; Returns: Json }
      leave_settings_save: { Args: { _data: Json }; Returns: undefined }
      leave_submit: {
        Args: {
          _approver: string
          _detail: string
          _exception?: string
          _owner: string
          _payload: Json
          _reason_id: string
          _type: string
        }
        Returns: string
      }
      leave_update: {
        Args: {
          _approver: string
          _detail: string
          _id: string
          _payload: Json
          _reason_id: string
        }
        Returns: undefined
      }
      order_remind_run: { Args: never; Returns: number }
      push_subscribe: {
        Args: {
          _auth: string
          _device: string
          _endpoint: string
          _p256dh: string
        }
        Returns: undefined
      }
      push_unsubscribe: {
        Args: { _endpoint: string; _id: string }
        Returns: undefined
      }
      signal_assign: {
        Args: { _id: string; _user: string }
        Returns: undefined
      }
      signal_cancel: {
        Args: { _id: string; _reason: string; _undo?: boolean }
        Returns: undefined
      }
      signal_catalog_rename: {
        Args: { _new: string; _old: string; _scope: string }
        Returns: undefined
      }
      signal_catalog_usage: {
        Args: { _name: string; _scope: string }
        Returns: number
      }
      signal_reopen: {
        Args: { _id: string; _reason: string }
        Returns: undefined
      }
      signal_sale_update: {
        Args: {
          _channel?: string
          _event?: string
          _id: string
          _lost_reason: string
          _next: string
          _next_at?: string
          _note: string
          _revenue: number
          _status: string
        }
        Returns: undefined
      }
      signal_sales_list: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
    }
    Enums: {
      account_status:
        | "Chờ duyệt"
        | "Đang hoạt động"
        | "Tạm khóa"
        | "Từ chối"
        | "Lưu trữ"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: [
        "Chờ duyệt",
        "Đang hoạt động",
        "Tạm khóa",
        "Từ chối",
        "Lưu trữ",
      ],
    },
  },
} as const
