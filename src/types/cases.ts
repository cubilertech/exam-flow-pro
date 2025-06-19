
export interface Subject {
  id: string;
  exam_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  subject_id: string;
  title: string;
  scenario: string;
  instructions?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CaseQuestion {
  id: string;
  case_id: string;
  question_text: string;
  correct_answer: string;
  hint?: string;
  explanation?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserCaseProgress {
  id: string;
  user_id: string;
  case_id: string;
  current_question_index: number;
  completed: boolean;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCaseAnswer {
  id: string;
  user_id: string;
  case_question_id: string;
  user_answer: string;
  answered_at: string;
  created_at: string;
}
