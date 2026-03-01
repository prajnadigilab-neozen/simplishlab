
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'd:/Prajna/Simplish/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const results = {};

    console.log('Fetching table list...');
    const { data: tables, error: tErr } = await supabase.rpc('get_tables');
    // If RPC doesn't exist, we'll try a raw query if possible, but Supabase JS doesn't support raw SQL easily.
    // We can try to query information_schema if we have permissions, but usually not.
    // Let's try to probe common names.

    async function check(name, query) {
        console.log(`Checking ${name}...`);
        try {
            const { data, error } = await query;
            if (error) {
                results[name] = { status: 'error', error };
            } else {
                results[name] = { status: 'ok', count: data?.length || (data ? 1 : 0) };
            }
        } catch (e) {
            results[name] = { status: 'exception', message: e.message };
        }
    }

    await check('lessons', supabase.from('lessons').select('*').limit(1));
    await check('user_progress', supabase.from('user_progress').select('*').limit(1));
    await check('lesson_progress', supabase.from('lesson_progress').select('*').limit(1));
    await check('user_lessons', supabase.from('user_lessons').select('*').limit(1));
    await check('assessments', supabase.from('assessments').select('*').limit(1));
    await check('assessment_results', supabase.from('assessment_results').select('*').limit(1));
    await check('placement_results_created_at', supabase.from('placement_results').select('id, created_at').limit(1));
    await check('placement_results_completed_at', supabase.from('placement_results').select('id, completed_at').limit(1));
    await check('leaderboard_join_users', supabase.from('placement_results').select('id, users(full_name)').limit(1));
    await check('leaderboard_join_user', supabase.from('placement_results').select('id, user(full_name)').limit(1));

    fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2));
    console.log('Done. Results written to debug_output.json');
    process.exit(0);
}

debug();
