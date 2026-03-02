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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_status: Database["public"]["Enums"]["attendance_status"]
          checked_in_at: string | null
          checked_in_by_user_id: string | null
          event_id: string
          id: string
          person_id: string
          source: Database["public"]["Enums"]["attendance_source"]
        }
        Insert: {
          attendance_status?: Database["public"]["Enums"]["attendance_status"]
          checked_in_at?: string | null
          checked_in_by_user_id?: string | null
          event_id: string
          id?: string
          person_id: string
          source?: Database["public"]["Enums"]["attendance_source"]
        }
        Update: {
          attendance_status?: Database["public"]["Enums"]["attendance_status"]
          checked_in_at?: string | null
          checked_in_by_user_id?: string | null
          event_id?: string
          id?: string
          person_id?: string
          source?: Database["public"]["Enums"]["attendance_source"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          custom_field_id: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["custom_field_entity"]
          id: string
          updated_at: string
          updated_by_user_id: string | null
          value_json: Json | null
        }
        Insert: {
          custom_field_id: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["custom_field_entity"]
          id?: string
          updated_at?: string
          updated_by_user_id?: string | null
          value_json?: Json | null
        }
        Update: {
          custom_field_id?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["custom_field_entity"]
          id?: string
          updated_at?: string
          updated_by_user_id?: string | null
          value_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          applies_to: Database["public"]["Enums"]["custom_field_entity"]
          created_at: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          is_active: boolean | null
          name: string
          options_json: Json | null
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["custom_field_entity"]
          created_at?: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          name: string
          options_json?: Json | null
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["custom_field_entity"]
          created_at?: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          options_json?: Json | null
        }
        Relationships: []
      }
      event_invites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          mailchimp_campaign_id: string | null
          person_id: string
          rsvp_token: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          mailchimp_campaign_id?: string | null
          person_id: string
          rsvp_token?: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          mailchimp_campaign_id?: string | null
          person_id?: string
          rsvp_token?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invites_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          city_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          end_datetime: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          location: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          city_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      language_tests: {
        Row: {
          answers_json: Json | null
          completed_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          language: string
          level_result_cefr: Database["public"]["Enums"]["cefr_level"] | null
          person_id: string
          score: number | null
          status: Database["public"]["Enums"]["language_test_status"]
          token: string
        }
        Insert: {
          answers_json?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          language?: string
          level_result_cefr?: Database["public"]["Enums"]["cefr_level"] | null
          person_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["language_test_status"]
          token?: string
        }
        Update: {
          answers_json?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          language?: string
          level_result_cefr?: Database["public"]["Enums"]["cefr_level"] | null
          person_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["language_test_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_tests_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          allergies: string | null
          birth_day: number | null
          birth_month: number | null
          birth_year: number | null
          citizenship: string | null
          consent_opt_in: boolean | null
          consent_source: Database["public"]["Enums"]["consent_source"] | null
          consent_timestamp: string | null
          country_of_origin: string | null
          created_at: string
          email: string
          engagement_status: string | null
          first_name: string
          heard_about_wow: string | null
          heard_about_wow_other_text: string | null
          id: string
          languages_other_text: string | null
          last_event_attended_at: string | null
          last_name: string
          last_rsvp_yes_at: string | null
          linkedin_url: string | null
          mailchimp_audience_id: string | null
          mailchimp_last_click_at: string | null
          mailchimp_last_open_at: string | null
          mailchimp_member_id: string | null
          media_consent: boolean | null
          media_consent_timestamp: string | null
          notes: string | null
          phone: string | null
          profession: string | null
          roles: string[] | null
          swedish_level_cefr_result:
            | Database["public"]["Enums"]["cefr_level"]
            | null
          swedish_level_simple_self_reported:
            | Database["public"]["Enums"]["swedish_level_simple"]
            | null
          swedish_level_status:
            | Database["public"]["Enums"]["swedish_level_status"]
            | null
          swedish_test_completed_at: string | null
          swedish_test_score: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          citizenship?: string | null
          consent_opt_in?: boolean | null
          consent_source?: Database["public"]["Enums"]["consent_source"] | null
          consent_timestamp?: string | null
          country_of_origin?: string | null
          created_at?: string
          email: string
          engagement_status?: string | null
          first_name: string
          heard_about_wow?: string | null
          heard_about_wow_other_text?: string | null
          id?: string
          languages_other_text?: string | null
          last_event_attended_at?: string | null
          last_name: string
          last_rsvp_yes_at?: string | null
          linkedin_url?: string | null
          mailchimp_audience_id?: string | null
          mailchimp_last_click_at?: string | null
          mailchimp_last_open_at?: string | null
          mailchimp_member_id?: string | null
          media_consent?: boolean | null
          media_consent_timestamp?: string | null
          notes?: string | null
          phone?: string | null
          profession?: string | null
          roles?: string[] | null
          swedish_level_cefr_result?:
            | Database["public"]["Enums"]["cefr_level"]
            | null
          swedish_level_simple_self_reported?:
            | Database["public"]["Enums"]["swedish_level_simple"]
            | null
          swedish_level_status?:
            | Database["public"]["Enums"]["swedish_level_status"]
            | null
          swedish_test_completed_at?: string | null
          swedish_test_score?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          citizenship?: string | null
          consent_opt_in?: boolean | null
          consent_source?: Database["public"]["Enums"]["consent_source"] | null
          consent_timestamp?: string | null
          country_of_origin?: string | null
          created_at?: string
          email?: string
          engagement_status?: string | null
          first_name?: string
          heard_about_wow?: string | null
          heard_about_wow_other_text?: string | null
          id?: string
          languages_other_text?: string | null
          last_event_attended_at?: string | null
          last_name?: string
          last_rsvp_yes_at?: string | null
          linkedin_url?: string | null
          mailchimp_audience_id?: string | null
          mailchimp_last_click_at?: string | null
          mailchimp_last_open_at?: string | null
          mailchimp_member_id?: string | null
          media_consent?: boolean | null
          media_consent_timestamp?: string | null
          notes?: string | null
          phone?: string | null
          profession?: string | null
          roles?: string[] | null
          swedish_level_cefr_result?:
            | Database["public"]["Enums"]["cefr_level"]
            | null
          swedish_level_simple_self_reported?:
            | Database["public"]["Enums"]["swedish_level_simple"]
            | null
          swedish_level_status?:
            | Database["public"]["Enums"]["swedish_level_status"]
            | null
          swedish_test_completed_at?: string | null
          swedish_test_score?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      person_cities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          person_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          person_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_cities_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_languages: {
        Row: {
          created_at: string
          id: string
          language_id: string
          person_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_id: string
          person_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_languages_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          event_id: string
          id: string
          person_id: string
          responded_at: string
          response: Database["public"]["Enums"]["rsvp_response"]
          source: Database["public"]["Enums"]["rsvp_source"]
        }
        Insert: {
          event_id: string
          id?: string
          person_id: string
          responded_at?: string
          response: Database["public"]["Enums"]["rsvp_response"]
          source?: Database["public"]["Enums"]["rsvp_source"]
        }
        Update: {
          event_id?: string
          id?: string
          person_id?: string
          responded_at?: string
          response?: Database["public"]["Enums"]["rsvp_response"]
          source?: Database["public"]["Enums"]["rsvp_source"]
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_cities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_city: { Args: { _city_id: string }; Returns: boolean }
      get_staff_city_ids: { Args: never; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hq_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "hq_admin" | "staff"
      attendance_source: "rsvp" | "walk_in"
      attendance_status: "arrived" | "late" | "no_show"
      cefr_level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      consent_source: "website_signup" | "event_walkin" | "import"
      custom_field_entity: "person" | "event"
      custom_field_type:
        | "text"
        | "number"
        | "boolean"
        | "single_select"
        | "multi_select"
        | "date"
      event_status: "draft" | "published" | "closed"
      event_type: "lunch" | "onegoal" | "gala" | "other"
      language_test_status: "invited" | "in_progress" | "completed"
      rsvp_response: "yes" | "no"
      rsvp_source: "rsvp_link" | "admin" | "manual"
      swedish_level_simple:
        | "Native"
        | "Fluent"
        | "Intermediate"
        | "Beginner"
        | "None"
        | "PreferNotToSay"
      swedish_level_status: "SelfReported" | "PendingTest" | "Tested"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["hq_admin", "staff"],
      attendance_source: ["rsvp", "walk_in"],
      attendance_status: ["arrived", "late", "no_show"],
      cefr_level: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"],
      consent_source: ["website_signup", "event_walkin", "import"],
      custom_field_entity: ["person", "event"],
      custom_field_type: [
        "text",
        "number",
        "boolean",
        "single_select",
        "multi_select",
        "date",
      ],
      event_status: ["draft", "published", "closed"],
      event_type: ["lunch", "onegoal", "gala", "other"],
      language_test_status: ["invited", "in_progress", "completed"],
      rsvp_response: ["yes", "no"],
      rsvp_source: ["rsvp_link", "admin", "manual"],
      swedish_level_simple: [
        "Native",
        "Fluent",
        "Intermediate",
        "Beginner",
        "None",
        "PreferNotToSay",
      ],
      swedish_level_status: ["SelfReported", "PendingTest", "Tested"],
    },
  },
} as const
