const supabase = require('./config/supabase');

async function migrateDatabase() {
    console.log('--- Adding status and deleted_at columns to users table ---');

    // Note: Supabase JS SDK doesn't support ALTER TABLE directly.
    // We would typically use the Supabase Dashboard SQL Editor or a migration tool.
    // However, we can try to use RPC if a suitable function exists, 
    // or just inform the user if we can't do it programmatically.

    // Let's try to check if they exist first, if not, we'll try to insert a test value to see if it fails.
    const { data, error } = await supabase.from('users').select('status, deleted_at').limit(1);

    if (error && error.message.includes('column "status" does not exist')) {
        console.log('Columns do not exist. Please run the following SQL in your Supabase SQL Editor:');
        console.log(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);

        // Since I cannot run SQL directly via the SDK's usual methods for schema changes,
        // I will assume for now that I should prompt the user or search for an RPC.
        // Actually, some setups have an 'exec_sql' RPC for migrations. Let's check.
    } else if (error) {
        console.error('Error checking columns:', error.message);
    } else {
        console.log('Columns already exist.');
    }
}

migrateDatabase();
