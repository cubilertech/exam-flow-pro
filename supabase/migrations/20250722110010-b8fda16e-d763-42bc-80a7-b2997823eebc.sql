
-- Add status column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended'));

-- Update the RLS policies to respect user status
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Active users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id AND status = 'active');

-- Allow admins to update user status
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;
CREATE POLICY "Admins can create profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
