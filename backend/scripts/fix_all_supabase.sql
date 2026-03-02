-- 1. FIX ENUM TYPE (Run inside a DO block to avoid errors if already present)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'moderator') THEN
        ALTER TYPE public.user_role ADD VALUE 'moderator';
    END IF;
END
$$;

-- 2. FIX SCHEMA INCONSISTENCIES
-- Add missing columns to lessons table if they don't exist
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add missing columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. REFRESH RLS POLICIES FOR LESSONS
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons" ON public.lessons
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'moderator')
    )
);

-- Ensure public can still read lessons
DROP POLICY IF EXISTS "Public lessons are readable by everyone" ON public.lessons;
CREATE POLICY "Public lessons are readable by everyone" ON public.lessons
FOR SELECT USING (true);

-- 4. REFRESH RLS POLICIES FOR USERS (Allow admins to see everyone)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'moderator')
    )
    OR id = auth.uid()
);

-- 5. FIX RLS POLICIES FOR ASSESSMENTS (CASCADE DELETE depends on this)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;
CREATE POLICY "Admins can manage assessments" ON public.assessments
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'moderator')
    )
);
