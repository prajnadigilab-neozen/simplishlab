-- Migration: Add spent_time_ms to user_progress and create audit_logs for Reports Dashboard

-- 1. Update user_progress to track duration
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS spent_time_ms BIGINT DEFAULT 0;

-- 2. Create audit_logs table to track deletions and critical events
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL, -- e.g., 'USER_DELETED', 'LESSON_DELETED'
    target_id UUID,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
