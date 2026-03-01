const supabase = require('./config/supabase');

async function compareUsers() {
    const targetPhones = ['9876543210', '9876543211'];

    console.log('--- Fetching Auth Users ---');
    const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();

    console.log('--- Fetching Public Users ---');
    const { data: publicUsers, error: pubErr } = await supabase.from('users').select('id, phone, full_name');

    for (const phone of targetPhones) {
        console.log(`\nAnalyzing ${phone}:`);
        const authMatch = users.find(u => u.phone && u.phone.includes(phone));
        const pubMatch = publicUsers.find(u => u.phone && u.phone.includes(phone));

        console.log(`  Auth Phone:   "${authMatch ? authMatch.phone : 'NOT FOUND'}" (ID: ${authMatch ? authMatch.id : 'N/A'})`);
        console.log(`  Public Phone: "${pubMatch ? pubMatch.phone : 'NOT FOUND'}" (ID: ${pubMatch ? pubMatch.id : 'N/A'})`);
    }
}

compareUsers();
