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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          interaction_type: string
          mood_context: string | null
          user_id: string
          user_input: string | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          mood_context?: string | null
          user_id: string
          user_input?: string | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          mood_context?: string | null
          user_id?: string
          user_input?: string | null
        }
        Relationships: []
      }
      community_trees: {
        Row: {
          created_at: string
          growth_level: number | null
          id: string
          positive_whisper: string | null
          tree_type: string | null
          updated_at: string
          user_id: string
          whisper_generated_at: string | null
        }
        Insert: {
          created_at?: string
          growth_level?: number | null
          id?: string
          positive_whisper?: string | null
          tree_type?: string | null
          updated_at?: string
          user_id: string
          whisper_generated_at?: string | null
        }
        Update: {
          created_at?: string
          growth_level?: number | null
          id?: string
          positive_whisper?: string | null
          tree_type?: string | null
          updated_at?: string
          user_id?: string
          whisper_generated_at?: string | null
        }
        Relationships: []
      }
      companion_states: {
        Row: {
          animation_state: string | null
          companion_type: string | null
          created_at: string
          id: string
          last_interaction: string | null
          mood_state: string | null
          personality_traits: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          animation_state?: string | null
          companion_type?: string | null
          created_at?: string
          id?: string
          last_interaction?: string | null
          mood_state?: string | null
          personality_traits?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          animation_state?: string | null
          companion_type?: string | null
          created_at?: string
          id?: string
          last_interaction?: string | null
          mood_state?: string | null
          personality_traits?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_questions: {
        Row: {
          answered_at: string | null
          created_at: string
          id: string
          points_earned: number | null
          question_text: string
          question_type: string
          user_id: string
          user_response: string | null
        }
        Insert: {
          answered_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          question_text: string
          question_type?: string
          user_id: string
          user_response?: string | null
        }
        Update: {
          answered_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          question_text?: string
          question_type?: string
          user_id?: string
          user_response?: string | null
        }
        Relationships: []
      }
      mini_game_scores: {
        Row: {
          completion_time: number | null
          created_at: string
          game_type: string
          id: string
          perfect_score: boolean | null
          score: number | null
          user_id: string
        }
        Insert: {
          completion_time?: number | null
          created_at?: string
          game_type: string
          id?: string
          perfect_score?: boolean | null
          score?: number | null
          user_id: string
        }
        Update: {
          completion_time?: number | null
          created_at?: string
          game_type?: string
          id?: string
          perfect_score?: boolean | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mood_sessions: {
        Row: {
          ai_response: string | null
          choices: Json | null
          completed_at: string | null
          created_at: string
          experience_gained: number | null
          id: string
          mood_detected: string | null
          session_type: string
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          choices?: Json | null
          completed_at?: string | null
          created_at?: string
          experience_gained?: number | null
          id?: string
          mood_detected?: string | null
          session_type: string
          user_id: string
        }
        Update: {
          ai_response?: string | null
          choices?: Json | null
          completed_at?: string | null
          created_at?: string
          experience_gained?: number | null
          id?: string
          mood_detected?: string | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_companion: string | null
          current_level: number | null
          current_streak: number | null
          display_name: string | null
          id: string
          last_activity_date: string | null
          onboarding_completed: boolean | null
          total_experience: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_companion?: string | null
          current_level?: number | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          total_experience?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_companion?: string | null
          current_level?: number | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          total_experience?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          current_step: number | null
          id: string
          quest_data: Json | null
          quest_type: string
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          current_step?: number | null
          id?: string
          quest_data?: Json | null
          quest_type: string
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          current_step?: number | null
          id?: string
          quest_data?: Json | null
          quest_type?: string
          total_steps?: number | null
          updated_at?: string
          user_id?: string
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
