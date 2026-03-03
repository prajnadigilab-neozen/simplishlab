const supabase = require('./config/supabase');

async function checkRLS() {
    console.log('--- Checking RLS on public.users ---');
    try {
        // We can't directly check RLS status via supabase-js easily without raw SQL,
        // but we can test if SERVICE_ROLE sees more than an AUTHENTICATED user.

        // 1. SERVICE_ROLE check
        const { count: serviceCount, data: serviceData } = await supabase.from('users').select('*', { count: 'exact' });
        console.log('Total users via SERVICE_ROLE:', serviceCount);
        console.log('User IDs:', serviceData.map(u => u.phone));

        // 2. Try to query with a search that might be scoped
        const { count: adminOnly } = await supabase.from('users').select('*', { count: 'exact' }).eq('role', 'super_admin');
        console.log('Super Admins count:', adminOnly);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkRLS();
