require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const fs = require('fs');

async function dump() {
    const { data: authUsers } = await s.auth.admin.listUsers();
    const { data: dbUsers } = await s.from('users').select('*');

    const result = {
        auth: authUsers.map(u => ({ id: u.id, phone: u.phone, metadata: u.user_metadata })),
        db: dbUsers.map(u => ({ id: u.id, phone: u.phone, role: u.role }))
    };

    fs.writeFileSync('user_dump.json', JSON.stringify(result, null, 2));
    console.log('Dumped to user_dump.json');
}
dump().catch(err => {
    console.error('💥 FATAL DUMP ERROR:', err);
    process.exit(1);
});
