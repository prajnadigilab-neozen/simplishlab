-- Create Table for Placement Test History/Leaderboard
CREATE TABLE IF NOT EXISTS public.placement_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    score_percentage FLOAT NOT NULL,
    assigned_level learning_level NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own placement results" ON public.placement_results;
CREATE POLICY "Users can read own placement results" ON public.placement_results
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can read leaderboard" ON public.placement_results;
CREATE POLICY "Authenticated users can read leaderboard" ON public.placement_results
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own placement results" ON public.placement_results;
CREATE POLICY "Users can insert own placement results" ON public.placement_results
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
