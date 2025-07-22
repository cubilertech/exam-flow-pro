
-- Add submission_count column to user_case_progress to track how many times user submitted each case
ALTER TABLE public.user_case_progress 
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0;

-- Create an index for better performance when querying submission counts
CREATE INDEX IF NOT EXISTS idx_user_case_progress_user_case 
ON public.user_case_progress(user_id, case_id);
