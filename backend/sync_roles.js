const supabase = require('./config/supabase');

async function syncRoles() {
    console.log('--- Syncing Roles to public.users ---');
    try {
        // 1. Find the user by phone
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, phone, role, full_name')
            .eq('phone', '9876543210');

        if (fetchError) throw fetchError;

        for (const user of users) {
            console.log(`Current: ${user.full_name} (${user.phone}) - Role: ${user.role}`);
            if (user.role !== 'super_admin') {
                console.log(`Promoting ${user.phone} to super_admin...`);
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'super_admin' })
                    .eq('id', user.id);

                if (updateError) {
                    console.error(`Failed to update ${user.phone}:`, updateError.message);
                } else {
                    console.log(`✅ ${user.phone} promoted.`);
                }
            }
        }

        // 2. Also ensure Auth metadata is correct
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        const adminUser = authUsers.find(u => u.phone === '919876543210' || u.phone === '9876543210' || u.phone?.includes('9876543210'));
        if (adminUser) {
            console.log(`Checking Auth metadata for user ${adminUser.id}...`);
            if (adminUser.user_metadata?.role !== 'super_admin') {
                console.log('Updating Auth metadata...');
                await supabase.auth.admin.updateUserById(adminUser.id, {
                    user_metadata: { ...adminUser.user_metadata, role: 'super_admin' }
                });
                console.log('✅ Auth metadata updated.');
            }
        }

    } catch (err) {
        console.error('Critical Error:', err.message);
    }
}

syncRoles();
