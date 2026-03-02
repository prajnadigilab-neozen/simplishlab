require('dotenv').config();
const supabase = require('../config/supabase');

async function syncAllAdmins() {
    console.log('--- Generalized Admin Role Synchronization ---');
    try {
        // 1. List all users from Supabase Auth
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        console.log(`Found ${authUsers.length} total users in Auth.`);

        for (const authUser of authUsers) {
            const role = authUser.user_metadata?.role?.toLowerCase();
            const email = authUser.email;
            const phone = authUser.phone;

            if (role === 'admin' || role === 'super_admin' || role === 'moderator') {
                console.log(`Checking sync for ${role}: ${email || phone} (${authUser.id})`);

                // Update public.users table
                const { data: existingUser, error: fetchError } = await supabase
                    .from('users')
                    .select('id, role')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (fetchError) {
                    console.error(`Error fetching DB user ${authUser.id}:`, fetchError.message);
                    continue;
                }

                if (!existingUser) {
                    console.log(`User ${authUser.id} missing from public.users. Inserting...`);
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert([{
                            id: authUser.id,
                            full_name: authUser.user_metadata?.full_name || 'Admin',
                            email: email || null,
                            phone: phone || null,
                            role: role
                        }]);
                    if (insertError) console.error(`Insert failed:`, insertError.message);
                    else console.log(`✅ User inserted and synced.`);
                } else if (existingUser.role !== role) {
                    console.log(`Role mismatch in DB. Current: ${existingUser.role}, New: ${role}. Updating...`);
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ role: role })
                        .eq('id', authUser.id);
                    if (updateError) console.error(`Update failed:`, updateError.message);
                    else console.log(`✅ Role updated in DB.`);
                } else {
                    console.log(`✅ User already in sync.`);
                }
            }
        }

        console.log('--- Sync Completed ---');

    } catch (err) {
        console.error('Critical Sync Error:', err.message);
    }
}

syncAllAdmins();
