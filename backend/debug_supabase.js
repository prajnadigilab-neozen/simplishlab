const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);

        if (error) {
            console.error('Error querying users table:', error);
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
        } else {
            console.log('Successfully queried users table. Row count:', data.length);
            if (data.length > 0) {
                console.log('Columns found:', Object.keys(data[0]));
            }
        }
    } catch (err) {
        console.error('Unexpected error during Supabase query:', err);
    }
}

debug();
