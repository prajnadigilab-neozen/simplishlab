const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // We try to insert a dummy log to see if the table exists
    const { error: probeError } = await supabaseAdmin.from('system_logs').select('id').limit(1);

    if (probeError && probeError.code === '42P01') {
        console.log('Table system_logs does not exist. Please run the SQL manually in your Supabase SQL Editor:');
        console.log(`
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
        `);
    } else if (probeError) {
        console.error('Check failed with error:', probeError.message);
    } else {
        console.log('system_logs table already exists!');
    }
}

run();
