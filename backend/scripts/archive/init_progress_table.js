
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: 'd:/Prajna/Simplish/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// NOTE: Creating tables via Supabase JS client is NOT supported directly.
// You must run this SQL in the Supabase SQL Editor.

const sql = `
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    spent_time_ms BIGINT DEFAULT 0,
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress
FOR ALL TO authenticated USING (auth.uid() = user_id);
`;

console.log("PLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:");
console.log("---------------------------------------------------------");
console.log(sql);
console.log("---------------------------------------------------------");
