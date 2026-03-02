require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function list() {
    const { data, error } = await s.from('users').select('phone, role');
    if (error) {
        console.error(error);
        return;
    }
    data.forEach(u => console.log(`${u.phone}: ${u.role}`));
}
list();
