require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function migrate() {
    console.log("Starting DB Migration for lessons table...");
    try {
        // Since we can't easily run raw ALTER TABLE through standard supabase-js client
        // without enabling the postgres interface or RPC, we'll try an RPC call.
        // If that fails, we might need a direct REST call or ask the user to run it in Supabase Studio.

        // Let's create an RPC function on the fly using a direct query if possible.
        // Actually, Supabase JS doesn't support raw SQL queries. 
        // We will need to use an RPC function if it exists, OR use the `pg` package locally.

        console.log("Notice: Supabase JS client cannot run DDL (ALTER TABLE) directly.");
        console.log("Using `pg` to connect to PostgreSQL directly...");

        const { Client } = require('pg');

        // We need the postgres connection string. Let's see if we have it in env or construct it.
        // It's usually postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
        // If we don't have it, we will instruct the user to run the SQL in their Supabase SQL editor.

        console.log("Please run the following SQL command in your Supabase SQL Editor:");
        console.log(`
            ALTER TABLE public.lessons
            ADD COLUMN IF NOT EXISTS pdf_url TEXT,
            ADD COLUMN IF NOT EXISTS audio_url TEXT,
            ADD COLUMN IF NOT EXISTS video_url TEXT;
        `);

    } catch (err) {
        console.error("Migration error:", err);
    }
}

migrate();
