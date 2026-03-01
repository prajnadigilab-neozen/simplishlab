const supabase = require('./config/supabase');

async function debugUsers() {
    const phones = ['9876543210', '9876543211'];

    console.log('--- Checking public.users table ---');
    for (const phone of phones) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`phone.eq.${phone},phone.eq.+91${phone}`);

        if (error) {
            console.error(`Error searching for ${phone}:`, error);
        } else {
            console.log(`Results for ${phone}:`, JSON.stringify(data, null, 2));
        }
    }

    console.log('--- Checking auth.users via admin API ---');
    // Note: This requires service role key which we should have in config/supabase
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing auth users:', listError);
    } else {
        const matches = users.filter(u =>
            phones.some(p => (u.phone && (u.phone.includes(p) || p.includes(u.phone))))
        );
        console.log(`Found ${matches.length} matches in auth.users`);
        matches.forEach(m => console.log(`- ID: ${m.id}, Phone: ${m.phone}, Email: ${m.email}`));
    }
}

debugUsers();
