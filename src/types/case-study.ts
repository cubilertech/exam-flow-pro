
export interface CaseQuestion {
  id: string;
  question_text: string;
  case_id: string;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

export interface CaseInfo {
  id: string;
  title: string;
  subject_id: string;
  scenario: string;
  order_index: number;
  question_count?: number;
  is_deleted_case: boolean;
}

export interface CaseStudyExamInfo {
  id: string;
  title: string;
  description: string;
  order_index?: number;
  created_at: string;
  subject_count?: number;
  is_deleted_exam: boolean;
  is_subscribed?: boolean;
}

export interface SubjectInfo {
  id: string;
  name: string;
  description: string;
  exams_case_id: string;
  order_index: number;
  case_count?: number;
  is_deleted_subject: boolean;
}

export interface ExamResultQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  explanation?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  userAnswer?: string;
  isCorrect?: boolean;
}
