
-- Add status column to profiles table
ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended'));

-- Create user audit log table for tracking admin actions
CREATE TABLE public.user_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log table
ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit log - only admins can view
CREATE POLICY "Admins can view audit log" ON public.user_audit_log FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can create audit log entries" ON public.user_audit_log FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Update profiles RLS policy to respect user status
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Active users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id AND status = 'active');

-- Admin can view all profiles regardless of status
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Allow admins to insert profiles (for user creation)
CREATE POLICY "Admins can create profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Update other tables to respect user status by creating a helper function
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create admin service function to create users
CREATE OR REPLACE FUNCTION public.admin_create_user(
  email TEXT,
  password TEXT,
  username TEXT,
  country TEXT DEFAULT NULL,
  gender TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  city TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Only admins can call this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- This would need to be handled in the application layer
  -- as we cannot directly create auth users from SQL
  RAISE EXCEPTION 'This function should be called from the application layer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
