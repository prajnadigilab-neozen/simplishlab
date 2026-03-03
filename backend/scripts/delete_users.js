const supabase = require('../config/supabase');

/**
 * Maintenance script to delete all users from the database 
 * EXCEPT for the specified whitelisted phone number.
 * 
 * Usage: node scripts/delete_users.js
 */
async function deleteAllUsersExcept(whitelistPhone) {
    console.log('----------------------------------------------------');
    console.log(`🚀 STARTING USER CLEANUP`);
    console.log(`🔒 WHITELISTED PHONE: ${whitelistPhone}`);
    console.log('----------------------------------------------------');

    try {
        // 1. Fetch all profiles to map IDs to phone numbers
        const { data: profiles, error: profileError } = await supabase
            .from('users')
            .select('id, phone, full_name, role');

        if (profileError) {
            throw new Error(`Error fetching profiles: ${profileError.message}`);
        }

        console.log(`📊 Found ${profiles.length} total users in public.users.`);

        // 2. Filter target users
        const targets = profiles.filter(u => u.phone !== whitelistPhone);
        const adminAccount = profiles.find(u => u.phone === whitelistPhone);

        if (!adminAccount) {
            console.warn(`⚠️  WARNING: Whitelisted phone ${whitelistPhone} NOT found in database.`);
            console.log('Aborting to prevent accidental self-deletion.');
            return;
        }

        console.log(`🎯 Identified ${targets.length} users for deletion.`);
        console.log(`✅ Preserving: ${adminAccount.full_name} (${adminAccount.role})`);
        console.log('----------------------------------------------------');

        if (targets.length === 0) {
            console.log('✨ No other users found. Database is already clean!');
            return;
        }

        // 3. Process deletions via Admin Auth API
        // NOTE: Deleting from auth.users cascades to public.users and progress tables
        for (const user of targets) {
            process.stdout.write(`🗑️  Deleting ${user.full_name || 'User'} (${user.phone})... `);

            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

            if (deleteError) {
                console.log(`❌ FAILED: ${deleteError.message}`);
            } else {
                console.log(`✅ SUCCESS`);
            }
        }

        console.log('----------------------------------------------------');
        console.log('🏁 CLEANUP FINISHED SUCCESSFULLY');
        console.log('----------------------------------------------------');

    } catch (err) {
        console.error('\n❌ CRITICAL ERROR:', err.message);
    }
}

// Run the script
deleteAllUsersExcept('9686098582');
