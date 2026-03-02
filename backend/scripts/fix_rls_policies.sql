-- STEP 2: Update RLS policies for 'lessons' and 'assessments' tables
-- Run this ONLY AFTER Step 1 (fix_rls_moderator.sql) has been executed successfully.

-- 1. Update RLS policies for 'lessons' table
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

-- 2. Update RLS policies for 'assessments' table
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
