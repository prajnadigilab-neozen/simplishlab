const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function cleanupOrphanedUsers() {
    console.log('--- Starting Orphaned Users Cleanup ---');
    try {
        // 1. Get all public API users
        console.log('Fetching users from public.users...');
        const { data: publicUsers, error: publicDbError } = await supabaseAdmin
            .from('users')
            .select('id');
        
        if (publicDbError) throw publicDbError;
        
        const publicUserIds = new Set(publicUsers.map(u => u.id));
        console.log(`Found ${publicUserIds.size} users in public.users table.`);

        // 2. Get all Auth users (paginated)
        console.log('Fetching users from auth.users...');
        let allAuthUsers = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({
                page: page,
                perPage: 1000,
            });
            if (error) throw error;
            
            if (data.users && data.users.length > 0) {
                allAuthUsers = [...allAuthUsers, ...data.users];
                page++;
            } else {
                hasMore = false;
            }
            
            // Failsafe exit condition
            if (data.users.length === 0) hasMore = false;
        }

        console.log(`Found ${allAuthUsers.length} total users in Supabase Auth.`);

        // 3. Find orphaned Auth users (in Auth but not in public DB)
        const orphanedUsers = allAuthUsers.filter(authUser => !publicUserIds.has(authUser.id));
        
        console.log(`\nFound ${orphanedUsers.length} orphaned Auth users (users deleted from public DB).`);

        if (orphanedUsers.length === 0) {
            console.log('No cleanup needed. Exiting.');
            return;
        }

        // 4. Delete the orphaned users
        console.log('\nStarting deletion...');
        let deletedCount = 0;
        let failedCount = 0;

        for (const user of orphanedUsers) {
            const phoneStr = user.phone ? `(Phone: ${user.phone})` : '';
            const emailStr = user.email ? `(Email: ${user.email})` : '';
            console.log(`Deleting Auth ID: ${user.id} ${phoneStr} ${emailStr}...`);
            
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
            
            if (deleteError) {
                console.error(`  -> Failed to delete: ${deleteError.message}`);
                failedCount++;
            } else {
                console.log('  -> Success');
                deletedCount++;
            }
        }

        console.log(`\n--- Cleanup Complete ---`);
        console.log(`Successfully deleted: ${deletedCount}`);
        console.log(`Failed to delete: ${failedCount}`);

    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

cleanupOrphanedUsers();
