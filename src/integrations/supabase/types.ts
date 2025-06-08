export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          contact_name: string
          contact_user_id: string
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          contact_name: string
          contact_user_id: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          contact_name?: string
          contact_user_id?: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ids_scan_results: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          ml_features: Json | null
          scan_duration: number | null
          scan_type: string
          threat_detected: boolean | null
          threat_patterns_matched: Json | null
          transmission_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          ml_features?: Json | null
          scan_duration?: number | null
          scan_type: string
          threat_detected?: boolean | null
          threat_patterns_matched?: Json | null
          transmission_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          ml_features?: Json | null
          scan_duration?: number | null
          scan_type?: string
          threat_detected?: boolean | null
          threat_patterns_matched?: Json | null
          transmission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ids_scan_results_transmission_id_fkey"
            columns: ["transmission_id"]
            isOneToOne: false
            referencedRelation: "transmission_logs"
            referencedColumns: ["transmission_id"]
          },
        ]
      }
      key_rotation_events: {
        Row: {
          created_at: string | null
          id: string
          new_session_id: string
          old_session_id: string | null
          rotation_duration: number | null
          rotation_reason: string
          threat_info: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_session_id: string
          old_session_id?: string | null
          rotation_duration?: number | null
          rotation_reason: string
          threat_info?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          new_session_id?: string
          old_session_id?: string | null
          rotation_duration?: number | null
          rotation_reason?: string
          threat_info?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          encrypted: boolean | null
          encryption_algorithm: string | null
          id: string
          integrity_hash: string | null
          key_session_id: string | null
          message_type: string | null
          read_at: string | null
          recipient_id: string
          routing_path: Json | null
          sender_id: string
          threat_detected: boolean | null
          transmission_id: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          content: string
          created_at?: string | null
          encrypted?: boolean | null
          encryption_algorithm?: string | null
          id?: string
          integrity_hash?: string | null
          key_session_id?: string | null
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          routing_path?: Json | null
          sender_id: string
          threat_detected?: boolean | null
          transmission_id?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string | null
          encrypted?: boolean | null
          encryption_algorithm?: string | null
          id?: string
          integrity_hash?: string | null
          key_session_id?: string | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          routing_path?: Json | null
          sender_id?: string
          threat_detected?: boolean | null
          transmission_id?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          model_data: Json
          model_name: string
          model_type: string
          version: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_data: Json
          model_name: string
          model_type: string
          version?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_data?: Json
          model_name?: string
          model_type?: string
          version?: number | null
        }
        Relationships: []
      }
      network_connections: {
        Row: {
          created_at: string | null
          destination_node_id: string
          id: string
          is_secure: boolean | null
          source_node_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          destination_node_id: string
          id?: string
          is_secure?: boolean | null
          source_node_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          destination_node_id?: string
          id?: string
          is_secure?: boolean | null
          source_node_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "network_connections_destination_node_id_fkey"
            columns: ["destination_node_id"]
            isOneToOne: false
            referencedRelation: "network_nodes"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "network_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "network_nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      network_nodes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          node_id: string
          node_name: string
          security_metric: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          node_id: string
          node_name: string
          security_metric?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          node_id?: string
          node_name?: string
          security_metric?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      threat_patterns: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          pattern: string
          pattern_type: string
          threat_level: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern: string
          pattern_type: string
          threat_level: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern?: string
          pattern_type?: string
          threat_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transmission_logs: {
        Row: {
          created_at: string | null
          encryption_method: string
          id: string
          key_session_id: string
          message_hash: string
          processing_time: number | null
          recipient_id: string
          routing_path: Json
          sender_id: string
          status: string
          threat_detected: boolean | null
          threat_level: string | null
          transmission_id: string
          transmission_size: number | null
        }
        Insert: {
          created_at?: string | null
          encryption_method: string
          id?: string
          key_session_id: string
          message_hash: string
          processing_time?: number | null
          recipient_id: string
          routing_path: Json
          sender_id: string
          status: string
          threat_detected?: boolean | null
          threat_level?: string | null
          transmission_id: string
          transmission_size?: number | null
        }
        Update: {
          created_at?: string | null
          encryption_method?: string
          id?: string
          key_session_id?: string
          message_hash?: string
          processing_time?: number | null
          recipient_id?: string
          routing_path?: Json
          sender_id?: string
          status?: string
          threat_detected?: boolean | null
          threat_level?: string | null
          transmission_id?: string
          transmission_size?: number | null
        }
        Relationships: []
      }
      user_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_data: string
          key_type: string
          rotation_count: number | null
          rotation_reason: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_data: string
          key_type: string
          rotation_count?: number | null
          rotation_reason?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_data?: string
          key_type?: string
          rotation_count?: number | null
          rotation_reason?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_keys: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      find_shortest_path: {
        Args: { source_node: string; destination_node: string }
        Returns: {
          path: string[]
          total_weight: number
          security_score: number
        }[]
      }
      get_active_threat_patterns: {
        Args: Record<PropertyKey, never>
        Returns: {
          pattern: string
          threat_level: string
        }[]
      }
      search_users: {
        Args: { search_term: string }
        Returns: {
          id: string
          email: string
          full_name: string
          avatar_url: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
