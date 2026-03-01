const supabase = require('../config/supabase');

/**
 * UTILITY SCRIPT: Promote a user to Super Admin
 * Usage: node promote_user.js <phone_or_email>
 */

async function promote() {
    const identifier = process.argv[2];
    if (!identifier) {
        console.error("Usage: node promote_user.js <phone_or_email>");
        process.exit(1);
    }

    console.log(`Searching for user with identifier: ${identifier}...`);

    // 1. Find user in public.users
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .single();

    if (findError || !user) {
        console.error("User not found in public.users table. Make sure they have registered first.");
        process.exit(1);
    }

    console.log(`Found: ${user.full_name} (ID: ${user.id}, Current Role: ${user.role})`);

    // 2. Update role in public.users
    const { error: profileError } = await supabase
        .from('users')
        .update({ role: 'super_admin' })
        .eq('id', user.id);

    if (profileError) {
        console.error("Error updating profile role:", profileError);
        process.exit(1);
    }

    // 3. Update Auth metadata (so future logins have the correct role in token)
    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { role: 'super_admin' }
    });

    if (authError) {
        console.warn("User promoted in public.users, but failed to update Auth metadata:", authError);
    } else {
        console.log("Auth metadata updated successfully.");
    }

    console.log(`🎉 SUCCESS: ${user.full_name} is now a SUPER ADMIN.`);
    process.exit(0);
}

promote();
