-- SIMPLISH Supabase Migration
-- Adds 'last_active_tab' to the 'user_progress' table for Universal Study Area state persistence.

-- 1. Add the column if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_progress'
          AND column_name = 'last_active_tab'
    ) THEN
        ALTER TABLE public.user_progress
        ADD COLUMN last_active_tab TEXT DEFAULT 'study';
    END IF;
END $$;

-- 2. Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_progress' AND column_name = 'last_active_tab';
