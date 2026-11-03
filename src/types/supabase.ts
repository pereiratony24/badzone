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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          player_id: string
          session_id: string
          status: string | null
        }
        Insert: {
          player_id: string
          session_id: string
          status?: string | null
        }
        Update: {
          player_id?: string
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          created_at: string | null
          date: string
          group_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          group_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          date?: string
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string | null
          default_duration_min: number | null
          description: string | null
          id: string
          max_players: number | null
          min_players: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          default_duration_min?: number | null
          description?: string | null
          id?: string
          max_players?: number | null
          min_players?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          default_duration_min?: number | null
          description?: string | null
          id?: string
          max_players?: number | null
          min_players?: number | null
          title?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          court_number: number | null
          created_at: string | null
          id: string
          next_match_id: string | null
          player1_id: string | null
          player1_partner_id: string | null
          player2_id: string | null
          player2_partner_id: string | null
          pool_name: string | null
          score_team1: number | null
          score_team2: number | null
          stage: string
          status: string | null
          tournament_id: string | null
          winner_team: number | null
        }
        Insert: {
          court_number?: number | null
          created_at?: string | null
          id?: string
          next_match_id?: string | null
          player1_id?: string | null
          player1_partner_id?: string | null
          player2_id?: string | null
          player2_partner_id?: string | null
          pool_name?: string | null
          score_team1?: number | null
          score_team2?: number | null
          stage: string
          status?: string | null
          tournament_id?: string | null
          winner_team?: number | null
        }
        Update: {
          court_number?: number | null
          created_at?: string | null
          id?: string
          next_match_id?: string | null
          player1_id?: string | null
          player1_partner_id?: string | null
          player2_id?: string | null
          player2_partner_id?: string | null
          pool_name?: string | null
          score_team1?: number | null
          score_team2?: number | null
          stage?: string
          status?: string | null
          tournament_id?: string | null
          winner_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player1_partner_id_fkey"
            columns: ["player1_partner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_partner_id_fkey"
            columns: ["player2_partner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          active: boolean | null
          created_at: string | null
          first_name: string
          group_id: string | null
          id: string
          last_name: string
          level: string | null
          preferred_format: string | null
          seed_rank: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          first_name: string
          group_id?: string | null
          id?: string
          last_name: string
          level?: string | null
          preferred_format?: string | null
          seed_rank?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          first_name?: string
          group_id?: string | null
          id?: string
          last_name?: string
          level?: string | null
          preferred_format?: string | null
          seed_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          player_id: string
          pool_name: string | null
          tournament_id: string
        }
        Insert: {
          player_id: string
          pool_name?: string | null
          tournament_id: string
        }
        Update: {
          player_id?: string
          pool_name?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          courts_count: number | null
          created_at: string | null
          format_type: string
          id: string
          points_to_win: number | null
          scoring_mode: string
          status: string | null
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          courts_count?: number | null
          created_at?: string | null
          format_type: string
          id?: string
          points_to_win?: number | null
          scoring_mode: string
          status?: string | null
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          courts_count?: number | null
          created_at?: string | null
          format_type?: string
          id?: string
          points_to_win?: number | null
          scoring_mode?: string
          status?: string | null
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: []
      }
      training_session_blocks: {
        Row: {
          duration_min: number
          exercise_id: string | null
          id: string
          order_index: number
          training_session_id: string | null
        }
        Insert: {
          duration_min: number
          exercise_id?: string | null
          id?: string
          order_index: number
          training_session_id?: string | null
        }
        Update: {
          duration_min?: number
          exercise_id?: string | null
          id?: string
          order_index?: number
          training_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_session_blocks_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_session_blocks_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          notes: string | null
          session_date: string
          title: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          title: string
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
