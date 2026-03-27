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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      city_data: {
        Row: {
          clima: string | null
          created_at: string | null
          custo_vida_medio: number | null
          foto_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          seguranca_index: number | null
        }
        Insert: {
          clima?: string | null
          created_at?: string | null
          custo_vida_medio?: number | null
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          seguranca_index?: number | null
        }
        Update: {
          clima?: string | null
          created_at?: string | null
          custo_vida_medio?: number | null
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          seguranca_index?: number | null
        }
        Relationships: []
      }
      contracts_audit: {
        Row: {
          created_at: string | null
          file_name: string | null
          findings_json: Json | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          findings_json?: Json | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          findings_json?: Json | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          name: string | null
          status: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          name?: string | null
          status?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          name?: string | null
          status?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journey_milestones: {
        Row: {
          created_at: string | null
          id: string
          milestone_name: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      poi_locations: {
        Row: {
          categoria: string
          cidade: string | null
          created_at: string | null
          descricao: string | null
          id: string
          latitude: number
          longitude: number
          nome: string
        }
        Insert: {
          categoria: string
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          latitude: number
          longitude: number
          nome: string
        }
        Update: {
          categoria?: string
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          latitude?: number
          longitude?: number
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          citizenship_status: string | null
          created_at: string | null
          entry_date: string | null
          id: string
          selected_profile: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          citizenship_status?: string | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          selected_profile?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          citizenship_status?: string | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          selected_profile?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      travel_logs: {
        Row: {
          created_at: string | null
          departure_date: string | null
          destination: string | null
          id: string
          return_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          departure_date?: string | null
          destination?: string | null
          id?: string
          return_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          departure_date?: string | null
          destination?: string | null
          id?: string
          return_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verified_providers: {
        Row: {
          avatar_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          link_afiliado: string | null
          name: string | null
          rating: number | null
          selo_status: string | null
          video_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          link_afiliado?: string | null
          name?: string | null
          rating?: number | null
          selo_status?: string | null
          video_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          link_afiliado?: string | null
          name?: string | null
          rating?: number | null
          selo_status?: string | null
          video_url?: string | null
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
    Enums: {},
  },
} as const
