const supabase = require('./config/supabase');

const normalizeTo10Digits = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
        return cleaned.slice(-10);
    }
    return cleaned;
};

async function migrateUsers() {
    console.log('--- Starting 10-Digit Phone Number Migration ---');

    // 1. Fetch all users from public.users
    const { data: publicUsers, error: pubErr } = await supabase.from('users').select('id, phone');
    if (pubErr) {
        console.error('Error fetching public users:', pubErr);
        return;
    }

    // 2. Fetch all users from auth.users (requires service role key)
    const { data: { users: authUsers }, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
        console.error('Error fetching auth users:', authErr);
        return;
    }

    console.log(`Found ${publicUsers.length} users in public and ${authUsers.length} in auth.`);

    // Migrate Auth Users
    for (const user of authUsers) {
        if (!user.phone) continue;
        const normalized = normalizeTo10Digits(user.phone);
        if (normalized !== user.phone) {
            console.log(`Updating Auth User ${user.id}: "${user.phone}" -> "${normalized}"`);
            const { error } = await supabase.auth.admin.updateUserById(user.id, { phone: normalized });
            if (error) console.error(`  Failed to update Auth User ${user.id}:`, error.message);
        }
    }

    // Migrate Public Users
    for (const user of publicUsers) {
        if (!user.phone) continue;
        const normalized = normalizeTo10Digits(user.phone);
        if (normalized !== user.phone) {
            console.log(`Updating Public User ${user.id}: "${user.phone}" -> "${normalized}"`);
            const { error } = await supabase.from('users').update({ phone: normalized }).eq('id', user.id);
            if (error) console.error(`  Failed to update Public User ${user.id}:`, error.message);
        }
    }

    console.log('--- Migration Complete ---');
    process.exit(0);
}

migrateUsers();
