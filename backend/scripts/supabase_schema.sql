-- SIMPLISH Supabase Migration Schema
-- This script sets up tables, types, and triggers for Supabase.

-- FRESH START: Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_xp_log CASCADE;
DROP TABLE IF EXISTS public.assessment_results CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.placement_questions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop Custom Types
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS learning_level;

-- 1. Create Custom Types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE learning_level AS ENUM ('Basic', 'Intermediate', 'Advanced', 'Expert');

-- 2. Profiles Table (public.users)
-- This table extends the Supabase Auth system.
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT, -- Optional
    phone TEXT UNIQUE, -- Primary identifier for many users
    password_hash TEXT, -- For legacy/migration support
    role user_role DEFAULT 'user',
    onboarding_completed BOOLEAN DEFAULT false,
    current_level learning_level,
    streak_count INT DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level learning_level NOT NULL,
    media_type TEXT,
    media_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'MCQ', 'Voice', 'Image'
    correct_answer TEXT NOT NULL,
    options JSONB, -- Array of strings for MCQ
    points INT DEFAULT 10,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    spent_time_ms INT DEFAULT 0,
    status TEXT DEFAULT 'started',
    completion_percentage INT DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. Placement Questions Table
CREATE TABLE IF NOT EXISTS public.placement_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    difficulty_level learning_level NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. User XP Log Table
CREATE TABLE IF NOT EXISTS public.user_xp_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Trigger: Handle User Creation
-- Automatically creates a entry in public.users when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, phone, role)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.email, 
        new.phone,
        COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_log ENABLE ROW LEVEL SECURITY;

-- 11. Policies

-- Lessons
DROP POLICY IF EXISTS "Public lessons are readable by everyone" ON public.lessons;
CREATE POLICY "Public lessons are readable by everyone" ON public.lessons
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons" ON public.lessons
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Assessments
DROP POLICY IF EXISTS "Authenticated users can read assessments" ON public.assessments;
CREATE POLICY "Authenticated users can read assessments" ON public.assessments
FOR SELECT TO authenticated USING (true);

-- Users
DROP POLICY IF EXISTS "Users can read/update own profile" ON public.users;
CREATE POLICY "Users can read/update own profile" ON public.users
FOR ALL USING (auth.uid() = id);

-- Questions
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;
CREATE POLICY "Authenticated users can read questions" ON public.questions
FOR SELECT TO authenticated USING (true);

-- Results
DROP POLICY IF EXISTS "Users can manage own results" ON public.assessment_results;
CREATE POLICY "Users can manage own results" ON public.assessment_results
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own results" ON public.assessment_results;
CREATE POLICY "Users can insert own results" ON public.assessment_results
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- XP Log
DROP POLICY IF EXISTS "Users can read own XP logs" ON public.user_xp_log;
CREATE POLICY "Users can read own XP logs" ON public.user_xp_log
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Placement Questions (Public Read)
DROP POLICY IF EXISTS "Placement questions are readable by everyone" ON public.placement_questions;
CREATE POLICY "Placement questions are readable by everyone" ON public.placement_questions
FOR SELECT USING (true);

-- 12. SYSTEM LOGS
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super Admins can read system logs" ON public.system_logs;
CREATE POLICY "Super Admins can read system logs" ON public.system_logs
FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin');

