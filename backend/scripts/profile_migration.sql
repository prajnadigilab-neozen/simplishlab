-- Migration: Add Profile Enrichment Fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update RLS if necessary (users can already update their own profiles)
-- This ensures the new columns are covered.
