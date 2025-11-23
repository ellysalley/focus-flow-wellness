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
      active_rewards: {
        Row: {
          activated_at: string
          id: string
          reward_data: Json | null
          reward_type: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          id?: string
          reward_data?: Json | null
          reward_type: string
          user_id: string
        }
        Update: {
          activated_at?: string
          id?: string
          reward_data?: Json | null
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: number
          rarity: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: number
          rarity: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: number
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          duration: string
          icon_name: string
          id: number
          is_active: boolean | null
          title: string
          xp: number
        }
        Insert: {
          created_at?: string
          description: string
          duration: string
          icon_name: string
          id?: number
          is_active?: boolean | null
          title: string
          xp: number
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string
          icon_name?: string
          id?: number
          is_active?: boolean | null
          title?: string
          xp?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender?: string
          user_id?: string
        }
        Relationships: []
      }
      completed_challenges: {
        Row: {
          challenge_id: number
          completed_at: string
          id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          challenge_id: number
          completed_at?: string
          id?: string
          user_id: string
          xp_earned: number
        }
        Update: {
          challenge_id?: number
          completed_at?: string
          id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      redeemed_rewards: {
        Row: {
          id: string
          redeemed_at: string
          reward_cost: number
          reward_id: number
          reward_title: string
          user_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string
          reward_cost: number
          reward_id: number
          reward_title: string
          user_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string
          reward_cost?: number
          reward_id?: number
          reward_title?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards_catalog: {
        Row: {
          cost: number
          created_at: string
          description: string
          id: number
          is_active: boolean | null
          reward_data: Json | null
          reward_type: string
          title: string
        }
        Insert: {
          cost: number
          created_at?: string
          description: string
          id?: number
          is_active?: boolean | null
          reward_data?: Json | null
          reward_type: string
          title: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          id?: number
          is_active?: boolean | null
          reward_data?: Json | null
          reward_type?: string
          title?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: number
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          achievements_count: number
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          total_points: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_count?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_points?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_count?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_points?: number
          total_xp?: number
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
