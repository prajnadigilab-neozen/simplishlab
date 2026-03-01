const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
    console.log("--- Debugging Roles & RLS ---");

    // 1. Check Enum values
    const { data: enumValues, error: enumError } = await supabase.rpc('get_enum_values', { enum_type: 'user_role' });
    if (enumError) {
        console.log("Could not fetch enum values via RPC, trying manual query...");
        const { data: rawEnum, error: rawError } = await supabase.from('pg_type').select('typname').eq('typname', 'user_role');
        console.log("Enum Typename Check:", rawEnum, rawError);
    } else {
        console.log("User Role Enum Values:", enumValues);
    }

    // 2. Check current users and their roles
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .limit(10);

    if (usersError) {
        console.error("Error fetching users:", usersError);
    } else {
        console.log("Current Users in DB:", users);
    }

    // 3. Check RLS policies on lessons table
    console.log("\nNote: RLS policies are hard to check via JS client, but based on supabase_schema.sql:");
    console.log("Policy: 'Admins can manage lessons' UNLESS role IN ('admin', 'super_admin')");
}

debug();
