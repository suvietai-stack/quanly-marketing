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
          signal_scope: string[]
          signal_scope_all: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          is_system?: boolean
          name: string
          permissions?: string[]
          signal_scope?: string[]
          signal_scope_all?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          permissions?: string[]
          signal_scope?: string[]
          signal_scope_all?: boolean
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
          oq_flow_id: string | null
          order_id: string | null
          ot_order_id: string | null
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
          oq_flow_id?: string | null
          order_id?: string | null
          ot_order_id?: string | null
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
          oq_flow_id?: string | null
          order_id?: string | null
          ot_order_id?: string | null
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
            foreignKeyName: "notifications_oq_flow_id_fkey"
            columns: ["oq_flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
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
            foreignKeyName: "notifications_ot_order_id_fkey"
            columns: ["ot_order_id"]
            isOneToOne: false
            referencedRelation: "ot_orders"
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
      oq_events: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: Json
          flow_id: string | null
          id: string
          item_id: string | null
          kind: string
          request_id: string
          round_no: number | null
          status_from: string | null
          status_to: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          flow_id?: string | null
          id?: string
          item_id?: string | null
          kind: string
          request_id: string
          round_no?: number | null
          status_from?: string | null
          status_to?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          flow_id?: string | null
          id?: string
          item_id?: string | null
          kind?: string
          request_id?: string
          round_no?: number | null
          status_from?: string | null
          status_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oq_events_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oq_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "oq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_flows: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assignee_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          code: string
          completed_at: string | null
          created_at: string
          current_round: number
          first_published_at: string | null
          id: string
          kind: string
          processing_started_at: string | null
          request_id: string
          status: string
          updated_at: string
          waiting_info: boolean
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assignee_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          code: string
          completed_at?: string | null
          created_at?: string
          current_round?: number
          first_published_at?: string | null
          id?: string
          kind: string
          processing_started_at?: string | null
          request_id: string
          status?: string
          updated_at?: string
          waiting_info?: boolean
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assignee_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          current_round?: number
          first_published_at?: string | null
          id?: string
          kind?: string
          processing_started_at?: string | null
          request_id?: string
          status?: string
          updated_at?: string
          waiting_info?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "oq_flows_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "oq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_info_requests: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          asked_at: string
          asked_by: string
          flow_id: string
          id: string
          question: string
          round_no: number
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asked_at?: string
          asked_by: string
          flow_id: string
          id?: string
          question: string
          round_no: number
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asked_at?: string
          asked_by?: string
          flow_id?: string
          id?: string
          question?: string
          round_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "oq_info_requests_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_item_images: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          created_by: string
          flow_id: string | null
          id: string
          info_request_id: string | null
          item_id: string
          path: string
          request_id: string
          round_no: number | null
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string
          created_by: string
          flow_id?: string | null
          id?: string
          info_request_id?: string | null
          item_id: string
          path: string
          request_id: string
          round_no?: number | null
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          created_by?: string
          flow_id?: string | null
          id?: string
          info_request_id?: string | null
          item_id?: string
          path?: string
          request_id?: string
          round_no?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oq_item_images_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oq_item_images_info_request_id_fkey"
            columns: ["info_request_id"]
            isOneToOne: false
            referencedRelation: "oq_info_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oq_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "oq_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oq_item_images_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "oq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_items: {
        Row: {
          code: string
          created_at: string
          customer_choice: string | null
          detail: string | null
          id: string
          name: string
          note: string | null
          position: number
          processing: string | null
          qty: number | null
          request_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          customer_choice?: string | null
          detail?: string | null
          id?: string
          name?: string
          note?: string | null
          position?: number
          processing?: string | null
          qty?: number | null
          request_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          customer_choice?: string | null
          detail?: string | null
          id?: string
          name?: string
          note?: string | null
          position?: number
          processing?: string | null
          qty?: number | null
          request_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oq_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "oq_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_requests: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code: string | null
          created_at: string
          creator_id: string
          delivery_date: string | null
          delivery_place: string | null
          draft_config: Json
          form_data: Json
          id: string
          items_mode: string
          note: string | null
          order_type: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          want_price: boolean
          want_progress: boolean
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string | null
          created_at?: string
          creator_id: string
          delivery_date?: string | null
          delivery_place?: string | null
          draft_config?: Json
          form_data?: Json
          id?: string
          items_mode?: string
          note?: string | null
          order_type?: string
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
          want_price?: boolean
          want_progress?: boolean
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string | null
          created_at?: string
          creator_id?: string
          delivery_date?: string | null
          delivery_place?: string | null
          draft_config?: Json
          form_data?: Json
          id?: string
          items_mode?: string
          note?: string | null
          order_type?: string
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
          want_price?: boolean
          want_progress?: boolean
        }
        Relationships: []
      }
      oq_responses: {
        Row: {
          author_id: string
          content: Json
          created_at: string
          flow_id: string
          id: string
          is_published: boolean
          published_at: string | null
          published_by: string | null
          round_id: string
          target: string
          updated_at: string
          version: number | null
        }
        Insert: {
          author_id: string
          content?: Json
          created_at?: string
          flow_id: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          published_by?: string | null
          round_id: string
          target: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          author_id?: string
          content?: Json
          created_at?: string
          flow_id?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          published_by?: string | null
          round_id?: string
          target?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oq_responses_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oq_responses_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "oq_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_rounds: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assignee_id: string
          completed_at: string | null
          config: Json
          created_at: string
          created_by: string
          first_published_at: string | null
          flow_id: string
          id: string
          items_snapshot: Json
          no: number
          request_note: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assignee_id: string
          completed_at?: string | null
          config?: Json
          created_at?: string
          created_by: string
          first_published_at?: string | null
          flow_id: string
          id?: string
          items_snapshot?: Json
          no: number
          request_note?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assignee_id?: string
          completed_at?: string | null
          config?: Json
          created_at?: string
          created_by?: string
          first_published_at?: string | null
          flow_id?: string
          id?: string
          items_snapshot?: Json
          no?: number
          request_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oq_rounds_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "oq_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      oq_storage_cleanup: {
        Row: {
          attempts: number
          created_at: string
          done_at: string | null
          id: string
          last_error: string | null
          owner_id: string | null
          path: string
          reason: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          done_at?: string | null
          id?: string
          last_error?: string | null
          owner_id?: string | null
          path: string
          reason?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          done_at?: string | null
          id?: string
          last_error?: string | null
          owner_id?: string | null
          path?: string
          reason?: string | null
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
      ot_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          new: Json | null
          old: Json | null
          order_id: string
          reason: string | null
          task_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new?: Json | null
          old?: Json | null
          order_id: string
          reason?: string | null
          task_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new?: Json | null
          old?: Json | null
          order_id?: string
          reason?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ot_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ot_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_orders: {
        Row: {
          accepted_at: string | null
          address: string | null
          code: string
          completed_at: string | null
          created_at: string
          created_by: string
          crm_url: string | null
          due_date: string
          due_time: string | null
          has_box: boolean
          has_processing: boolean
          id: string
          note: string | null
          order_type: string
          original_due: string
          planned: boolean
          qty: number | null
          sale_id: string | null
          source: string
          status: string
          supply_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          address?: string | null
          code: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          crm_url?: string | null
          due_date: string
          due_time?: string | null
          has_box?: boolean
          has_processing?: boolean
          id?: string
          note?: string | null
          order_type: string
          original_due: string
          planned?: boolean
          qty?: number | null
          sale_id?: string | null
          source?: string
          status?: string
          supply_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          address?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          crm_url?: string | null
          due_date?: string
          due_time?: string | null
          has_box?: boolean
          has_processing?: boolean
          id?: string
          note?: string | null
          order_type?: string
          original_due?: string
          planned?: boolean
          qty?: number | null
          sale_id?: string | null
          source?: string
          status?: string
          supply_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ot_receipts: {
        Row: {
          actor_id: string
          id: string
          qty: number
          received_at: string
          task_id: string
        }
        Insert: {
          actor_id: string
          id?: string
          qty: number
          received_at?: string
          task_id: string
        }
        Update: {
          actor_id?: string
          id?: string
          qty?: number
          received_at?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ot_receipts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ot_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_reschedules: {
        Row: {
          created_at: string
          from_date: string
          id: string
          order_id: string
          parent_id: string | null
          proposed_date: string
          proposer_id: string
          reason: string
          responded_at: string | null
          responder_id: string | null
          response_note: string | null
          side: string
          status: string
        }
        Insert: {
          created_at?: string
          from_date: string
          id?: string
          order_id: string
          parent_id?: string | null
          proposed_date: string
          proposer_id: string
          reason: string
          responded_at?: string | null
          responder_id?: string | null
          response_note?: string | null
          side: string
          status?: string
        }
        Update: {
          created_at?: string
          from_date?: string
          id?: string
          order_id?: string
          parent_id?: string | null
          proposed_date?: string
          proposer_id?: string
          reason?: string
          responded_at?: string | null
          responder_id?: string | null
          response_note?: string | null
          side?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ot_reschedules_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ot_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_reschedules_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ot_reschedules"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_settings: {
        Row: {
          allow_manual: boolean
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_manual?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_manual?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ot_suppliers: {
        Row: {
          active: boolean
          address: string | null
          contact: string | null
          created_at: string
          created_by: string | null
          groups: string[]
          id: string
          name: string
          note: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by?: string | null
          groups?: string[]
          id?: string
          name: string
          note?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by?: string | null
          groups?: string[]
          id?: string
          name?: string
          note?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ot_tasks: {
        Row: {
          assignee_id: string | null
          contact_date: string | null
          created_at: string
          done_at: string | null
          id: string
          kind: string
          mail_by: string | null
          mail_due: string | null
          mail_sent_at: string | null
          note: string | null
          order_id: string
          ordered_at: string | null
          planned_arrival: string | null
          planned_date: string | null
          position: number
          proc_type: string | null
          qty: number | null
          send_planned: string | null
          sent_at: string | null
          sent_qty: number
          shipped_at: string | null
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          contact_date?: string | null
          created_at?: string
          done_at?: string | null
          id?: string
          kind: string
          mail_by?: string | null
          mail_due?: string | null
          mail_sent_at?: string | null
          note?: string | null
          order_id: string
          ordered_at?: string | null
          planned_arrival?: string | null
          planned_date?: string | null
          position?: number
          proc_type?: string | null
          qty?: number | null
          send_planned?: string | null
          sent_at?: string | null
          sent_qty?: number
          shipped_at?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          contact_date?: string | null
          created_at?: string
          done_at?: string | null
          id?: string
          kind?: string
          mail_by?: string | null
          mail_due?: string | null
          mail_sent_at?: string | null
          note?: string | null
          order_id?: string
          ordered_at?: string | null
          planned_arrival?: string | null
          planned_date?: string | null
          position?: number
          proc_type?: string | null
          qty?: number | null
          send_planned?: string | null
          sent_at?: string | null
          sent_qty?: number
          shipped_at?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ot_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ot_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_tasks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "ot_suppliers"
            referencedColumns: ["id"]
          },
        ]
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
      oq_accept: { Args: { _flow: string }; Returns: undefined }
      oq_answer_info: {
        Args: { _answer: string; _flow: string }
        Returns: undefined
      }
      oq_assignees: {
        Args: { _kind: string }
        Returns: {
          full_name: string
          id: string
        }[]
      }
      oq_cancel: {
        Args: { _flow: string; _id: string; _reason: string }
        Returns: undefined
      }
      oq_cleanup_done: {
        Args: { _error: string; _paths: string[] }
        Returns: undefined
      }
      oq_cleanup_pending: { Args: never; Returns: string[] }
      oq_comment: { Args: { _flow: string; _text: string }; Returns: undefined }
      oq_complete: { Args: { _flow: string }; Returns: undefined }
      oq_delete_cancelled: { Args: { _id: string }; Returns: undefined }
      oq_delete_draft: { Args: { _id: string }; Returns: undefined }
      oq_image_add: {
        Args: {
          _caption: string
          _category: string
          _item: string
          _path: string
        }
        Returns: string
      }
      oq_image_update: {
        Args: {
          _caption: string
          _category: string
          _delete: boolean
          _id: string
        }
        Returns: string
      }
      oq_info_image_add: {
        Args: {
          _caption: string
          _category: string
          _info: string
          _item: string
          _path: string
        }
        Returns: string
      }
      oq_info_image_delete: { Args: { _id: string }; Returns: undefined }
      oq_job_times: {
        Args: { _flows: string[] }
        Returns: {
          accept_wait_sec: number
          accepted_at: string
          completed_at: string
          data_ok: boolean
          final_accepted_at: string
          first_pub_sec: number
          first_published_at: string
          flow_id: string
          handover: boolean
          process_sec: number
          response_sec: number
          round_id: string
          round_no: number
          sent_at: string
          server_now: string
          status: string
          wait_sale_sec: number
        }[]
      }
      oq_missing: { Args: { _flow: string }; Returns: string[] }
      oq_publish_response: {
        Args: { _content: Json; _flow: string; _target: string }
        Returns: number
      }
      oq_reask: {
        Args: { _config: Json; _flow: string; _note: string; _snapshot: Json }
        Returns: number
      }
      oq_reassign: {
        Args: { _flow: string; _user: string }
        Returns: undefined
      }
      oq_report_rows: {
        Args: { _basis: string; _export?: boolean; _from: string; _to: string }
        Returns: {
          accept_wait_sec: number
          accepted_at: string
          assignee_id: string
          assignee_name: string
          completed_at: string
          creator_id: string
          creator_name: string
          data_ok: boolean
          final_accepted_at: string
          first_pub_sec: number
          first_published_at: string
          flow_code: string
          flow_id: string
          handover: boolean
          info_count: number
          items: number
          kind: string
          process_sec: number
          request_id: string
          response_sec: number
          round_id: string
          round_no: number
          scope: string
          sent_at: string
          status: string
          title: string
          wait_sale_sec: number
        }[]
      }
      oq_request_info: {
        Args: { _flow: string; _question: string }
        Returns: undefined
      }
      oq_save: { Args: { _data: Json; _id: string }; Returns: string }
      oq_save_response: {
        Args: { _content: Json; _flow: string; _target: string }
        Returns: undefined
      }
      oq_set_choice: {
        Args: { _choice: string; _item: string }
        Returns: undefined
      }
      oq_submit: { Args: { _id: string }; Returns: string }
      order_remind_run: { Args: never; Returns: number }
      order_take_job: { Args: { _id: string }; Returns: undefined }
      ot_accept: { Args: { _id: string }; Returns: undefined }
      ot_cancel: { Args: { _id: string; _reason: string }; Returns: undefined }
      ot_create: { Args: { _data: Json }; Returns: string }
      ot_fix_time: {
        Args: { _field: string; _reason: string; _task: string; _value: string }
        Returns: undefined
      }
      ot_people: {
        Args: never
        Returns: {
          full_name: string
          id: string
          sale: boolean
          supply: boolean
        }[]
      }
      ot_plan: {
        Args: {
          _has_box: boolean
          _has_proc: boolean
          _id: string
          _qty: number
        }
        Returns: undefined
      }
      ot_proc_add: { Args: { _data: Json; _order: string }; Returns: string }
      ot_reschedule_propose: {
        Args: { _date: string; _order: string; _reason: string }
        Returns: string
      }
      ot_reschedule_reply: {
        Args: {
          _counter: string
          _decision: string
          _id: string
          _note: string
        }
        Returns: undefined
      }
      ot_reschedule_withdraw: { Args: { _id: string }; Returns: undefined }
      ot_set_contact: {
        Args: { _date: string; _task: string }
        Returns: undefined
      }
      ot_settings_save: { Args: { _allow_manual: boolean }; Returns: undefined }
      ot_supplier_active: {
        Args: { _active: boolean; _id: string }
        Returns: undefined
      }
      ot_supplier_save: { Args: { _data: Json; _id: string }; Returns: string }
      ot_task_action: {
        Args: { _action: string; _qty?: number; _task: string }
        Returns: undefined
      }
      ot_task_update: {
        Args: { _data: Json; _task: string }
        Returns: undefined
      }
      ot_update_order: {
        Args: { _data: Json; _id: string }
        Returns: undefined
      }
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
