const supabase = require('./config/supabase');

async function checkUserSchema() {
    console.log('--- Checking User Table Schema ---');
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.error('Error fetching user sample:', error);
    } else if (data && data.length > 0) {
        console.log('User sample columns:', Object.keys(data[0]));
        console.log('Sample user:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No users found in public.users table.');
    }
}

checkUserSchema();
