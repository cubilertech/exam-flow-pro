export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
          email: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      case_questions: {
        Row: {
          case_id: string | null
          correct_answer: string
          created_at: string
          explanation: string | null
          hint: string | null
          id: string
          order_index: number | null
          question_text: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          correct_answer: string
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          order_index?: number | null
          question_text: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          order_index?: number | null
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          is_deleted_case: boolean | null
          order_index: number | null
          scenario: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_deleted_case?: boolean | null
          order_index?: number | null
          scenario: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_deleted_case?: boolean | null
          order_index?: number | null
          scenario?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          question_bank_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          question_bank_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          question_bank_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          created_at: string
          exam_id: string | null
          id: string
          question_id: string | null
        }
        Insert: {
          created_at?: string
          exam_id?: string | null
          id?: string
          question_id?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string | null
          id?: string
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          answers: Json
          completed_at: string
          correct_count: number
          id: string
          incorrect_count: number
          score: number
          time_taken: number
          user_exam_id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          correct_count?: number
          id?: string
          incorrect_count?: number
          score?: number
          time_taken?: number
          user_exam_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          correct_count?: number
          id?: string
          incorrect_count?: number
          score?: number
          time_taken?: number
          user_exam_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_user_exam_id_fkey"
            columns: ["user_exam_id"]
            isOneToOne: false
            referencedRelation: "user_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          question_bank_id: string | null
          subscription_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          question_bank_id?: string | null
          subscription_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          question_bank_id?: string | null
          subscription_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      exams_case: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_deleted_exam: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_deleted_exam?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_deleted_exam?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      flagged_questions: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flagged_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          id: string
          phone_number: string | null
          status: string | null
          updated_at: string
          username: string | null
          email: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id: string
          phone_number?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          phone_number?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      question_banks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answered_correctly_count: number | null
          answered_count: number | null
          category_id: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          explanation: string | null
          id: string
          image_url: string | null
          serial_number: string
          text: string
          updated_at: string
        }
        Insert: {
          answered_correctly_count?: number | null
          answered_count?: number | null
          category_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          serial_number?: string
          text: string
          updated_at?: string
        }
        Update: {
          answered_correctly_count?: number | null
          answered_count?: number | null
          category_id?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          serial_number?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          exams_case_id: string | null
          id: string
          is_deleted_subject: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exams_case_id?: string | null
          id?: string
          is_deleted_subject?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exams_case_id?: string | null
          id?: string
          is_deleted_subject?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_exams_case_id_fkey"
            columns: ["exams_case_id"]
            isOneToOne: false
            referencedRelation: "exams_case"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_case_answers: {
        Row: {
          answered_at: string | null
          case_question_id: string | null
          created_at: string
          id: string
          user_answer: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          case_question_id?: string | null
          created_at?: string
          id?: string
          user_answer: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          case_question_id?: string | null
          created_at?: string
          id?: string
          user_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_case_answers_case_question_id_fkey"
            columns: ["case_question_id"]
            isOneToOne: false
            referencedRelation: "case_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_case_progress: {
        Row: {
          case_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_question_index: number | null
          id: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          id?: string
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_question_index?: number | null
          id?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_case_progress_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exams: {
        Row: {
          category_ids: string[]
          completed: boolean
          created_at: string
          difficulty_levels: string[]
          exam_type: string
          id: string
          is_timed: boolean
          name: string
          question_bank_id: string
          question_count: number
          time_limit: number | null
          time_limit_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_ids: string[]
          completed?: boolean
          created_at?: string
          difficulty_levels: string[]
          exam_type: string
          id?: string
          is_timed?: boolean
          name: string
          question_bank_id: string
          question_count: number
          time_limit?: number | null
          time_limit_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_ids?: string[]
          completed?: boolean
          created_at?: string
          difficulty_levels?: string[]
          exam_type?: string
          id?: string
          is_timed?: boolean
          name?: string
          question_bank_id?: string
          question_count?: number
          time_limit?: number | null
          time_limit_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exams_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          question_bank_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          question_bank_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          question_bank_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_banks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_exam_cascade: {
        Args: { exam_id: string }
        Returns: undefined
      }
      generate_serial_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      question_type: "single" | "multiple" | "image-based"
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
      difficulty_level: ["easy", "medium", "hard"],
      question_type: ["single", "multiple", "image-based"],
    },
  },
} as const
