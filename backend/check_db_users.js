const supabase = require('./config/supabase');

async function checkUsers() {
    console.log('--- Checking public.users Table ---');
    try {
        const { data, count, error } = await supabase
            .from('users')
            .select('id, phone, role, full_name, status');

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log('Total users:', data.length);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Critical Error:', err.message);
    }
}
checkUsers();
