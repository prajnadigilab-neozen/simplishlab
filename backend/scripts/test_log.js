const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Inserting test log...');
    const { error } = await supabaseAdmin.from('system_logs').insert([{
        event_type: 'manual_test_run',
        details: { deletedFiles: ['temp-123.tmp', 'junk.log'], deletedOrphanedUsers: 2, errors: [] }
    }]);

    if (error) {
        console.error('Failed to insert test log:', error.message);
    } else {
        console.log('Successfully inserted a test log into system_logs!');
    }
}
run();
