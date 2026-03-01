const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Testing Supabase login with dummy credentials...');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
        });

        console.log('Result:', JSON.stringify({ data, error }, null, 2));

        if (error) {
            console.log('Caught expected error:', error.message);
        } else {
            console.log('Login successful (unexpected for dummy)');
        }
    } catch (err) {
        console.error('Unexpected throw during signInWithPassword:', err);
    }
}

testLogin();
