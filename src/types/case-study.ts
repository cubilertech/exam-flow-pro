
// Case study related type definitions
export interface Case {
  id: string;
  title: string;
  scenario: string;
  instructions: string | null;
  subject_id: string; // Changed from number to string to match database
  order_index: number | null;
  is_deleted_case: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CaseInfo {
  id: string;
  title: string;
  scenario: string;
  instructions: string | null;
  subject_id: string;
  order_index: number | null;
  is_deleted_case: boolean | null;
  created_at: string;
  updated_at: string;
  question_count?: number; // Made optional
}

export interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  explanation: string | null;
  hint: string | null;
  case_id: string; // Changed from number to string
  order_index: number | null;
  created_at: string;
  updated_at: string;
  // Additional properties for exam results
  isCorrect?: boolean;
  userAnswer?: string;
  categoryId?: string;
  tags?: string[];
  difficulty?: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  description: string | null;
  exams_case_id: string; // Changed from number to string
  order_index: number | null;
  is_deleted_subject: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudyExamInfo {
  id: string;
  title: string;
  description: string | null;
  is_deleted_exam: boolean | null;
  created_at: string;
  updated_at: string;
  order_index?: number; // Made optional
}

export interface ExamResultData {
  id: string;
  score: number;
  correct_count: number;
  incorrect_count: number;
  time_taken: number;
  completed_at: string;
  answers: any;
  user_exam_id: string;
  user_id: string;
  // Removed isTimed as it doesn't exist in the database
}
