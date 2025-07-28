
-- Add exams_case_id column to user_subscriptions table to support case study exam access
ALTER TABLE user_subscriptions 
ADD COLUMN exams_case_id uuid;

-- Add foreign key constraint to link to exams_case table
ALTER TABLE user_subscriptions 
ADD CONSTRAINT fk_user_subscriptions_exams_case 
FOREIGN KEY (exams_case_id) REFERENCES exams_case(id) ON DELETE CASCADE;

-- Update the existing constraint to allow either question_bank_id or exams_case_id
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS check_subscription_type;

-- Add constraint to ensure either question_bank_id or exams_case_id is provided (but not both)
ALTER TABLE user_subscriptions 
ADD CONSTRAINT check_subscription_type 
CHECK (
  (question_bank_id IS NOT NULL AND exams_case_id IS NULL) OR
  (question_bank_id IS NULL AND exams_case_id IS NOT NULL)
);
