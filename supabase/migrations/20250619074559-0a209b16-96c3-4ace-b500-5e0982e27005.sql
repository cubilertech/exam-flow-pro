
-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  instructions TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case questions table
CREATE TABLE public.case_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  hint TEXT,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user case progress table
CREATE TABLE public.user_case_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  current_question_index INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, case_id)
);

-- Create user case answers table
CREATE TABLE public.user_case_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_question_id UUID REFERENCES public.case_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, case_question_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies for subjects (readable by all authenticated users, writable by admins)
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS policies for cases (readable by subscribed users, writable by admins)
CREATE POLICY "Subscribed users can view cases" ON public.cases FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subjects s ON s.exam_id = (
      SELECT e.id FROM public.exams e 
      JOIN public.subjects sub ON sub.exam_id = e.id 
      WHERE sub.id = cases.subject_id
    )
    WHERE us.user_id = auth.uid() 
    AND us.question_bank_id = s.exam_id 
    AND us.is_active = true
  )
);
CREATE POLICY "Admins can manage cases" ON public.cases FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS policies for case questions (readable by subscribed users, writable by admins)
CREATE POLICY "Subscribed users can view case questions" ON public.case_questions FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.cases c ON c.id = case_questions.case_id
    JOIN public.subjects s ON s.id = c.subject_id
    WHERE us.user_id = auth.uid() 
    AND us.question_bank_id = s.exam_id 
    AND us.is_active = true
  )
);
CREATE POLICY "Admins can manage case questions" ON public.case_questions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- RLS policies for user case progress (users can only see/modify their own)
CREATE POLICY "Users can view their own case progress" ON public.user_case_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own case progress" ON public.user_case_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own case progress" ON public.user_case_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for user case answers (users can only see/modify their own)
CREATE POLICY "Users can view their own case answers" ON public.user_case_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own case answers" ON public.user_case_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own case answers" ON public.user_case_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_subjects_exam_id ON public.subjects(exam_id);
CREATE INDEX idx_cases_subject_id ON public.cases(subject_id);
CREATE INDEX idx_case_questions_case_id ON public.case_questions(case_id);
CREATE INDEX idx_user_case_progress_user_case ON public.user_case_progress(user_id, case_id);
CREATE INDEX idx_user_case_answers_user_question ON public.user_case_answers(user_id, case_question_id);
