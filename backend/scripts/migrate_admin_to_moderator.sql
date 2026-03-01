-- ============================================================
-- Migration: Add 'moderator' to user_role enum, then rename
-- existing 'admin' rows to 'moderator'
-- Run this ONCE in your Supabase SQL Editor (or psql)
-- ============================================================

-- Step 1: Add 'moderator' to the enum (safe to run even if it already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'moderator'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'moderator';
    END IF;
END$$;

-- Step 2: Update rows (must be in a separate transaction after enum commit)
-- Supabase SQL Editor auto-commits each statement, so this is fine.
UPDATE public.users
SET role = 'moderator'
WHERE role = 'admin';

-- Step 3: Verify — should return 0 rows after migration
SELECT id, full_name, role
FROM public.users
WHERE role = 'admin';

